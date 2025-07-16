// script_profesor.js - Código específico para el panel del profesor
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página del profesor
    if (!document.querySelector('.professor-dashboard')) return;
    
    // Obtener el nombre del profesor (simulado)
    const professorName = localStorage.getItem('professorName') || 'Profesor Martínez';
    
    // Actualizar solo si el elemento existe (para evitar conflictos)
    const professorNameElement = document.getElementById('professor-name');
    if (professorNameElement) {
        professorNameElement.textContent = professorName;
    }
    
    // Datos de ejemplo para las clases
    const classData = {
        '101': {
            name: 'Matemáticas IV',
            group: 'Grupo 101',
            students: 20,
            activities: [
                {
                    title: 'Examen Parcial',
                    dueDate: '20/11/2025',
                    submissions: '3/20'
                },
                {
                    title: 'Tarea de Álgebra',
                    dueDate: '10/11/2025',
                    submissions: '15/20'
                }
            ]
        },
        '205': {
            name: 'Física III',
            group: 'Grupo 205',
            students: 25,
            activities: [
                {
                    title: 'Problemas de Física',
                    dueDate: '15/11/2025',
                    submissions: '12/25'
                },
                {
                    title: 'Proyecto Final',
                    dueDate: '30/11/2025',
                    submissions: '0/25'
                }
            ]
        },
        '302': {
            name: 'Literatura Universal',
            group: 'Grupo 302',
            students: 18,
            activities: [
                {
                    title: 'Ensayo Literario',
                    dueDate: '25/11/2025',
                    submissions: '5/18'
                },
                {
                    title: 'Análisis de Poema',
                    dueDate: '12/11/2025',
                    submissions: '10/18'
                }
            ]
        }
    };
    
    // Evento para las tarjetas de grupo
    const groupCards = document.querySelectorAll('.group-card');
    if (groupCards.length > 0) {
        groupCards.forEach(card => {
            card.addEventListener('click', function() {
                const groupId = this.getAttribute('data-group');
                const classInfo = classData[groupId];
                
                // Actualizar la información de la clase
                document.getElementById('class-name').textContent = classInfo.name;
                document.getElementById('group-name').textContent = classInfo.group;
                document.getElementById('student-count').textContent = `${classInfo.students} alumnos`;
                
                // Mostrar las actividades
                const activitiesContainer = document.getElementById('activitiesContainer');
                activitiesContainer.innerHTML = '';
                
                if (classInfo.activities.length === 0) {
                    activitiesContainer.innerHTML = '<p class="no-activities">Esta clase no tiene actividades aún</p>';
                } else {
                    classInfo.activities.forEach(activity => {
                        const activityElement = document.createElement('div');
                        activityElement.className = 'activity-item';
                        activityElement.innerHTML = `
                            <div class="activity-content">
                                <h4 class="activity-title">${activity.title}</h4>
                                <p class="activity-due-date">Fecha de entrega: ${activity.dueDate}</p>
                                <p class="activity-submissions">Entregas: ${activity.submissions} estudiantes</p>
                            </div>
                            <div class="activity-actions">
                                <button class="action-btn add-comment">Agregar Comentario</button>
                                <button class="action-btn view-submissions">Ver Entregas</button>
                            </div>
                        `;
                        activitiesContainer.appendChild(activityElement);
                    });
                }
            });
        });
    }
    
    // Evento para el botón de nueva actividad
    const addActivityBtn = document.getElementById('addActivityBtn');
    if (addActivityBtn) {
        addActivityBtn.addEventListener('click', function() {
            alert('Funcionalidad para agregar nueva actividad');
        });
    }
    
    // Delegación de eventos para los botones de actividad
    const activitiesContainer = document.getElementById('activitiesContainer');
    if (activitiesContainer) {
        activitiesContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('add-comment')) {
                const activityTitle = e.target.closest('.activity-item').querySelector('.activity-title').textContent;
                alert(`Agregar comentario a: ${activityTitle}`);
            } else if (e.target.classList.contains('view-submissions')) {
                const activityTitle = e.target.closest('.activity-item').querySelector('.activity-title').textContent;
                alert(`Mostrar entregas de: ${activityTitle}`);
            }
        });
    }
    
    // Evento para cerrar sesión (solo si existe el botón)
    const logoutBtn = document.getElementById('plan-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if(confirm('¿Estás seguro que deseas cerrar tu sesión?')) {
                localStorage.removeItem('professorName');
                window.location.href = 'Inicio.html';
            }
        });
    }
});