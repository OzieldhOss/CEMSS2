// ===== FUNCIONALIDAD DE LOGIN =====
document.getElementById('login-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Obtener valores del formulario
  const username = document.getElementById('username').value || 'Usuario';
  const password = document.getElementById('password').value;
  
  // Guardar el nombre del usuario
  localStorage.setItem('studentName', username);
  
  // Redirigir a la pantalla del alumno
  window.location.href = 'alumno.html';
  
  // Mensaje de bienvenida en consola
  console.log(`Bienvenido ${username}, redirigiendo al panel...`);
});

// ===== FUNCIONALIDAD DE LOGOUT =====
document.getElementById('logout-btn')?.addEventListener('click', function() {
  if(confirm('¿Estás seguro que deseas cerrar tu sesión?')) {
    localStorage.removeItem('studentName');
    window.location.href = 'index.html';
  }
});

// ===== FUNCIONALIDAD PRINCIPAL (ALUMNO.HTML) =====
document.addEventListener('DOMContentLoaded', function() {
  // Cargar nombre del alumno
  const studentName = localStorage.getItem('studentName') || 'Juan Pérez';
  document.getElementById('student-name')?.textContent = studentName;
  
  // ===== FUNCIONALIDAD DE CALIFICACIONES =====
  document.querySelectorAll('.dropdown-item')?.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const option = this.textContent;
      alert(`Mostrando: ${option}`);
      // Lógica para mostrar calificaciones
    });
  });
  
  // ===== FUNCIONALIDAD DE ACTIVIDADES =====
  document.querySelectorAll('.actividad-btn')?.forEach(btn => {
    btn.addEventListener('click', function() {
      const actividad = this.closest('.actividad-card')?.querySelector('h3')?.textContent;
      alert(`Acción para: ${actividad || 'actividad'}`);
    });
  });
  
  // ===== FUNCIONALIDAD DE FAVORITOS Y PROGRESO =====
  document.querySelectorAll('.progreso-estrella')?.forEach(estrella => {
    estrella.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('favorita');
      this.textContent = this.classList.contains('favorita') ? '🌟' : '⭐';
    });
  });
  
  document.querySelectorAll('.actividad-btn')?.forEach(btn => {
    btn.addEventListener('click', function() {
      const barra = this.closest('.actividad-item')?.querySelector('.progreso-bar');
      if (barra) {
        const porcentajeActual = parseInt(barra.style.width) || 0;
        const nuevoPorcentaje = Math.min(porcentajeActual + 25, 100);
        barra.style.width = `${nuevoPorcentaje}%`;
        
        if(nuevoPorcentaje === 100) {
          barra.style.backgroundColor = '#2ecc71';
        }
      }
    });
  });
});