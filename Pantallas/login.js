document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: username,
        password: password
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirigir según el tipo de usuario
      if (data.user.tipo === 'administrador') {
        window.location.href = 'Administrador.html';
      } else if (data.user.tipo === 'profesor') {
        window.location.href = 'Maestros.html';
      } else {
        window.location.href = 'Alumnos.html';
      }
    } else {
      alert(data.error || 'Error en el login');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al conectar con el servidor');
  }
});