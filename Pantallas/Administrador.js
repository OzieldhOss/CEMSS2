document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const cuatrimestreForm = document.getElementById('cuatrimestreForm');
    const nuevoCuatrimestreForm = document.getElementById('nuevoCuatrimestreForm');
    const addCuatrimestreBtn = document.getElementById('addCuatrimestreBtn');
    const cancelCuatrimestreBtn = document.getElementById('cancelCuatrimestreBtn');
    const nuevoContenidoSection = document.getElementById('nuevoContenidoSection');
    const crearFormularioBtn = document.getElementById('crearFormularioBtn');
    const manualContentForm = document.getElementById('manualContentForm');
    const formPreview = document.getElementById('formPreview');
    const cuatrimestresList = document.getElementById('cuatrimestresList');
    
    // Cargar cuatrimestres al iniciar
    loadCuatrimestres();

    // Event Listeners
    addCuatrimestreBtn.addEventListener('click', showCuatrimestreForm);
    cancelCuatrimestreBtn.addEventListener('click', hideCuatrimestreForm);
    
    document.querySelectorAll('input[name="contenido"]').forEach(radio => {
        radio.addEventListener('change', toggleContenidoSection);
    });
    
    crearFormularioBtn.addEventListener('click', showManualForm);
    
    document.querySelectorAll('.administrador-add-control').forEach(button => {
        button.addEventListener('click', function() {
            addFormControl(this.dataset.type);
        });
    });
    
    cuatrimestreForm.addEventListener('submit', handleFormSubmit);

    // Funciones
    function showCuatrimestreForm() {
        nuevoCuatrimestreForm.style.display = 'block';
    }
    
    function hideCuatrimestreForm() {
        nuevoCuatrimestreForm.style.display = 'none';
        resetForms();
    }
    
    function toggleContenidoSection() {
        if (this.value === 'nuevo') {
            nuevoContenidoSection.style.display = 'block';
        } else {
            nuevoContenidoSection.style.display = 'none';
            manualContentForm.style.display = 'none';
        }
    }
    
    function showManualForm() {
        manualContentForm.style.display = 'block';
    }
    
    function addFormControl(type) {
        const controlId = Date.now();
        let controlHtml = '';
        
        switch(type) {
            case 'text':
                controlHtml = `
                <div class="form-control-item" data-type="text">
                    <h5>Bloque de Texto</h5>
                    <textarea class="form-text-area" placeholder="Escribe tu texto aquí..." rows="3"></textarea>
                    <button class="remove-control-btn" title="Eliminar">×</button>
                </div>
                `;
                break;
            case 'multiple':
                controlHtml = `
                <div class="form-control-item" data-type="multiple">
                    <h5>Pregunta de Opción Múltiple</h5>
                    <input type="text" class="form-question-input" placeholder="Escribe tu pregunta...">
                    <div class="multiple-options">
                    <div class="multiple-option">
                        <input type="radio" name="mc_${controlId}" disabled>
                        <input type="text" placeholder="Opción A">
                        <button class="remove-option-btn" title="Eliminar opción">×</button>
                    </div>
                    <div class="multiple-option">
                        <input type="radio" name="mc_${controlId}" disabled>
                        <input type="text" placeholder="Opción B">
                        <button class="remove-option-btn" title="Eliminar opción">×</button>
                    </div>
                    </div>
                    <button class="add-option-btn">+ Añadir opción</button>
                    <button class="remove-control-btn" title="Eliminar">×</button>
                </div>
                `;
                break;
            case 'truefalse':
                controlHtml = `
                <div class="form-control-item" data-type="truefalse">
                    <h5>Verdadero/Falso</h5>
                    <input type="text" class="form-question-input" placeholder="Escribe tu pregunta...">
                    <div class="truefalse-options">
                    <label><input type="radio" name="tf_${controlId}" value="true"> Verdadero</label>
                    <label><input type="radio" name="tf_${controlId}" value="false"> Falso</label>
                    </div>
                    <button class="remove-control-btn" title="Eliminar">×</button>
                </div>
                `;
                break;
            case 'connect':
                controlHtml = `
                <div class="form-control-item" data-type="connect">
                    <h5>Pregunta de Conectar</h5>
                    <div class="connect-pairs">
                    <div class="connect-pair">
                        <input type="text" placeholder="Elemento A">
                        <span>→</span>
                        <input type="text" placeholder="Elemento B">
                        <button class="remove-pair-btn" title="Eliminar par">×</button>
                    </div>
                    </div>
                    <button class="add-pair-btn">+ Añadir par</button>
                    <button class="remove-control-btn" title="Eliminar">×</button>
                </div>
                `;
                break;
        }
        
        const controlElement = document.createElement('div');
        controlElement.innerHTML = controlHtml;
        formPreview.appendChild(controlElement);
        
        setupControlEvents(controlElement, type, controlId);
    }
    
    function setupControlEvents(controlElement, type, controlId) {
        // Botón de eliminar control
        const removeBtn = controlElement.querySelector('.remove-control-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => controlElement.remove());
        }
        
        // Configuración para preguntas de opción múltiple
        if (type === 'multiple') {
            const addOptionBtn = controlElement.querySelector('.add-option-btn');
            const optionsContainer = controlElement.querySelector('.multiple-options');
            
            addOptionBtn.addEventListener('click', () => {
                const optionCount = optionsContainer.querySelectorAll('.multiple-option').length;
                const nextLetter = String.fromCharCode(65 + optionCount);
                
                const newOption = document.createElement('div');
                newOption.className = 'multiple-option';
                newOption.innerHTML = `
                <input type="radio" name="mc_${controlId}" disabled>
                <input type="text" placeholder="Opción ${nextLetter}">
                <button class="remove-option-btn" title="Eliminar opción">×</button>
                `;
                optionsContainer.appendChild(newOption);
                
                newOption.querySelector('.remove-option-btn').addEventListener('click', () => {
                    newOption.remove();
                });
            });
            
            controlElement.querySelectorAll('.remove-option-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    this.closest('.multiple-option').remove();
                });
            });
        }
        
        // Configuración para preguntas de conexión
        if (type === 'connect') {
            const addPairBtn = controlElement.querySelector('.add-pair-btn');
            const connectPairs = controlElement.querySelector('.connect-pairs');
            
            addPairBtn.addEventListener('click', () => {
                const newPair = document.createElement('div');
                newPair.className = 'connect-pair';
                newPair.innerHTML = `
                <input type="text" placeholder="Elemento A">
                <span>→</span>
                <input type="text" placeholder="Elemento B">
                <button class="remove-pair-btn" title="Eliminar par">×</button>
                `;
                connectPairs.appendChild(newPair);
                
                newPair.querySelector('.remove-pair-btn').addEventListener('click', () => {
                    newPair.remove();
                });
            });
            
            controlElement.querySelectorAll('.remove-pair-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    this.closest('.connect-pair').remove();
                });
            });
        }
    }
    
    // Configuración para "Seleccionar todos" en grupos
    document.querySelectorAll('.administrador-select-all-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.closest('.grupos-select-container');
            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = !allChecked;
            });
            
            this.textContent = allChecked ? 'Seleccionar todos' : 'Deseleccionar todos';
        });
    });
    
    function resetForms() {
        cuatrimestreForm.reset();
        nuevoContenidoSection.style.display = 'none';
        manualContentForm.style.display = 'none';
        formPreview.innerHTML = '';
    }
    
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Obtener grupos seleccionados
        const gruposSeleccionados = Array.from(
            document.querySelectorAll('input[name="grupos"]:checked')
        ).map(checkbox => checkbox.value);
        
        // Obtener contenido del formulario
        const formControls = Array.from(formPreview.querySelectorAll('.form-control-item')).map(control => {
            const type = control.dataset.type;
            const data = { type };
            
            switch(type) {
                case 'text':
                    data.content = control.querySelector('textarea').value;
                    break;
                case 'multiple':
                    data.question = control.querySelector('.form-question-input').value;
                    data.options = Array.from(control.querySelectorAll('.multiple-option input[type="text"]')).map(opt => opt.value);
                    break;
                case 'truefalse':
                    data.question = control.querySelector('.form-question-input').value;
                    break;
                case 'connect':
                    data.pairs = Array.from(control.querySelectorAll('.connect-pair')).map(pair => ({
                        a: pair.querySelector('input:nth-of-type(1)').value,
                        b: pair.querySelector('input:nth-of-type(2)').value
                    }));
                    break;
            }
            
            return data;
        });
        
        // Datos del formulario
        const formData = {
            nombre: document.getElementById('cuatrimestreNombre').value,
            fechaInicio: document.getElementById('fechaInicio').value,
            fechaFin: document.getElementById('fechaFin').value,
            grupos: gruposSeleccionados,
            contenido: formControls,
            tipoContenido: document.querySelector('input[name="contenido"]:checked').value
        };
        
        try {
            // Guardar en localStorage (simulando base de datos)
            const actividades = JSON.parse(localStorage.getItem('actividades')) || [];
            actividades.push(formData);
            localStorage.setItem('actividades', JSON.stringify(actividades));
            
            // Mostrar en la lista
            addCuatrimestreToList(formData);
            
            alert('Cuatrimestre creado exitosamente para los grupos: ' + gruposSeleccionados.join(', '));
            resetForms();
            hideCuatrimestreForm();
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el cuatrimestre');
        }
    }
    
    function addCuatrimestreToList(cuatrimestre) {
        const item = document.createElement('div');
        item.className = 'administrador-list-item';
        item.innerHTML = `
            <div class="administrador-item-content">
                <h4>${cuatrimestre.nombre}</h4>
                <p>Estado: Activo</p>
                <p>Fecha inicio: ${formatDate(cuatrimestre.fechaInicio)} - Fecha fin: ${formatDate(cuatrimestre.fechaFin)}</p>
                <p>Grupos: ${cuatrimestre.grupos.join(', ')}</p>
            </div>
            <div class="administrador-item-actions">
                <button class="administrador-action-btn edit-btn">Editar</button>
                <button class="administrador-action-btn delete-btn">Eliminar</button>
            </div>
        `;
        cuatrimestresList.appendChild(item);
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX');
    }
    
    async function loadCuatrimestres() {
        try {
            const actividades = JSON.parse(localStorage.getItem('actividades')) || [];
            actividades.forEach(addCuatrimestreToList);
        } catch (error) {
            console.error('Error al cargar cuatrimestres:', error);
        }
    }
});