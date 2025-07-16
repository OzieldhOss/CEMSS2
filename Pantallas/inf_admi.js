// inf_admi.js (versión corregida)
document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if(targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if(targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Animación suave al cargar las tarjetas
  const animateCards = () => {
    const cards = document.querySelectorAll('.process-step, .requirement-card, .quarter-card');
    
    cards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 0.1}s`;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      });
      
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.5s ease';
      observer.observe(card);
    });
  };
  
  animateCards();
});

// Toggle para certificado (mantener este código)
document.getElementById('certificateToggle').addEventListener('click', function() {
  const infoElement = document.getElementById('specialCaseInfo');
  infoElement.classList.toggle('show');
});