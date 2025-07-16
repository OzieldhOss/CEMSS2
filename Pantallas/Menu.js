// navbar.js - Código reutilizable para todas las páginas
document.addEventListener('DOMContentLoaded', function() {
  // Seleccionar elementos de forma genérica
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdown = document.querySelector('.dropdown');
  
  // Funcionalidad del menú hamburguesa
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.mobile-menu-item').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // Funcionalidad del dropdown en desktop
  if (dropdownToggle && dropdown) {
    dropdownToggle.addEventListener('click', function(e) {
      if (window.innerWidth > 768) {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('active');
      }
    });
  }
  
  // Cerrar menús al hacer clic fuera
  document.addEventListener('click', function(e) {
    // Para menú móvil
    if (mobileMenuBtn && mobileMenu && 
        !e.target.closest('.mobile-menu') && 
        !e.target.closest('.mobile-menu-btn')) {
      mobileMenuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
    }
    
    // Para menú desktop
    if (window.innerWidth > 768 && 
        dropdown && 
        !e.target.closest('.dropdown')) {
      dropdown.classList.remove('active');
    }
    
    // Restablecer scroll
    if (mobileMenu && !mobileMenu.classList.contains('active')) {
      document.body.classList.remove('no-scroll');
    }
  });
  
  // Adaptar comportamiento al cambiar tamaño de pantalla
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      // Restablecer estilos en desktop
      if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
      if (mobileMenu) mobileMenu.classList.remove('active');
      if (dropdown) dropdown.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  });
});