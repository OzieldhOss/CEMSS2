/* ============================
   ANIMACIONES DE SCROLL
============================ */
const scrollElements = document.querySelectorAll('.pl-section, .pl-feature-card, .pl-quarter-card, .pl-step');

const elementInView = (el, dividend = 1) => {
  const elementTop = el.getBoundingClientRect().top;
  return elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend;
};

const displayScrollElement = (element) => element.classList.add('visible');
const hideScrollElement = (element) => element.classList.remove('visible');

const handleScrollAnimation = () => {
  scrollElements.forEach((el) => {
    if (elementInView(el, 1.25)) displayScrollElement(el);
    else hideScrollElement(el);
  });
};

window.addEventListener('scroll', handleScrollAnimation);

document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.pl-hero');
  if (hero) hero.style.opacity = '1';
  handleScrollAnimation();
  setTimeout(() => (document.body.style.opacity = '1'), 100);
});

/* ============================
   ANIMACIÓN DE TABLA AL SCROLL
============================ */
document.addEventListener('DOMContentLoaded', function () {
  const tableRows = document.querySelectorAll('.pl-studies-table tr');

  tableRows.forEach((row, index) => {
    row.style.opacity = '0';
    row.style.transform = 'translateX(-20px)';
    row.style.transition = `opacity 0.5s ease, transform 0.5s ease ${index * 0.05}s`;
  });

  const animateTableOnScroll = () => {
    const tableSection = document.querySelector('.pl-table-section');
    if (!tableSection) return;

    const sectionTop = tableSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight * 0.75) {
      tableRows.forEach((row) => {
        row.style.opacity = '1';
        row.style.transform = 'translateX(0)';
      });
      window.removeEventListener('scroll', animateTableOnScroll);
    }
  };

  animateTableOnScroll();
  window.addEventListener('scroll', animateTableOnScroll);
});

/* ============================
   CAMBIO DE MODO DE VISTA
   (UNA SOLA TABLA, DINÁMICA)
============================ */
document.addEventListener('DOMContentLoaded', function () {
  const table = document.querySelector('.pl-studies-table');

  if (!table) return;

  // --- FUNCIONES DE CAMBIO ---
  function setDesktopView() {
    table.classList.remove('mobile-view');
    table.classList.add('desktop-view');
    // Aquí podrías ajustar columnas visibles, estilos, etc.
  }

  function setMobileView() {
    table.classList.remove('desktop-view');
    table.classList.add('mobile-view');
    // Aquí podrías hacer que se vea por cuatrimestre (ej. solo 1 columna activa)
  }

  function handleResize() {
    if (window.innerWidth < 768) setMobileView();
    else setDesktopView();
  }

  // Detectar al cargar y al redimensionar
  handleResize();
  window.addEventListener('resize', handleResize);
});

/* ============================
   FUNCIONALIDAD DE CUATRIMESTRES (solo móvil)
============================ */
document.addEventListener('DOMContentLoaded', function () {
  const quarterButtons = document.querySelectorAll('.pl-quarter-btn');
  const quarterCards = document.querySelectorAll('.pl-quarter-card');

  function changeQuarter(quarterNumber) {
    quarterButtons.forEach((btn) => btn.classList.remove('active'));
    document.querySelector(`.pl-quarter-btn[data-quarter="${quarterNumber}"]`)?.classList.add('active');

    quarterCards.forEach((card) => card.classList.remove('active'));
    document.querySelector(`.pl-quarter-card[data-quarter="${quarterNumber}"]`)?.classList.add('active');
  }

  quarterButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const quarter = this.getAttribute('data-quarter');
      changeQuarter(quarter);
    });
    button.addEventListener('keyup', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const quarter = this.getAttribute('data-quarter');
        changeQuarter(quarter);
      }
    });
  });

  // Animación para tarjetas en scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  quarterCards.forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
});

/* ============================
   FUNCIONALIDAD EXTRA DE TABLA (desktop)
============================ */
document.addEventListener('DOMContentLoaded', function () {
  const table = document.querySelector('.pl-studies-table');

  if (table) {
    // --- Accesibilidad ---
    table.setAttribute('role', 'grid');
    table.setAttribute('aria-label', 'Plan de estudios completo por cuatrimestre');

    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
      header.setAttribute('scope', 'col');
      header.id = `col-header-${index}`;
    });

    // --- Destacar filas ---
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      row.addEventListener('mouseenter', function () {
        this.style.backgroundColor = '#f0f8ff';
      });
      row.addEventListener('mouseleave', function () {
        if (!this.classList.contains('area-title') && !this.classList.contains('uac-total')) {
          this.style.backgroundColor = '';
        }
      });
    });

    // --- Scroll horizontal drag ---
    let isDragging = false;
    let startX, scrollLeft;

    table.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - table.offsetLeft;
      scrollLeft = table.scrollLeft;
      table.style.cursor = 'grabbing';
    });

    table.addEventListener('mouseleave', () => {
      isDragging = false;
      table.style.cursor = 'default';
    });

    table.addEventListener('mouseup', () => {
      isDragging = false;
      table.style.cursor = 'default';
    });

    table.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - table.offsetLeft;
      const walk = (x - startX) * 2;
      table.scrollLeft = scrollLeft - walk;
    });
  }
});

/* ============================
   FUNCIONALIDAD EXTRA DE TABLA (desktop)
============================ */
document.addEventListener('DOMContentLoaded', function () {
  const table = document.querySelector('.pl-studies-table');

  if (table) {
    // --- Accesibilidad ---
    table.setAttribute('role', 'grid');
    table.setAttribute('aria-label', 'Plan de estudios completo por cuatrimestre');

    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
      header.setAttribute('scope', 'col');
      header.id = `col-header-${index}`;
    });

    // --- Destacar filas ---
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      row.addEventListener('mouseenter', function () {
        if (!this.classList.contains('area-title') && !this.classList.contains('uac-total')) {
          this.style.backgroundColor = '#f0f8ff';
        }
      });
      row.addEventListener('mouseleave', function () {
        if (!this.classList.contains('area-title') && !this.classList.contains('uac-total')) {
          this.style.backgroundColor = '';
        }
      });
    });

    // --- Scroll horizontal drag ---
    let isDragging = false;
    let startX, scrollLeft;
    const tableContainer = document.querySelector('.pl-table-container');

    if (tableContainer) {
      tableContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - tableContainer.offsetLeft;
        scrollLeft = tableContainer.scrollLeft;
        tableContainer.style.cursor = 'grabbing';
      });

      tableContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        tableContainer.style.cursor = 'default';
      });

      tableContainer.addEventListener('mouseup', () => {
        isDragging = false;
        tableContainer.style.cursor = 'default';
      });

      tableContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - tableContainer.offsetLeft;
        const walk = (x - startX) * 2;
        tableContainer.scrollLeft = scrollLeft - walk;
      });
    }
  }
});

/* ============================
   ANIMACIÓN DE TABLA AL SCROLL
============================ */
document.addEventListener('DOMContentLoaded', function () {
  const tableRows = document.querySelectorAll('.pl-studies-table tr');

  tableRows.forEach((row, index) => {
    row.style.opacity = '0';
    row.style.transform = 'translateX(-20px)';
    row.style.transition = `opacity 0.5s ease, transform 0.5s ease ${index * 0.05}s`;
  });

  const animateTableOnScroll = () => {
    const tableSection = document.querySelector('.pl-desktop-table-section');
    if (!tableSection) return;

    const sectionTop = tableSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight * 0.75) {
      tableRows.forEach((row) => {
        row.style.opacity = '1';
        row.style.transform = 'translateX(0)';
      });
      window.removeEventListener('scroll', animateTableOnScroll);
    }
  };

  animateTableOnScroll();
  window.addEventListener('scroll', animateTableOnScroll);
});

/* ============================
   FUNCIONALIDAD PARA NUEVA TABLA DESKTOP
============================ */
document.addEventListener('DOMContentLoaded', function() {
  // Datos de las materias por cuatrimestre
  const quarterData = {
    1: {
      title: "Primer Cuatrimestre",
      subjects: [
        { category: "Lengua y comunicación", name: "Lengua y comunicación I" },
        { category: "Lengua y comunicación", name: "Inglés I" },
        { category: "Pensamiento matemático", name: "Pensamiento matemático I" },
        { category: "Cultura digital", name: "Cultura digital I" },
        { category: "Ciencias naturales", name: "La materia y sus interacciones" },
        { category: "Humanidades", name: "Humanidades I" },
        { category: "Ciencias sociales", name: "Ciencias sociales I" },
        { category: "Ciencias sociales", name: "Laboratorio de investigación" },
        { category: "Formación socioemocional", name: "Formación socioemocional I" }
      ],
      total: 9
    },
    2: {
      title: "Segundo Cuatrimestre",
      subjects: [
        { category: "Lengua y comunicación", name: "Lengua y comunicación II" },
        { category: "Lengua y comunicación", name: "Inglés II" },
        { category: "Pensamiento matemático", name: "Pensamiento matemático II" },
        { category: "Cultura digital", name: "Cultura digital II" },
        { category: "Ciencias naturales", name: "Conservación de la energía y sus interacciones con la materia" },
        { category: "Ciencias naturales", name: "Taller de ciencias I" },
        { category: "Humanidades", name: "Humanidades II" },
        { category: "Ciencias sociales", name: "Ciencias sociales II" },
        { category: "Formación socioemocional", name: "Formación socioemocional II" }
      ],
      total: 9
    },
    3: {
      title: "Tercer Cuatrimestre",
      subjects: [
        { category: "Lengua y comunicación", name: "Lengua y comunicación III" },
        { category: "Lengua y comunicación", name: "Inglés III" },
        { category: "Pensamiento matemático", name: "Pensamiento matemático III" },
        { category: "Ciencias naturales", name: "Ecosistemas: Interacciones, energía y dinámica" },
        { category: "Ciencias naturales", name: "Taller de ciencias II" },
        { category: "Humanidades", name: "Humanidades III" },
        { category: "Competencias laborales básicas", name: "Emprendimiento y empresa" },
        { category: "Competencias laborales básicas", name: "Proceso administrativo" },
        { category: "Formación socioemocional", name: "Formación socioemocional III" }
      ],
      total: 9
    },
    4: {
      title: "Cuarto Cuatrimestre",
      subjects: [
        { category: "Lengua y comunicación", name: "Inglés IV" },
        { category: "Pensamiento matemático", name: "Temas selectos de matemáticas I" },
        { category: "Conciencia histórica", name: "Conciencia histórica I: Perspectivas del México antiguo" },
        { category: "Cultura digital", name: "Taller de cultura digital" },
        { category: "Ciencias naturales", name: "Interacciones químicas: conservación de la materia en la formación de nuevas sustancias" },
        { category: "Ciencias naturales", name: "Espacio y sociedad" },
        { category: "Humanidades", name: "Pensamiento literario" },
        { category: "Ciencias sociales", name: "Ciencias sociales III" },
        { category: "Recurso o área a elegir", name: "Salud Integral I" },
        { category: "Recurso o área a elegir", name: "Taller de Probabilidad y Estadística I" },
        { category: "Recurso o área a elegir", name: "Procesos Contables I" },
        { category: "Competencias laborales básicas", name: "Legalidad empresarial" },
        { category: "Competencias laborales básicas", name: "Mercadotecnia" },
        { category: "Formación socioemocional", name: "Formación socioemocional IV" }
      ],
      total: 14
    },
    5: {
      title: "Quinto Cuatrimestre",
      subjects: [
        { category: "Conciencia histórica", name: "Conciencia histórica II: México durante el encantamiento" },
        { category: "Ciencias naturales", name: "La energía en los procesos de la vida diaria" },
        { category: "Lengua y comunicación", name: "Inglés V" },
        { category: "Recurso o área a elegir", name: "Salud Integral II" },
        { category: "Recurso o área a elegir", name: "Taller de Probabilidad y Estadística II" },
        { category: "Recurso o área a elegir", name: "Procesos Contables II" },
        { category: "Competencias laborales básicas", name: "Finanzas" },
        { category: "Competencias laborales básicas", name: "Ventas y difusión" },
        { category: "Formación socioemocional", name: "Formación socioemocional V" }
      ],
      total: 9
    },
    6: {
      title: "Sexto Cuatrimestre",
      subjects: [
        { category: "Pensamiento matemático", name: "Temas selectos de matemáticas II" },
        { category: "Conciencia histórica", name: "Conciencia histórica III: La realidad actual en perspectiva" },
        { category: "Ciencias naturales", name: "Organismos: estructuras y procesos: Herencia evolución biológica" },
        { category: "Lengua y comunicación", name: "Inglés VI" },
        { category: "Competencias laborales básicas", name: "Comunicación de la empresa" },
        { category: "Competencias laborales básicas", name: "Proyecto emprendedor" },
        { category: "Formación socioemocional", name: "Formación socioemocional VI" }
      ],
      total: 7
    }
  };

  // Función para cargar los datos del cuatrimestre
  function loadQuarterData(quarterNumber) {
    const data = quarterData[quarterNumber];
    if (!data) return;
    
    const contentContainer = document.querySelector('.pl-desktop-table-content');
    
    // Crear HTML para las materias
    let html = `<h3 class="pl-desktop-table-header">${data.title}</h3>`;
    html += '<div class="pl-desktop-subjects-container">';
    
    let currentCategory = '';
    data.subjects.forEach(subject => {
      if (subject.category !== currentCategory) {
        currentCategory = subject.category;
        html += `<div class="pl-desktop-subject-category">${currentCategory}</div>`;
      }
      html += `<div class="pl-desktop-subject">${subject.name}</div>`;
    });
    
    html += `<div class="pl-desktop-uac-total">Total de materias: ${data.total}</div>`;
    html += '</div>';
    
    contentContainer.innerHTML = html;
  }

  // Configurar event listeners para los botones
  const quarterButtons = document.querySelectorAll('.pl-desktop-quarter-btn');
  quarterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remover clase active de todos los botones
      quarterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Añadir clase active al botón clickeado
      this.classList.add('active');
      
      // Cargar los datos del cuatrimestre seleccionado
      const quarter = this.getAttribute('data-quarter');
      loadQuarterData(quarter);
    });
  });

  // Cargar el primer cuatrimestre por defecto
  if (quarterButtons.length > 0) {
    loadQuarterData('1');
  }
});

/* ============================
   NUEVO SISTEMA DE CARTAS POR CUATRIMESTRE
============================ */
document.addEventListener('DOMContentLoaded', function() {
  // Datos de las materias por cuatrimestre
  const quarterData = {
    1: {
      title: "Primer Cuatrimestre",
      total: 9,
      subjects: [
        { category: "Lengua y comunicación", name: "Lengua y comunicación I" },
        { category: "Lengua y comunicación", name: "Inglés I" },
        { category: "Pensamiento matemático", name: "Pensamiento matemático I" },
        { category: "Cultura digital", name: "Cultura digital I" },
        { category: "Ciencias naturales", name: "La materia y sus interacciones" },
        { category: "Humanidades", name: "Humanidades I" },
        { category: "Ciencias sociales", name: "Ciencias sociales I" },
        { category: "Ciencias sociales", name: "Laboratorio de investigación" },
        { category: "Formación socioemocional", name: "Formación socioemocional I" }
      ]
    },
    2: {
      title: "Segundo Cuatrimestre",
      total: 9,
      subjects: [
        { category: "Lengua y comunicación", name: "Lengua y comunicación II" },
        { category: "Lengua y comunicación", name: "Inglés II" },
        { category: "Pensamiento matemático", name: "Pensamiento matemático II" },
        { category: "Cultura digital", name: "Cultura digital II" },
        { category: "Ciencias naturales", name: "Conservación de la energía y sus interacciones con la materia" },
        { category: "Ciencias naturales", name: "Taller de ciencias I" },
        { category: "Humanidades", name: "Humanidades II" },
        { category: "Ciencias sociales", name: "Ciencias sociales II" },
        { category: "Formación socioemocional", name: "Formación socioemocional II" }
      ]
    },
    3: {
      title: "Tercer Cuatrimestre",
      total: 9,
      subjects: [
        { category: "Lengua y comunicación", name: "Lengua y comunicación III" },
        { category: "Lengua y comunicación", name: "Inglés III" },
        { category: "Pensamiento matemático", name: "Pensamiento matemático III" },
        { category: "Ciencias naturales", name: "Ecosistemas: Interacciones, energía y dinámica" },
        { category: "Ciencias naturales", name: "Taller de ciencias II" },
        { category: "Humanidades", name: "Humanidades III" },
        { category: "Competencias laborales básicas", name: "Emprendimiento y empresa" },
        { category: "Competencias laborales básicas", name: "Proceso administrativo" },
        { category: "Formación socioemocional", name: "Formación socioemocional III" }
      ]
    },
    4: {
      title: "Cuarto Cuatrimestre",
      total: 11,
      subjects: [
        { category: "Lengua y comunicación", name: "Inglés IV" },
        { category: "Pensamiento matemático", name: "Temas selectos de matemáticas I" },
        { category: "Conciencia histórica", name: "Conciencia histórica I: Perspectivas del México antiguo" },
        { category: "Cultura digital", name: "Taller de cultura digital" },
        { category: "Ciencias naturales", name: "Interacciones químicas: conservación de la materia en la formación de nuevas sustancias" },
        { category: "Ciencias naturales", name: "Espacio y sociedad" },
        { category: "Humanidades", name: "Pensamiento literario" },
        { category: "Ciencias sociales", name: "Ciencias sociales III" },
        { category: "Recurso o área a elegir", name: "Salud Integral I" },
        { category: "Recurso o área a elegir", name: "Taller de Probabilidad y Estadística I" },
        { category: "Recurso o área a elegir", name: "Procesos Contables I" },
        { category: "Competencias laborales básicas", name: "Legalidad empresarial" },
        { category: "Competencias laborales básicas", name: "Mercadotecnia" },
        { category: "Formación socioemocional", name: "Formación socioemocional IV" }
      ]
    },
    5: {
      title: "Quinto Cuatrimestre",
      total: 9,
      subjects: [
        { category: "Conciencia histórica", name: "Conciencia histórica II: México durante el encantamiento" },
        { category: "Ciencias naturales", name: "La energía en los procesos de la vida diaria" },
        { category: "Lengua y comunicación", name: "Inglés V" },
        { category: "Recurso o área a elegir", name: "Salud Integral II" },
        { category: "Recurso o área a elegir", name: "Taller de Probabilidad y Estadística II" },
        { category: "Recurso o área a elegir", name: "Procesos Contables II" },
        { category: "Competencias laborales básicas", name: "Finanzas" },
        { category: "Competencias laborales básicas", name: "Ventas y difusión" },
        { category: "Formación socioemocional", name: "Formación socioemocional V" }
      ]
    },
    6: {
      title: "Sexto Cuatrimestre",
      total: 7,
      subjects: [
        { category: "Pensamiento matemático", name: "Temas selectos de matemáticas II" },
        { category: "Conciencia histórica", name: "Conciencia histórica III: La realidad actual en perspectiva" },
        { category: "Ciencias naturales", name: "Organismos: estructuras y procesos: Herencia evolución biológica" },
        { category: "Lengua y comunicación", name: "Inglés VI" },
        { category: "Competencias laborales básicas", name: "Comunicación de la empresa" },
        { category: "Competencias laborales básicas", name: "Proyecto emprendedor" },
        { category: "Formación socioemocional", name: "Formación socioemocional VI" }
      ]
    }
  };

  // Función para crear las cartas de cuatrimestres
  function createQuarterCards() {
    const gridContainer = document.querySelector('.pl-quarters-grid-desktop');
    if (!gridContainer) return;
    
    let html = '';
    
    for (let i = 1; i <= 6; i++) {
      const data = quarterData[i];
      if (!data) continue;
      
      html += `
        <div class="pl-quarter-card-desktop">
          <div class="pl-quarter-header-desktop">
            <h3 class="pl-quarter-title-desktop">${data.title}</h3>
            <span class="pl-quarter-uac-desktop">${data.total} materias</span>
          </div>
          <div class="pl-subjects-grid-desktop">
      `;
      
      let currentCategory = '';
      data.subjects.forEach(subject => {
        if (subject.category !== currentCategory) {
          currentCategory = subject.category;
          html += `<div class="pl-subject-category-desktop">${currentCategory}</div>`;
        }
        html += `<div class="pl-subject-item-desktop">${subject.name}</div>`;
      });
      
      html += `
          </div>
        </div>
      `;
    }
    
    gridContainer.innerHTML = html;
  }

  // Inicializar las cartas
  createQuarterCards();
});