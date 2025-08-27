document.addEventListener('DOMContentLoaded', function() {
  // ===== CARRUSEL DE NOTICIAS (INDEPENDIENTE) =====
const newsSlides = document.querySelectorAll('.bd-news-slide');
const newsPrevBtn = document.querySelector('.bd-news-prev');
const newsNextBtn = document.querySelector('.bd-news-next');
let currentNewsSlide = 0;

function showNewsSlide(index) {
  newsSlides.forEach(slide => slide.classList.remove('bd-active'));
  newsSlides[index].classList.add('bd-active');
}

if (newsPrevBtn && newsNextBtn) {
  newsPrevBtn.addEventListener('click', () => {
    currentNewsSlide = (currentNewsSlide - 1 + newsSlides.length) % newsSlides.length;
    showNewsSlide(currentNewsSlide);
  });
  
  newsNextBtn.addEventListener('click', () => {
    currentNewsSlide = (currentNewsSlide + 1) % newsSlides.length;
    showNewsSlide(currentNewsSlide);
  });
}

showNewsSlide(currentNewsSlide);

  // ===== CARRUSEL DE CALENDARIO =====
  const calendarAnnual = document.getElementById('bd-calendar-annual');
  const calendarPrevBtn = document.querySelector('.bd-calendar-carousel .bd-carousel-prev');
  const calendarNextBtn = document.querySelector('.bd-calendar-carousel .bd-carousel-next');
  
  // Declarar variables en el ámbito correcto
  let events = [];
  let currentYear, currentMonthIndex;
  
  if (calendarAnnual) {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                   "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonthIndex = today.getMonth();
    
    // Elementos del modal
    const eventModal = document.getElementById('eventModal');
    const closeModal = document.getElementById('closeModal');
    const cancelEventBtn = document.getElementById('cancelEvent');
    const saveEventBtn = document.getElementById('saveEvent');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventStartDateInput = document.getElementById('eventStartDate');
    const eventEndDateInput = document.getElementById('eventEndDate');
    const colorOptions = document.querySelectorAll('.bd-color-option');
    
    // Variables de estado
    let selectedDate = null;
    let selectedColor = '#ffebee';
    let selectedTextColor = '#b71c1c';
    
    // Cargar eventos desde localStorage
    function loadEvents() {
      try {
        const storedEvents = localStorage.getItem('calendarEvents');
        if (storedEvents) {
          events = JSON.parse(storedEvents);
          console.log('Eventos cargados:', events);
        }
      } catch (e) {
        console.error("Error al cargar eventos:", e);
        events = [];
      }
    }
    
    // Fechas importantes predefinidas
    const importantDates = [
      { day: 15, month: 10, year: 2025, type: 'important', title: 'Inicio de cuatrimestre' },
      { day: 20, month: 10, year: 2025, type: 'event', title: 'Entrega de proyectos' },
      { day: 5, month: 11, year: 2025, type: 'event', title: 'Convocatoria becas' }
    ];

    // Función para actualizar la leyenda con los eventos guardados
function updateCalendarLegend() {
  const legendContainer = document.querySelector('.bd-calendar-legend');
  const customLegendsContainer = document.getElementById('bd-custom-legends');
  
  // Limpiar solo los eventos personalizados (manteniendo los fijos)
  if (customLegendsContainer) {
    customLegendsContainer.innerHTML = '';
  }
  
  // Agrupar eventos por color (para evitar duplicados)
  const uniqueEvents = [];
  events.forEach(event => {
    if (!uniqueEvents.some(e => e.color === event.color && e.textColor === event.textColor)) {
      uniqueEvents.push(event);
    }
  });
  
  // Crear elementos de leyenda para eventos personalizados
  uniqueEvents.forEach(event => {
    const legendItem = document.createElement('div');
    legendItem.classList.add('bd-legend-item');
    legendItem.dataset.eventId = event.id;
    
    const legendColor = document.createElement('span');
    legendColor.classList.add('bd-legend-color');
    legendColor.style.backgroundColor = event.color;
    legendColor.style.borderColor = event.textColor;
    
    const legendText = document.createElement('span');
    legendText.textContent = event.title.length > 15 ? 
      event.title.substring(0, 12) + '...' : event.title;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('bd-delete-legend-btn');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Eliminar este evento';
    
    // Evento para eliminar leyenda individual
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      
      if (confirm('¿Está seguro de realizar esta acción?')) {
        // Eliminar todos los eventos con este color (mismo tipo)
        events = events.filter(e => e.id !== event.id);
        
        // Guardar en localStorage
        try {
          localStorage.setItem('calendarEvents', JSON.stringify(events));
          
          // Actualizar vista
          createCalendarMonths();
          updateCalendarLegend();
          
          // Mostrar mensaje de éxito
          showToast('Evento eliminado correctamente');
        } catch (error) {
          console.error("Error al eliminar evento:", error);
          alert('Error al eliminar el evento. Por favor intenta nuevamente.');
        }
      }
    });
    
    legendItem.appendChild(legendColor);
    legendItem.appendChild(legendText);
    legendItem.appendChild(deleteBtn);
    
    if (customLegendsContainer) {
      customLegendsContainer.appendChild(legendItem);
    }
  });
}

    // Crear todos los meses del calendario
    function createCalendarMonths() {
      calendarAnnual.innerHTML = '';
      
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthDiv = document.createElement('div');
        monthDiv.classList.add('bd-calendar-month');
        monthDiv.innerHTML = `<h3>${months[monthIndex]} ${currentYear}</h3>`;
        
        const gridDiv = document.createElement('div');
        gridDiv.classList.add('bd-calendar-grid');
        
        // Añadir días de la semana
        weekdays.forEach(day => {
          const weekdayDiv = document.createElement('div');
          weekdayDiv.classList.add('bd-calendar-weekday');
          weekdayDiv.textContent = day;
          gridDiv.appendChild(weekdayDiv);
        });
        
        const firstDay = new Date(currentYear, monthIndex, 1);
        const lastDay = new Date(currentYear, monthIndex + 1, 0);
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
          dayDiv.setAttribute('data-date', `${day}-${monthIndex}-${currentYear}`);
          
          const currentDate = new Date(currentYear, monthIndex, day);
          
          // Comprobar si es hoy
          if (day === today.getDate() && monthIndex === today.getMonth() && currentYear === today.getFullYear()) {
            dayDiv.classList.add('bd-today');
            dayDiv.title = "Hoy";
          }
          
          // Comprobar fechas importantes predefinidas
          importantDates.forEach(event => {
            if (event.day === day && event.month === monthIndex && event.year === currentYear) {
              dayDiv.classList.add(`bd-${event.type}-day`);
              dayDiv.title = event.title;
            }
          });
          
          // Comprobar eventos guardados
          applyEventsToDay(dayDiv, currentDate);
          
          // Agregar evento de clic para añadir nuevos eventos
          dayDiv.addEventListener('click', () => {
            openEventModal(currentDate);
          });
          
          gridDiv.appendChild(dayDiv);
        }
        
        monthDiv.appendChild(gridDiv);
        calendarAnnual.appendChild(monthDiv);
      }
      
      updateCalendarPosition();
      updateButtonStates();
    }

    // Función auxiliar para comparar fechas sin considerar la hora
    function isSameDate(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    }

    // ⬇️⬇️⬇️ NUEVA: parsear "YYYY-MM-DD" como fecha local (evita desfases por zona horaria)
    function parseLocalDate(isoYmd) {
      // Acepta 'YYYY-MM-DD'
      const [y, m, d] = isoYmd.split('-').map(Number);
      return new Date(y, (m || 1) - 1, d || 1);
    }
    // ⬆️⬆️⬆️

    // Aplicar eventos a un día específico - VERSIÓN CORREGIDA
    function applyEventsToDay(dayDiv, currentDate) {
      // Limpiar clases de evento existentes
      dayDiv.className = dayDiv.className.replace(/\bbd-event-\S+/g, '');
      dayDiv.className = dayDiv.className.replace(/\bevent-range-\S+/g, '');
      dayDiv.style.backgroundColor = '';
      dayDiv.style.color = '';
      dayDiv.removeAttribute('title');
      
      // Restaurar clases básicas
      dayDiv.classList.add('bd-calendar-day');
      
      // Comprobar si es hoy
      const today = new Date();
      if (isSameDate(currentDate, today)) {
        dayDiv.classList.add('bd-today');
        dayDiv.title = "Hoy";
      }
      
      // Comprobar fechas importantes predefinidas
      importantDates.forEach(event => {
        const eventDate = new Date(event.year, event.month, event.day);
        if (isSameDate(currentDate, eventDate)) {
          dayDiv.classList.add(`bd-${event.type}-day`);
          dayDiv.title = event.title;
        }
      });

      // Verificar eventos para este día (usando parseLocalDate para evitar desfases)
      const dayEvents = events.filter(event => {
        const eventStartDate = parseLocalDate(event.startDate);
        const eventEndDate = event.endDate ? parseLocalDate(event.endDate) : eventStartDate;
        
        // Crear fechas sin hora para comparación correcta
        const currentDateNoTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const startDateNoTime = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
        const endDateNoTime = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
        
        return currentDateNoTime >= startDateNoTime && currentDateNoTime <= endDateNoTime;
      });
      
      if (dayEvents.length > 0) {
        const mainEvent = dayEvents[0];
        dayDiv.title = mainEvent.title;
        
        const eventStartDate = parseLocalDate(mainEvent.startDate);
        const eventEndDate = mainEvent.endDate ? parseLocalDate(mainEvent.endDate) : eventStartDate;
        
        // Crear fechas sin hora para comparación
        const currentDateNoTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const startDateNoTime = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
        const endDateNoTime = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
        
        // Aplicar estilos según el tipo de día en el rango
        if (isSameDate(currentDateNoTime, startDateNoTime)) {
          if (isSameDate(currentDateNoTime, endDateNoTime)) {
            // Evento de un solo día
            dayDiv.style.backgroundColor = mainEvent.color;
            dayDiv.style.color = mainEvent.textColor;
            dayDiv.classList.add('bd-event-single');
          } else {
            // Inicio de rango
            dayDiv.style.backgroundColor = mainEvent.color;
            dayDiv.style.color = mainEvent.textColor;
            dayDiv.classList.add('bd-event-range-start');
          }
        } else if (isSameDate(currentDateNoTime, endDateNoTime)) {
          // Fin de rango
          dayDiv.style.backgroundColor = mainEvent.color;
          dayDiv.style.color = mainEvent.textColor;
          dayDiv.classList.add('bd-event-range-end');
        } else {
          // Medio de rango
          dayDiv.style.backgroundColor = mainEvent.color + '80'; // 80 = 50% de opacidad
          dayDiv.style.color = mainEvent.textColor;
          dayDiv.classList.add('bd-event-range-middle');
        }
      }
    }

    // Abrir modal para agregar evento - VERSIÓN MEJORADA
    function openEventModal(date) {
      selectedDate = date;
      eventTitleInput.value = '';
      
      // Formatear fecha correctamente (sin problemas de zona horaria)
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;
      
      eventStartDateInput.value = localDateStr;
      eventEndDateInput.value = localDateStr; // Establecer la misma fecha por defecto
      
      // Seleccionar el primer color por defecto
      if (colorOptions.length > 0) {
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        colorOptions[0].classList.add('selected');
        selectedColor = colorOptions[0].dataset.color;
        selectedTextColor = colorOptions[0].dataset.textColor;
      }
      
      eventModal.style.display = 'block';
    }
    
    // Cerrar modal
    function closeEventModal() {
      eventModal.style.display = 'none';
    }
    
    // Guardar evento
    function saveEvent() {
      const title = eventTitleInput.value.trim();
      const startDate = eventStartDateInput.value;
      const endDate = eventEndDateInput.value || startDate;
      
      if (!title) {
        alert('Por favor ingresa un título para el evento');
        return;
      }
      
      // Crear objeto de evento
      const newEvent = {
        title,
        type: 'custom',
        startDate,
        endDate: endDate !== startDate ? endDate : null,
        color: selectedColor,
        textColor: selectedTextColor,
        id: Date.now().toString()
      };
      
      events.push(newEvent);
      
      try {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        
        // Actualizar vista - recrear completamente el calendario
        closeEventModal();
        createCalendarMonths(); // Esto refresca todo el calendario
        updateCalendarLegend();
        
        // Mostrar mensaje de éxito
        showToast('Evento guardado correctamente');
      } catch (e) {
        console.error("Error al guardar evento:", e);
        alert('Error al guardar el evento. Por favor intenta nuevamente.');
      }
    }
    
    // Actualizar posición del calendario
    function updateCalendarPosition() {
      const monthWidth = document.querySelector('.bd-calendar-month')?.offsetWidth || 300;
      calendarAnnual.style.transform = `translateX(-${currentMonthIndex * monthWidth}px)`;
    }

    // Actualizar estado de los botones de navegación
    function updateButtonStates() {
      if (calendarPrevBtn) calendarPrevBtn.disabled = currentMonthIndex === 0;
      if (calendarNextBtn) calendarNextBtn.disabled = currentMonthIndex === 11;
    }

    // Event listeners
    if (closeModal) closeModal.addEventListener('click', closeEventModal);
    if (cancelEventBtn) cancelEventBtn.addEventListener('click', closeEventModal);
    if (saveEventBtn) saveEventBtn.addEventListener('click', saveEvent);

    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        selectedColor = option.dataset.color;
        selectedTextColor = option.dataset.textColor;
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
      });
    });
    
    // Navegación del calendario
    if (calendarPrevBtn) {
      calendarPrevBtn.addEventListener('click', () => {
        if (currentMonthIndex > 0) {
          currentMonthIndex--;
          updateCalendarPosition();
          updateButtonStates();
        }
      });
    }
    
    if (calendarNextBtn) {
      calendarNextBtn.addEventListener('click', () => {
        if (currentMonthIndex < 11) {
          currentMonthIndex++;
          updateCalendarPosition();
          updateButtonStates();
        }
      });
    }

    // Inicializar calendario
    loadEvents();
    createCalendarMonths();
    updateCalendarLegend();
    
    // Ajustar posición al redimensionar
    window.addEventListener('resize', () => {
      updateCalendarPosition();
    });

    // Función para limpiar el calendario (versión con modal)
    function setupClearCalendar() {
      const clearBtn = document.getElementById('clearCalendar');
      const clearModal = document.createElement('div');
      clearModal.className = 'bd-clear-modal';
      clearModal.innerHTML = `
        <div class="bd-clear-modal-content">
          <h3>¿Eliminar todos los eventos?</h3>
          <p>Esta acción eliminará permanentemente todos los eventos del calendario.</p>
          <div class="bd-clear-modal-actions">
            <button class="bd-clear-cancel">Cancelar</button>
            <button class="bd-clear-confirm">Eliminar todo</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(clearModal);
      
      clearBtn?.addEventListener('click', () => {
        clearModal.style.display = 'flex';
      });
      
      clearModal.querySelector('.bd-clear-cancel').addEventListener('click', () => {
        clearModal.style.display = 'none';
      });
      
      clearModal.querySelector('.bd-clear-confirm').addEventListener('click', () => {
        // Limpiar eventos
        localStorage.removeItem('calendarEvents');
        events = [];
        createCalendarMonths(); // Refrescar completamente el calendario
        updateCalendarLegend();
        
        // Cerrar modal y mostrar feedback
        clearModal.style.display = 'none';
        showToast('Calendario limpiado correctamente');
      });
    }

    // Función para mostrar notificación toast
    function showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'bd-toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('bd-toast-show');
      }, 100);
      
      setTimeout(() => {
        toast.classList.remove('bd-toast-show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // Llamar esta función al inicio
    setupClearCalendar();
  }
});
