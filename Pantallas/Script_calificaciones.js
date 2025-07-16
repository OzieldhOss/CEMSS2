document.addEventListener('DOMContentLoaded', function() {
  // Menú móvil
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navButtons = document.querySelector('.nav-buttons');
  
  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      this.classList.toggle('active');
      navButtons.classList.toggle('active');
    });
  }
  
  // Pestañas de cuatrimestres
  const tabBtns = document.querySelectorAll('.tab-btn');
  const quarterTabs = document.querySelectorAll('.quarter-tab');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remover clase active de todos los botones y pestañas
      tabBtns.forEach(b => b.classList.remove('active'));
      quarterTabs.forEach(tab => tab.classList.remove('active'));
      
      // Agregar clase active al botón clickeado
      this.classList.add('active');
      
      // Mostrar la pestaña correspondiente
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // Simular progreso de calificaciones (solo para demostración)
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    // Calcular progreso basado en calificaciones ingresadas
    const pendingGrades = document.querySelectorAll('.grade-col.pending').length;
    const totalGrades = document.querySelectorAll('.grade-col').length;
    const completedGrades = totalGrades - pendingGrades;
    const progressPercentage = (completedGrades / totalGrades) * 100;
    
    progressBar.style.width = `${progressPercentage}%`;
    
    // Cambiar color según progreso
    if (progressPercentage < 30) {
      progressBar.style.backgroundColor = var(--danger-color);
    } else if (progressPercentage < 70) {
      progressBar.style.backgroundColor = var(--warning-color);
    } else {
      progressBar.style.backgroundColor = var(--success-color);
    }
  }
  
  // Botón de descarga PDF (simulado)
  const downloadBtn = document.querySelector('.download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      alert('Funcionalidad de descarga habilitada en la versión completa del sistema');
    });
  }
});