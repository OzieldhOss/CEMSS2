document.addEventListener('DOMContentLoaded', function() {
  // Variables globales
  const cuatrimestreForm = document.getElementById('cuatrimestreForm');
  const nuevoCuatrimestreForm = document.getElementById('nuevoCuatrimestreForm');
  const addCuatrimestreBtn = document.getElementById('addCuatrimestreBtn');
  const cancelCuatrimestreBtn = document.getElementById('cancelCuatrimestreBtn');
  const nuevoContenidoSection = document.getElementById('nuevoContenidoSection');
  const subirWordBtn = document.getElementById('subirWordBtn');
  const crearFormularioBtn = document.getElementById('crearFormularioBtn');
  const uploadWordForm = document.getElementById('uploadWordForm');
  const manualContentForm = document.getElementById('manualContentForm');
  const formPreview = document.getElementById('formPreview');
  
  // Event Listeners
  addCuatrimestreBtn.addEventListener('click', showCuatrimestreForm);
  cancelCuatrimestreBtn.addEventListener('click', hideCuatrimestreForm);
  
  document.querySelectorAll('input[name="contenido"]').forEach(radio => {
    radio.addEventListener('change', toggleContenidoSection);
  });
  
  subirWordBtn.addEventListener('click', showWordUploadForm);
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
      uploadWordForm.style.display = 'none';
      manualContentForm.style.display = 'none';
    }
  }
  
  function showWordUploadForm() {
    uploadWordForm.style.display = 'block';
    manualContentForm.style.display = 'none';
  }
  
  function showManualForm() {
    manualContentForm.style.display = 'block';
    uploadWordForm.style.display = 'none';
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
        const nextLetter = String.fromCharCode(65 + optionCount); // A, B, C, etc.
        
        const newOption = document.createElement('div');
        newOption.className = 'multiple-option';
        newOption.innerHTML = `
          <input type="radio" name="mc_${controlId}" disabled>
          <input type="text" placeholder="Opción ${nextLetter}">
          <button class="remove-option-btn" title="Eliminar opción">×</button>
        `;
        optionsContainer.appendChild(newOption);
        
        // Evento para eliminar la opción
        newOption.querySelector('.remove-option-btn').addEventListener('click', () => {
          newOption.remove();
        });
      });
      
      // Eventos para opciones existentes
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
        
        // Evento para eliminar el par recién creado
        newPair.querySelector('.remove-pair-btn').addEventListener('click', () => {
          newPair.remove();
        });
      });
      
      // Eventos para pares existentes
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
    uploadWordForm.style.display = 'none';
    manualContentForm.style.display = 'none';
    formPreview.innerHTML = '';
  }
  
  function handleFormSubmit(e) {
    e.preventDefault();
    
    // Obtener grupos seleccionados
    const gruposSeleccionados = Array.from(
      document.querySelectorAll('input[name="grupos"]:checked')
    ).map(checkbox => checkbox.value);
    
    // Datos del formulario
    const formData = {
      nombre: document.getElementById('cuatrimestreNombre').value,
      fechaInicio: document.getElementById('fechaInicio').value,
      fechaFin: document.getElementById('fechaFin').value,
      grupos: gruposSeleccionados,
      contenido: document.querySelector('input[name="contenido"]:checked').value,
      // Aquí puedes agregar más datos según necesites
    };
    
    console.log('Formulario enviado - Datos:', formData);
    alert('Cuatrimestre creado exitosamente para los grupos: ' + gruposSeleccionados.join(', '));
    resetForms();
    nuevoCuatrimestreForm.style.display = 'none';
    
    // Aquí iría la conexión real con la base de datos
    // saveToDatabase(formData);
  }
  
  // Espacio reservado para el futuro algoritmo de procesamiento de Word
  /*
  document.getElementById('wordFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      processWordFile(file)
        .then(result => {
          console.log('Documento procesado:', result);
        })
        .catch(error => {
          console.error('Error al procesar documento:', error);
        });
    }
  });
  
  async function processWordFile(file) {
    // Implementación futura del algoritmo
    return new Promise((resolve) => {
      // Simulación de procesamiento
      setTimeout(() => {
        resolve({ success: true, sections: 5 });
      }, 1000);
    });
  }
  */
});