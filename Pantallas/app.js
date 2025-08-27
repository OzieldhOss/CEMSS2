// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cemss',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Rutas de autenticación
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Credenciales inválidas' });
    
    const token = jwt.sign(
      { id: user.id_usuario, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user.id_usuario, nombre: user.nombre, email: user.email, tipo: user.tipo } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Rutas de administrador
app.get('/api/cuatrimestres', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'administrador') return res.sendStatus(403);
  
  try {
    const [cuatrimestres] = await pool.query('SELECT * FROM cuatrimestres ORDER BY fecha_inicio DESC');
    res.json(cuatrimestres);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cuatrimestres' });
  }
});

app.post('/api/cuatrimestres', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'administrador') return res.sendStatus(403);
  
  const { nombre, fecha_inicio, fecha_fin, grupos } = req.body;
  
  try {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    
    try {
      const [result] = await conn.query(
        'INSERT INTO cuatrimestres (nombre, fecha_inicio, fecha_fin, creado_por) VALUES (?, ?, ?, ?)',
        [nombre, fecha_inicio, fecha_fin, req.user.id]
      );
      
      const idCuatrimestre = result.insertId;
      
      // Asignar grupos al cuatrimestre
      for (const idGrupo of grupos) {
        await conn.query(
          'INSERT INTO cuatrimestre_grupos (id_cuatrimestre, id_grupo) VALUES (?, ?)',
          [idCuatrimestre, idGrupo]
        );
      }
      
      await conn.commit();
      res.status(201).json({ id: idCuatrimestre });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear cuatrimestre' });
  }
});

// Rutas de actividades
app.post('/api/actividades', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'administrador' && req.user.tipo !== 'profesor') {
    return res.sendStatus(403);
  }
  
  const { id_materia, titulo, descripcion, tipo, fecha_entrega, puntos_maximos, contenido } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO actividades (id_materia, id_creador, titulo, descripcion, tipo, fecha_entrega, puntos_maximos, contenido) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id_materia, req.user.id, titulo, descripcion, tipo, fecha_entrega, puntos_maximos, JSON.stringify(contenido)]
    );
    
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear actividad' });
  }
});

app.get('/api/alumnos/:id/actividades', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar que el alumno existe
    const [alumnos] = await pool.query('SELECT * FROM alumnos WHERE id_alumno = ?', [id]);
    if (alumnos.length === 0) return res.status(404).json({ error: 'Alumno no encontrado' });
    
    // Obtener el grupo actual del alumno
    const [grupos] = await pool.query(
      'SELECT g.* FROM alumno_grupos ag JOIN grupos g ON ag.id_grupo = g.id_grupo WHERE ag.id_alumno = ? ORDER BY ag.id_cuatrimestre DESC LIMIT 1',
      [id]
    );
    
    if (grupos.length === 0) return res.json([]);
    
    const idGrupo = grupos[0].id_grupo;
    
    // Obtener las materias del grupo
    const [materias] = await pool.query(
      'SELECT m.* FROM grupo_materias gm JOIN materias m ON gm.id_materia = m.id_materia WHERE gm.id_grupo = ?',
      [idGrupo]
    );
    
    // Obtener actividades para cada materia
    const actividadesConMaterias = await Promise.all(
      materias.map(async materia => {
        const [actividades] = await pool.query(
          'SELECT a.* FROM actividades a WHERE a.id_materia = ? ORDER BY a.fecha_entrega',
          [materia.id_materia]
        );
        
        return {
          materia: {
            id: materia.id_materia,
            nombre: materia.nombre
          },
          actividades: actividades.map(act => ({
            ...act,
            contenido: act.contenido ? JSON.parse(act.contenido) : null,
            entregada: false, // Esto se debería verificar contra la tabla entregas_actividades
            calificacion: null
          }))
        };
      })
    );
    
    res.json(actividadesConMaterias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});