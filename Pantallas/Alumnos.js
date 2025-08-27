document.addEventListener('DOMContentLoaded', function() {
  // ===== CONTROL DEL SIDEBAR =====
  const showSidebarBtn = document.getElementById('show-sidebar-btn');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('close-sidebar');
  const sidebarOverlay = document.createElement('div');
  sidebarOverlay.className = 'sidebar-overlay';
  document.body.appendChild(sidebarOverlay);
  
  function showSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function hideSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  if(showSidebarBtn) showSidebarBtn.addEventListener('click', showSidebar);
  if(closeSidebar) closeSidebar.addEventListener('click', hideSidebar);
  sidebarOverlay.addEventListener('click', hideSidebar);

  // ===== MANEJO DE MATERIAS =====
  const materiaCards = document.querySelectorAll('.materia-card');
  const materiaActual = document.getElementById('materia-actual');
  const progresoMainBar = document.querySelector('.progreso-materia-main-bar');
  const progresoMainEstrella = document.querySelector('.progreso-materia-main-estrella');
  
  function setActiveMateria(card) {
    // Remover clase active de todas las tarjetas
    materiaCards.forEach(c => c.classList.remove('active'));
    
    // Añadir clase active a la tarjeta seleccionada
    card.classList.add('active');
    
    // Actualizar nombre de materia
    const materiaNombre = card.querySelector('h4').textContent;
    if(materiaActual) materiaActual.textContent = materiaNombre;
    
    // Actualizar progreso principal
    const progresoBar = card.querySelector('.progreso-materia-bar');
    const estrella = card.querySelector('.progreso-materia-estrella');
    
    if(progresoBar && progresoMainBar) {
      progresoMainBar.style.width = progresoBar.style.width;
    }
    
    if(estrella && progresoMainEstrella) {
      progresoMainEstrella.textContent = estrella.textContent;
    }
    
    // Mostrar actividades correspondientes
    document.querySelectorAll('.actividades-materia').forEach(act => {
      act.style.display = 'none';
    });
    
    const materiaId = card.getAttribute('data-materia');
    const actividadesMateria = document.querySelector(`.actividades-materia[data-materia="${materiaId}"]`);
    if(actividadesMateria) actividadesMateria.style.display = 'block';
    
    // Cerrar sidebar en móvil
    if(window.innerWidth <= 768) {
      hideSidebar();
    }
  }
  
  materiaCards.forEach(card => {
    card.addEventListener('click', function() {
      setActiveMateria(this);
    });
  });
  
  // Inicializar con la materia activa por defecto
  const materiaActiva = document.querySelector('.materia-card.active') || materiaCards[0];
  if(materiaActiva) {
    setActiveMateria(materiaActiva);
  }
  
  // ===== MANEJO DE REDIMENSIONAMIENTO =====
  window.addEventListener('resize', function() {
    if(window.innerWidth > 768) {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  
  // ===== BOTONES DE ACTIVIDADES =====
  document.querySelectorAll('.actividad-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      console.log('Botón clickeado:', this.textContent);
    });
  });
  
  // ===== SISTEMA DE NOTIFICACIONES =====
  const notificationBell = document.getElementById('notificationBell');
  const notificationBadge = document.getElementById('notificationBadge');
  const notificationPanel = document.getElementById('notificationPanel');
  const closeNotifications = document.getElementById('closeNotifications');
  const notificationList = document.querySelector('.notification-list');
  
  // Datos de ejemplo
  const fakeNotifications = [
    {
      id: 'notif-1',
      materia: 'fisica',
      actividad: 'tarea-problemas',
      message: 'Prof. Carlos Ruiz ha comentado en tu tarea "Problemas de Física"',
      comment: 'Recuerda incluir todos los pasos de desarrollo en tu solución.',
      time: 'Hace 2 horas',
      read: false
    },
    {
      id: 'notif-2',
      materia: 'matematicas',
      actividad: 'ejercicios-algebra',
      message: 'Prof. Laura Méndez ha calificado tu tarea',
      comment: 'Buen trabajo, pero revisa los ejercicios 15 y 18.',
      time: 'Hace 1 día',
      read: false
    }
  ];

  // Renderizar notificaciones
  function renderNotifications() {
    notificationList.innerHTML = '';
    
    fakeNotifications.forEach(notif => {
      const notifItem = document.createElement('div');
      notifItem.className = `notification-item ${notif.read ? '' : 'unread'}`;
      notifItem.setAttribute('data-materia', notif.materia);
      notifItem.setAttribute('data-actividad', notif.actividad);
      notifItem.setAttribute('data-notif-id', notif.id);
      
      notifItem.innerHTML = `
        <div class="notification-content">
          <p class="notification-message">${notif.message}</p>
          <p class="notification-comment">${notif.comment}</p>
        </div>
        <span class="notification-time">${notif.time}</span>
      `;
      
      notificationList.appendChild(notifItem);
    });
    
    // Actualizar badge
    const unreadCount = fakeNotifications.filter(n => !n.read).length;
    notificationBadge.textContent = unreadCount;
    notificationBadge.classList.toggle('hidden', unreadCount === 0);
  }

  // Marcar notificación como leída
  function markAsRead(notificationId) {
    const notification = fakeNotifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      renderNotifications();
    }
  }

  // Mostrar comentario en actividad
 function showActivityComment(materia, actividad) {
  // Ocultar todos los comentarios primero
  document.querySelectorAll('.comment-section').forEach(c => {
    c.style.display = 'none';
    c.innerHTML = ''; // Limpiar comentarios anteriores
  });
  
  // Buscar la notificación correspondiente
  const notificacion = fakeNotifications.find(n => 
    n.materia === materia && n.actividad === actividad
  );
  
  if (!notificacion) return;
  
  // Mostrar el comentario correspondiente
  const actividadItem = document.querySelector(
    `.actividades-materia[data-materia="${materia}"] .actividad-item[data-actividad="${actividad}"]`
  );
  
  if (actividadItem) {
    const commentSection = actividadItem.querySelector('.comment-section');
    if (commentSection) {
      // Crear el comentario basado en la notificación
      commentSection.innerHTML = `
        <div class="comment-item">
          <p class="comment-author"><strong>${notificacion.message.split(' ha ')[0]}</strong></p>
          <p class="comment-text">"${notificacion.comment}"</p>
          <span class="comment-time">${notificacion.time}</span>
        </div>
      `;
      commentSection.style.display = 'block';
      
      // Hacer scroll suave a la actividad
      actividadItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Resaltar la actividad temporalmente
      actividadItem.style.backgroundColor = '#f0f9ff';
      setTimeout(() => {
        actividadItem.style.backgroundColor = '';
      }, 2000);
    }
  }
}

  // Eventos de notificaciones
  notificationBell.addEventListener('click', function() {
    notificationPanel.classList.toggle('active');
    renderNotifications();
  });

  closeNotifications.addEventListener('click', function() {
    notificationPanel.classList.remove('active');
  });

  notificationList.addEventListener('click', function(e) {
    const notifItem = e.target.closest('.notification-item');
    if (notifItem) {
      const materia = notifItem.getAttribute('data-materia');
      const actividad = notifItem.getAttribute('data-actividad');
      const notifId = notifItem.getAttribute('data-notif-id');
      
      markAsRead(notifId);
      notificationPanel.classList.remove('active');
      
      const materiaCard = document.querySelector(`.materia-card[data-materia="${materia}"]`);
      if (materiaCard) {
        setActiveMateria(materiaCard);
        setTimeout(() => {
          showActivityComment(materia, actividad);
        }, 300);
      }
    }
  });

  // Inicializar
  renderNotifications();
});
// Agrega esto al final del event listener DOMContentLoaded, antes del cierre });

// ===== MANEJO DE PESTAÑAS DE PARCIALES =====
const parcialTabs = document.querySelectorAll('.parcial-tab');
const actividadesParciales = document.querySelectorAll('.actividades-parcial');

function setActiveParcial(tab) {
  // Remover clase active de todas las pestañas
  parcialTabs.forEach(t => t.classList.remove('active'));
  
  // Añadir clase active a la pestaña seleccionada
  tab.classList.add('active');
  
  // Ocultar todos los contenidos de parciales
  actividadesParciales.forEach(ap => {
    ap.style.display = 'none';
  });
  
  // Mostrar el contenido del parcial seleccionado
  const parcialId = tab.getAttribute('data-parcial');
  const parcialContent = document.querySelector(`.actividades-parcial[data-parcial="${parcialId}"]`);
  if (parcialContent) {
    parcialContent.style.display = 'block';
  }
}

parcialTabs.forEach(tab => {
  tab.addEventListener('click', function() {
    setActiveParcial(this);
  });
});

// Inicializar con el primer parcial activo
if (parcialTabs.length > 0) {
  setActiveParcial(parcialTabs[0]);
}