// Script para el carrusel de noticias y calendario anual
document.addEventListener('DOMContentLoaded', function() {
  // ===== CARRUSEL DE NOTICIAS =====
  const slides = document.querySelectorAll('.bd-news-slide');
  const prevBtn = document.querySelector('.bd-carousel-prev');
  const nextBtn = document.querySelector('.bd-carousel-next');
  let currentSlide = 0;
  
  // Mostrar el primer slide
  showSlide(currentSlide);
  
  // Event listeners para los botones
  prevBtn.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  });
  
  nextBtn.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  });
  
  // Función para mostrar un slide específico
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('bd-active'));
    slides[index].classList.add('bd-active');
  }

  // ===== CARRUSEL DE CALENDARIO =====
  const calendarAnnual = document.getElementById('bd-calendar-annual');
  const calendarPrevBtn = document.querySelector('.bd-calendar-carousel .bd-carousel-prev');
  const calendarNextBtn = document.querySelector('.bd-calendar-carousel .bd-carousel-next');
  
  if (calendarAnnual) {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                   "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const today = new Date();
    let currentMonthIndex = today.getMonth(); // Comenzar con el mes actual
    
    // Fechas importantes
    const importantDates = [
      { day: 15, month: 10, year: 2025, type: 'important', title: 'Inicio de cuatrimestre' },
      { day: 20, month: 10, year: 2025, type: 'event', title: 'Entrega de proyectos' },
      { day: 5, month: 11, year: 2025, type: 'event', title: 'Convocatoria becas' }
    ];

    // Crear todos los meses
    function createCalendarMonths() {
      calendarAnnual.innerHTML = '';
      
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthDiv = document.createElement('div');
        monthDiv.classList.add('bd-calendar-month');
        monthDiv.innerHTML = `<h3>${months[monthIndex]}</h3>`;
        
        const gridDiv = document.createElement('div');
        gridDiv.classList.add('bd-calendar-grid');
        
        // Añadir días de la semana
        weekdays.forEach(day => {
          const weekdayDiv = document.createElement('div');
          weekdayDiv.classList.add('bd-calendar-weekday');
          weekdayDiv.textContent = day;
          gridDiv.appendChild(weekdayDiv);
        });
        
        const firstDay = new Date(today.getFullYear(), monthIndex, 1);
        const lastDay = new Date(today.getFullYear(), monthIndex + 1, 0);
        const numDays = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Días vacíos para la primera semana
        for (let i = 0; i < startingDay; i++) {
          const emptyDay = document.createElement('div');
          emptyDay.classList.add('bd-calendar-day', 'bd-empty-day');
          gridDiv.appendChild(emptyDay);
        }
        
        // Días del mes
        for (let day = 1; day <= numDays; day++) {
          const dayDiv = document.createElement('div');
          dayDiv.classList.add('bd-calendar-day');
          dayDiv.textContent = day;
          
          // Comprobar si es hoy
          if (day === today.getDate() && monthIndex === today.getMonth() && today.getFullYear() === new Date().getFullYear()) {
            dayDiv.classList.add('bd-today');
            dayDiv.title = "Hoy";
          }
          
          // Comprobar fechas importantes
          importantDates.forEach(event => {
            if (event.day === day && event.month === monthIndex && event.year === today.getFullYear()) {
              dayDiv.classList.add(`bd-${event.type}-day`);
              dayDiv.title = event.title;
            }
          });
          
          gridDiv.appendChild(dayDiv);
        }
        
        monthDiv.appendChild(gridDiv);
        calendarAnnual.appendChild(monthDiv);
      }
      
      // Posicionar el mes actual
      updateCalendarPosition();
      updateButtonStates();
    }

    // Actualizar posición del calendario
    function updateCalendarPosition() {
      const monthWidth = document.querySelector('.bd-calendar-month').offsetWidth;
      calendarAnnual.style.transform = `translateX(-${currentMonthIndex * monthWidth}px)`;
    }

    // Actualizar estado de los botones
    function updateButtonStates() {
      calendarPrevBtn.disabled = currentMonthIndex === 0;
      calendarNextBtn.disabled = currentMonthIndex === 11;
    }

    // Navegación del calendario
    calendarPrevBtn.addEventListener('click', () => {
      if (currentMonthIndex > 0) {
        currentMonthIndex--;
        updateCalendarPosition();
        updateButtonStates();
      }
    });

    calendarNextBtn.addEventListener('click', () => {
      if (currentMonthIndex < 11) {
        currentMonthIndex++;
        updateCalendarPosition();
        updateButtonStates();
      }
    });

    // Inicializar calendario
    createCalendarMonths();

    // Ajustar posición al redimensionar
    window.addEventListener('resize', () => {
      updateCalendarPosition();
    });
  }
});