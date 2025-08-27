// periods-data.js - CÓDIGO CORREGIDO
document.addEventListener('DOMContentLoaded', function() {
  console.log('Script de períodos cargado - Versión corregida');
  initPeriods();
});

function initPeriods() {
  const container = document.getElementById('quarters-container');
  if (!container) {
    console.warn('No se encontró el contenedor de períodos');
    return;
  }
  
  // Inicializar el año actual en el título
  const yearElement = document.querySelector('.current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  
  // Renderizar las tarjetas
  renderPeriodCards();
}

// Configuración corregida de períodos
const PERIODS_CONFIG = [
  {
    name: "Mayo-Agosto",
    registrationMonth: 3, // Abril (0-11)
    registrationDays: 30,
    status: "closed",
    dates: "Hasta Nuevo Aviso",
    statusText: "Inscripciones cerradas",
    statusIcon: "✖"
  },
  {
    name: "Septiembre-Diciembre", 
    registrationMonth: 7, // Agosto (0-11)
    registrationDays: 31,
    status: "current",
    dates: "Logra tus metas ahora!",
    statusText: "Inscripciones abiertas", 
    statusIcon: "✓"
  },
  {
    name: "Enero-Abril",
    registrationMonth: 11, // Diciembre (0-11)
    registrationDays: 31,
    status: "upcoming",
    dates: "Preparate",
    statusText: "Próximas inscripciones",
    statusIcon: "⏱"
  }
];

// Función CORREGIDA para obtener fechas
function getPeriodDates(periodConfig, baseYear) {
  const m = periodConfig.registrationMonth; // 0-11
  const start = new Date(baseYear, m, 1, 0, 0, 0, 0);
  // último día del mes m: día 0 del mes siguiente
  const end = new Date(baseYear, m + 1, 0, 23, 59, 59, 999);
  return { registrationStart: start, registrationEnd: end };
}

// Función CORREGIDA para determinar el estado
function updatePeriodsStatus() {
  const now = new Date();
  const cy = now.getFullYear();

  return PERIODS_CONFIG.map(pc => {
    // Ventana de este año
    let { registrationStart, registrationEnd } = getPeriodDates(pc, cy);

    // Estado (current / upcoming / closed) en función de la ventana de ESTE año
    let status, statusText, statusIcon, dates;

    if (now >= registrationStart && now <= registrationEnd) {
      status = "current";
      statusText = "Inscripciones abiertas";
      statusIcon = "✓";
      dates = "Logra tus metas ahora!";
    } else if (now < registrationStart) {
      status = "upcoming";
      statusText = "Próximas inscripciones";
      statusIcon = "⏱";
      dates = "Preparate";
    } else {
      status = "closed"; // now > registrationEnd
      statusText = "Inscripciones cerradas";
      statusIcon = "✖";
      dates = "Hasta Nuevo Aviso";
    }

    // Próxima ocurrencia (para ordenar “upcoming”)
    // Si ya pasó la ventana de este año, la próxima es el próximo año.
    let nextOcc = getPeriodDates(pc, now > registrationEnd ? cy + 1 : cy).registrationStart;

    // Ocurrencia inmediatamente anterior (para ordenar “closed”)
    // Si aún no llega la ventana de este año, la anterior fue el año pasado, si ya pasó, fue la de este año.
    let prevOccEnd;
    if (now < registrationStart) {
      prevOccEnd = getPeriodDates(pc, cy - 1).registrationEnd;
    } else {
      prevOccEnd = registrationEnd;
    }

    const period = {
      ...pc,
      registrationStart,
      registrationEnd,
      status,
      statusText,
      statusIcon,
      dates,
      nextStart: nextOcc,
      prevEnd: prevOccEnd,
    };

    console.log(`Período ${pc.name}:`, {
      inicio: registrationStart.toString(),
      fin: registrationEnd.toString(),
      prevEnd: prevOccEnd.toString(),
      nextStart: nextOcc.toString(),
      hoy: now.toString(),
      status
    });

    return period;
  });
}


// Función para ordenar períodos (sin cambios)
function orderPeriodsByStatus(periods) {
  const now = new Date();

  const current = periods.find(p => p.status === "current");

  // Cerrado más reciente => el de mayor prevEnd que sea <= now
  const closedSorted = [...periods]
    .filter(p => p.prevEnd <= now)
    .sort((a, b) => b.prevEnd - a.prevEnd);

  // Próximos ordenados por cercanía (nextStart > now)
  const upcomingSorted = [...periods]
    .filter(p => p.nextStart > now)
    .sort((a, b) => a.nextStart - b.nextStart);

  const ordered = [];

  // Centro: periodo actual si existe; si no, el próximo más cercano
  const center = current || upcomingSorted[0];
  if (center) ordered.push({ ...center, position: "center" });

  // Izquierda: cerrado más reciente (que no sea el center por si acaso)
  const left = closedSorted.find(p => !center || p.name !== center.name);
  if (left) ordered.push({ ...left, position: "left" });

  // Derecha: el siguiente “upcoming” después del center (o el primero si el center era current)
  let rightCandidate = null;
  if (current) {
    rightCandidate = upcomingSorted[0]; // solo hay uno “upcoming” cuando hay current
  } else {
    rightCandidate = upcomingSorted.find(p => p.name !== center?.name);
  }
  if (rightCandidate) ordered.push({ ...rightCandidate, position: "right" });

  // Si por alguna razón faltara alguno (no debería), rellenar con los restantes manteniendo orden estable
  const haveNames = new Set(ordered.map(o => o.name));
  periods.forEach(p => {
    if (!haveNames.has(p.name) && ordered.length < 3) {
      const pos = ordered.find(o => o.position === "left") ? (ordered.find(o => o.position === "right") ? "center" : "right") : "left";
      ordered.push({ ...p, position: pos });
      haveNames.add(p.name);
    }
  });

  return ordered;
}

// Función para animar tarjetas (sin cambios)
function animateCards() {
  const cards = document.querySelectorAll('.quarter-item');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('animate');
    }, index * 200);
  });
}

// Función para renderizar las fichas en el DOM (VERSIÓN CORREGIDA)
function renderPeriodCards() {
  const periods = updatePeriodsStatus();
  const orderedPeriods = orderPeriodsByStatus(periods);
  const container = document.getElementById('quarters-container');
  
  if (!container) {
    console.error('No se encontró el contenedor con ID quarters-container');
    return;
  }
  
  // Limpiar contenedor
  container.innerHTML = '';
  
  console.log('Períodos ordenados:', orderedPeriods);
  
  // Crear y agregar cada ficha
  orderedPeriods.forEach(period => {
    const card = document.createElement('div');
    card.className = `quarter-item ${period.status} ${period.position}`;
    
    card.innerHTML = `
      <div class="quarter-header">
        <div class="quarter-shape"></div>
        <h3>Convocatoria<br>${period.name}</h3>
      </div>
      <div class="quarter-content">
        <p class="quarter-dates">${period.dates}</p>
        <div class="quarter-status">
          <span class="status-icon">${period.statusIcon}</span>
          <span>${period.statusText}</span>
        </div>
        ${period.status === 'current' ? `
          <div class="cta-container">
            <a href="Formulario_registro.html" class="cta-button">
              Inscríbete
              <span class="arrow-icon">→</span>
            </a>
          </div>
        ` : ''}
      </div>
    `;
    
    container.appendChild(card);
  });
  
  // Animar las tarjetas después de un breve retraso
  setTimeout(animateCards, 100);
}