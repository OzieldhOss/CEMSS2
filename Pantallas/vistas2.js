document.addEventListener('DOMContentLoaded', function() {
  // Variables globales
  const formGridContainer = document.getElementById('formGridContainer');
  const formOptionButtons = document.querySelectorAll('.form-option-btn');
  const saveBtn = document.getElementById('saveBtn');
  const saveAsNewBtn = document.getElementById('saveAsNewBtn');
  const previewBtn = document.getElementById('previewBtn');
  const exitBtn = document.getElementById('exitBtn');
  const saveStatus = document.getElementById('saveStatus');
  const formTitleInput = document.querySelector('.form-title-input');
  const formDescriptionInput = document.querySelector('.form-description-input');
  
  let formData = {
    title: '',
    description: '',
    items: []
  };
  
  let hasUnsavedChanges = false;
  let progressionCounter = 0;
  let grid = null;
  
  // Inicializar la cuadrícula
  function initGrid() {
    // Destruir la cuadrícula si ya existe
    if (grid) {
      grid.destroy(false);
    }
    
    // Crear una nueva cuadrícula con configuración optimizada
    setTimeout(() => {
    grid = GridStack.init({
      column: 6,
      cellHeight: 80,
      minRow: 1,
      margin: 5,
      float: false,
      disableOneColumnMode: true,
      alwaysShowResizeHandle: true,
      resizable: {
        handles: 'e, se, s, sw, w'
      },
      draggable: {
        handle: '.form-item-header'
      },
        resizeHandles: 'e, se, s, sw, w',
        acceptWidgets: true,
        removable: true,
        removeTimeout: 100
    }, formGridContainer);
      
    // Evento para guardar cambios cuando se mueve o redimensiona un elemento
    grid.on('change', function(event, items) {
      saveGridState();
    });
    
    // Asegurar que la cuadrícula se redibuje correctamente
     setTimeout(() => {
      if (grid && grid.engine) {
         grid.el.style.width = '100%';
         grid.el.style.minWidth = '100%';
      }
    }, 100);
    
    grid.on('change', function(event, items) {
      saveGridState();
    });
    
    loadGridItems();
  }, 50);
}
  
  // Cargar datos guardados si existen
  function loadFormData() {
    const savedForm = localStorage.getItem('currentForm');
    if (savedForm) {
      try {
        formData = JSON.parse(savedForm);
        
        // Restaurar título y descripción
        if (formTitleInput) formTitleInput.value = formData.title || '';
        if (formDescriptionInput) formDescriptionInput.value = formData.description || '';
        
        // Limpiar la cuadrícula si existe
        if (grid) {
          grid.removeAll();
        }
        
        progressionCounter = 0;
        
        // Cargar items en la cuadrícula
        loadGridItems();
        
        setSavedChanges();
      } catch (e) {
        console.error('Error loading form data:', e);
      }
    }
    
    // Inicializar la cuadrícula después de un pequeño retraso
    setTimeout(initGrid, 100);
  }
  
  // Event Listeners
  if (formOptionButtons && formOptionButtons.length) {
    formOptionButtons.forEach(button => {
      button.addEventListener('click', function() {
        addFormItem(this.dataset.type);
      });
    });
  }
  
  if (formTitleInput) {
    formTitleInput.addEventListener('input', function() {
      formData.title = this.value;
      setUnsavedChanges();
    });
  }
  
  if (formDescriptionInput) {
    formDescriptionInput.addEventListener('input', function() {
      formData.description = this.value;
      setUnsavedChanges();
    });
  }
  
  if (saveBtn) saveBtn.addEventListener('click', saveForm);
  if (saveAsNewBtn) saveAsNewBtn.addEventListener('click', saveAsNewForm);
  if (previewBtn) previewBtn.addEventListener('click', previewForm);
  if (exitBtn) exitBtn.addEventListener('click', exitForm);
  
  // Inicializar la carga de datos
  loadFormData();
  
  // Función para guardar el estado de la cuadrícula
  function saveGridState() {
    if (!grid) return;
    
    const items = grid.save();
    
    items.forEach(item => {
      const itemId = parseInt(item.id);
      const itemIndex = formData.items.findIndex(i => i.id === itemId);
      
      if (itemIndex !== -1) {
        formData.items[itemIndex].position = { x: item.x, y: item.y };
        formData.items[itemIndex].dimensions = { width: item.w, height: item.h };
      }
    });
    
    setUnsavedChanges();
  }
  
  // Funciones
  function addFormItem(type) {
    if (!grid) {
      console.error('Grid no inicializada');
      return;
    }
    
    const itemId = Date.now();
    let itemHtml = '';
    
    switch(type) {
      case 'text':
        itemHtml = `
          <div class="form-item-header">
            <input type="text" class="form-item-title" placeholder="Pregunta de texto">
            <div class="form-item-actions">
              <button class="form-item-action-btn" title="Eliminar">🗑️</button>
            </div>
          </div>
          <div class="form-item-content">
            <input type="text" class="text-input" placeholder="Respuesta de texto">
          </div>
        `;
        break;
      case 'multiple':
        itemHtml = `
          <div class="form-item-header">
            <input type="text" class="form-item-title" placeholder="Pregunta de opción múltiple">
            <div class="form-item-actions">
              <button class="form-item-action-btn" title="Eliminar">🗑️</button>
            </div>
          </div>
          <div class="form-item-content">
            <div class="multiple-options">
              <div class="multiple-option">
                <input type="radio" name="mc_${itemId}" disabled>
                <input type="text" placeholder="Opción 1">
                <button class="form-item-action-btn remove-option-btn" title="Eliminar opción">×</button>
              </div>
              <div class="multiple-option">
                <input type="radio" name="mc_${itemId}" disabled>
                <input type="text" placeholder="Opción 2">
                <button class="form-item-action-btn remove-option-btn" title="Eliminar opción">×</button>
              </div>
            </div>
            <button class="add-option-btn">+ Añadir opción</button>
          </div>
        `;
        break;
      case 'truefalse':
        itemHtml = `
          <div class="form-item-header">
            <input type="text" class="form-item-title" placeholder="Pregunta Verdadero/Falso">
            <div class="form-item-actions">
              <button class="form-item-action-btn" title="Eliminar">🗑️</button>
            </div>
          </div>
          <div class="form-item-content">
            <div class="truefalse-options">
              <label><input type="radio" name="tf_${itemId}" value="true"> Verdadero</label>
              <label><input type="radio" name="tf_${itemId}" value="false"> Falso</label>
            </div>
          </div>
        `;
        break;
      case 'connect':
        itemHtml = `
          <div class="form-item-header">
            <input type="text" class="form-item-title" placeholder="Pregunta de conectar">
            <div class="form-item-actions">
              <button class="form-item-action-btn" title="Eliminar">🗑️</button>
            </div>
          </div>
          <div class="form-item-content">
            <div class="connect-pairs">
              <div class="connect-pair">
                <input type="text" placeholder="Elemento A">
                <span>→</span>
                <input type="text" placeholder="Elemento B">
                <button class="form-item-action-btn remove-pair-btn" title="Eliminar par">×</button>
              </div>
            </div>
            <button class="add-pair-btn">+ Añadir par</button>
          </div>
        `;
        break;
      case 'progression':
        progressionCounter++;
        itemHtml = `
          <div class="form-item-header">
            <span class="progression-number">Progresión ${progressionCounter}</span>
            <div class="form-item-actions">
              <button class="form-item-action-btn" title="Eliminar">🗑️</button>
            </div>
          </div>
          <div class="form-item-content"></div>
        `;
        break;
      case 'subtitle':
        itemHtml = `
          <div class="form-item-header">
            <input type="text" class="subtitle-text" placeholder="Escribe tu subtítulo aquí">
            <div class="form-item-actions">
              <button class="form-item-action-btn" title="Eliminar">🗑️</button>
            </div>
          </div>
          <div class="form-item-content"></div>
        `;
        break;
      case 'heading':
        itemHtml = `
          <div class="form-item-header">
            <input type="text" class="heading-text" placeholder="Escribe tu título aquí">
            <div class="form-item-actions">
              <button class="form-item-action-btn" title="Eliminar">🗑️</button>
            </div>
          </div>
          <div class="form-item-content"></div>
        `;
        break;
      case 'textarea':
        itemHtml = `
          <div class="form-item-header">
            <input type="text" class="form-item-title" placeholder="Título del área de texto">
            <div class="form-item-actions">
              <button class="form-item-action-btn" title="Eliminar">🗑️</button>
            </div>
          </div>
          <div class="form-item-content">
            <textarea class="large-textarea" placeholder="Escribe tu texto aquí..."></textarea>
          </div>
        `;
        break;
      case 'image':
        itemHtml = `
          <div class="form-item-header">
            <input type="text" class="form-item-title" placeholder="Título de la imagen">
            <div class="form-item-actions">
              <button class="form-item-action-btn" title="Eliminar">🗑️</button>
            </div>
          </div>
          <div class="form-item-content">
            <div class="image-upload-container">
              <div class="image-preview">
                <div class="image-preview-placeholder">
                  <p>🖼️ Vista previa de la imagen</p>
                  <p>Haz clic en "Seleccionar imagen" para agregar una</p>
                </div>
              </div>
              <input type="file" class="image-file-input" accept="image/*" style="display: none;">
              <button class="image-upload-btn">Seleccionar imagen</button>
              <input type="text" class="image-caption" placeholder="Descripción de la imagen (opcional)">
            </div>
            </div>
        `;
        break;
    }
    
    // Crear la estructura correcta para GridStack
    const itemElement = document.createElement('div');
    itemElement.className = 'grid-stack-item';
    
    const contentElement = document.createElement('div');
    contentElement.className = 'grid-stack-item-content';
    contentElement.setAttribute('data-type', type);
    contentElement.innerHTML = itemHtml;
    
    itemElement.appendChild(contentElement);
    
    // Encontrar la primera posición disponible
    let position = findAvailablePosition(2, 2);
    
    // Agregar a la cuadrícula
    grid.addWidget(itemElement, {
      w: 2, // Ancho inicial de 2 celdas
      h: 2, // Alto inicial de 2 celdas
      minW: 1, // Mínimo ancho de 1 celda
      minH: 1, // Mínimo alto de 1 celda
      x: position.x,
      y: position.y,
      id: itemId
    });
    
    // Configurar eventos para el nuevo elemento
    setupItemEvents(contentElement, type, itemId);
    
    // Agregar a formData
    let newItemData = {
      id: itemId,
      type: type,
      question: '',
      position: position,
      dimensions: { width: 2, height: 2 } // En celdas, no píxeles
    };
    
    if (type === 'multiple') {
      newItemData.options = ['Opción 1', 'Opción 2'];
    } else if (type === 'connect') {
      newItemData.pairs = [{a: '', b: ''}];
    } else if (type === 'progression') {
      newItemData.number = progressionCounter;
    } else if (type === 'textarea') {
      newItemData.content = '';
    } else if (type === 'image') {
      newItemData.imageData = null;
      newItemData.caption = '';
    } else if (type === 'subtitle' || type === 'heading') {
      newItemData.text = '';
    }
    
    formData.items.push(newItemData);
    setUnsavedChanges();
  }
  
  // Encontrar posición disponible en la cuadrícula
  function findAvailablePosition(width, height) {
    if (!grid) return { x: 0, y: 0 };
    
    const nodes = grid.engine.nodes || [];
    const maxY = nodes.length > 0 ? Math.max(...nodes.map(n => n.y + n.h)) : 0;
    
    // Buscar espacio disponible desde la parte superior
    for (let y = 0; y <= maxY + 5; y++) {
      for (let x = 0; x <= 6 - width; x++) {
        const spaceAvailable = !nodes.some(node => 
          node.x < x + width && 
          node.x + node.w > x && 
          node.y < y + height && 
          node.y + node.h > y
        );
        
        if (spaceAvailable) {
          return { x, y };
        }
      }
    }
    
    // Si no se encuentra espacio, colocar al final
    return { x: 0, y: maxY + 1 };
  }
  
  function setupItemEvents(itemElement, type, itemId) {
    // Botón de eliminar
    const deleteBtn = itemElement.querySelector('.form-item-actions .form-item-action-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function() {
        // Si es una progresión, actualizar el contador
        if (type === 'progression') {
          progressionCounter--;
          updateProgressionNumbers();
        }
        
        // Encontrar el elemento padre grid-stack-item
        const gridItem = itemElement.closest('.grid-stack-item');
        
        if (gridItem && grid) {
          // Eliminar de la cuadrícula
          grid.removeWidget(gridItem, true);
          
          // Eliminar de formData
          formData.items = formData.items.filter(item => item.id !== itemId);
          setUnsavedChanges();
        }
      });
    }
    
    // Título de la pregunta (para tipos que lo usan)
    if (type !== 'progression') {
      const titleInput = itemElement.querySelector('.form-item-title, .subtitle-text, .heading-text');
      if (titleInput) {
        titleInput.addEventListener('input', function() {
          const itemIndex = formData.items.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            if (type === 'subtitle' || type === 'heading') {
              formData.items[itemIndex].text = this.value;
            } else {
              formData.items[itemIndex].question = this.value;
            }
            setUnsavedChanges();
          }
        });
      }
    }
    
    // Configuración para preguntas de opción múltiple
    if (type === 'multiple') {
      const addOptionBtn = itemElement.querySelector('.add-option-btn');
      const optionsContainer = itemElement.querySelector('.multiple-options');
      
      if (addOptionBtn && optionsContainer) {
        addOptionBtn.addEventListener('click', function() {
          const optionCount = optionsContainer.querySelectorAll('.multiple-option').length;
          const newOption = document.createElement('div');
          newOption.className = 'multiple-option';
          newOption.innerHTML = `
            <input type="radio" name="mc_${itemId}" disabled>
            <input type="text" placeholder="Opción ${optionCount + 1}">
            <button class="form-item-action-btn remove-option-btn" title="Eliminar opción">×</button>
          `;
          optionsContainer.appendChild(newOption);
          
          // Evento para eliminar opción
          const removeBtn = newOption.querySelector('.remove-option-btn');
          if (removeBtn) {
            removeBtn.addEventListener('click', function() {
              newOption.remove();
              updateMultipleOptionsData(itemId);
            });
          }
          
          // Evento para cambiar texto de opción
          const input = newOption.querySelector('input[type="text"]');
          if (input) {
            input.addEventListener('input', function() {
              updateMultipleOptionsData(itemId);
            });
          }
          
          updateMultipleOptionsData(itemId);
        });
      }
      
      // Configurar eventos para opciones existentes
      itemElement.querySelectorAll('.multiple-option input[type="text"]').forEach(input => {
        input.addEventListener('input', function() {
          updateMultipleOptionsData(itemId);
        });
      });
      
      itemElement.querySelectorAll('.remove-option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          this.closest('.multiple-option').remove();
          updateMultipleOptionsData(itemId);
        });
      });
    }
    
    // Configuración para preguntas de conexión
    if (type === 'connect') {
      const addPairBtn = itemElement.querySelector('.add-pair-btn');
      const pairsContainer = itemElement.querySelector('.connect-pairs');
      
      if (addPairBtn && pairsContainer) {
        addPairBtn.addEventListener('click', function() {
          const newPair = document.createElement('div');
          newPair.className = 'connect-pair';
          newPair.innerHTML = `
            <input type="text" placeholder="Elemento A">
            <span>→</span>
            <input type="text" placeholder="Elemento B">
            <button class="form-item-action-btn remove-pair-btn" title="Eeliminar par">×</button>
          `;
          pairsContainer.appendChild(newPair);
          
          // Evento para eliminar par
          const removeBtn = newPair.querySelector('.remove-pair-btn');
          if (removeBtn) {
            removeBtn.addEventListener('click', function() {
              newPair.remove();
              updateConnectPairsData(itemId);
            });
          }
          
          // Eventos para cambiar texto de los pares
          newPair.querySelectorAll('input[type="text"]').forEach(input => {
            input.addEventListener('input', function() {
              updateConnectPairsData(itemId);
            });
          });
          
          updateConnectPairsData(itemId);
        });
      }
      
      // Configurar eventos para pares existentes
      itemElement.querySelectorAll('.connect-pair input[type="text"]').forEach(input => {
        input.addEventListener('input', function() {
          updateConnectPairsData(itemId);
        });
      });
      
      itemElement.querySelectorAll('.remove-pair-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          this.closest('.connect-pair').remove();
          updateConnectPairsData(itemId);
        });
      });
    }
    
    // Para campos de texto simple
    if (type === 'text') {
      const textInput = itemElement.querySelector('.text-input');
      if (textInput) {
        textInput.addEventListener('input', function() {
          const itemIndex = formData.items.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            formData.items[itemIndex].answer = this.value;
            setUnsavedChanges();
          }
        });
      }
    }
    
    // Para áreas de texto amplio
    if (type === 'textarea') {
      const textarea = itemElement.querySelector('.large-textarea');
      if (textarea) {
        textarea.addEventListener('input', function() {
          const itemIndex = formData.items.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            formData.items[itemIndex].content = this.value;
            setUnsavedChanges();
          }
        });
      }
    }
    
    // Para imágenes
    if (type === 'image') {
      const uploadBtn = itemElement.querySelector('.image-upload-btn');
      const fileInput = itemElement.querySelector('.image-file-input');
      const imagePreview = itemElement.querySelector('.image-preview');
      const captionInput = itemElement.querySelector('.image-caption');
      
      // Evento para abrir el selector de archivos
      if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', function() {
          fileInput.click();
        });
      }
      
      // Evento cuando se selecciona una imagen
      if (fileInput) {
        fileInput.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
              // Actualizar vista previa
              if (imagePreview) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
              }
              
              // Guardar en formData
              const itemIndex = formData.items.findIndex(item => item.id === itemId);
              if (itemIndex !== -1) {
                formData.items[itemIndex].imageData = e.target.result;
                setUnsavedChanges();
              }
            };
            
            reader.readAsDataURL(file);
          }
        });
      }
      
      // Evento para la descripción de la imagen
      if (captionInput) {
        captionInput.addEventListener('input', function() {
          const itemIndex = formData.items.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            formData.items[itemIndex].caption = this.value;
            setUnsavedChanges();
          }
        });
      }
    }
  }
  
  function updateMultipleOptionsData(itemId) {
    if (!grid) return;
    
    const gridItem = grid.engine.nodes.find(n => n.id === itemId)?.el;
    if (!gridItem) return;
    
    const itemElement = gridItem.querySelector('.grid-stack-item-content');
    const options = Array.from(itemElement.querySelectorAll('.multiple-option input[type="text"]')).map(input => input.value);
    
    const itemIndex = formData.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      formData.items[itemIndex].options = options;
      setUnsavedChanges();
    }
  }
  
  function updateConnectPairsData(itemId) {
    if (!grid) return;
    
    const gridItem = grid.engine.nodes.find(n => n.id === itemId)?.el;
    if (!gridItem) return;
    
    const itemElement = gridItem.querySelector('.grid-stack-item-content');
    const pairs = Array.from(itemElement.querySelectorAll('.connect-pair')).map(pair => ({
      a: pair.querySelector('input:nth-of-type(1)')?.value || '',
      b: pair.querySelector('input:nth-of-type(2)')?.value || ''
    }));
    
    const itemIndex = formData.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      formData.items[itemIndex].pairs = pairs;
      setUnsavedChanges();
    }
  }
  
  function updateProgressionNumbers() {
    // Obtener todas las progresiones y actualizar sus números
    const progressionItems = document.querySelectorAll('.grid-stack-item-content[data-type="progression"]');
    progressionItems.forEach((item, index) => {
      const numberElement = item.querySelector('.progression-number');
      if (numberElement) {
        numberElement.textContent = `Progresión ${index + 1}`;
        
        // Actualizar también en formData
        const gridItem = item.closest('.grid-stack-item');
        if (gridItem) {
          const itemId = gridItem.getAttribute('gs-id');
          if (itemId) {
            const itemIndex = formData.items.findIndex(item => item.id === parseInt(itemId));
            if (itemIndex !== -1) {
              formData.items[itemIndex].number = index + 1;
            }
          }
        }
      }
    });
    
    // Actualizar el contador
    progressionCounter = progressionItems.length;
    setUnsavedChanges();
  }
  
  function setUnsavedChanges() {
    hasUnsavedChanges = true;
    if (saveStatus) {
      saveStatus.textContent = 'Cambios sin guardar';
      saveStatus.style.backgroundColor = '#ffebee';
      saveStatus.style.color = '#c62828';
    }
  }
  
  function setSavedChanges() {
    hasUnsavedChanges = false;
    if (saveStatus) {
      saveStatus.textContent = 'Todos los cambios guardados';
      saveStatus.style.backgroundColor = '#e8f5e9';
      saveStatus.style.color = '#2e7d32';
    }
  }
  
  function saveForm() {
    // Guardar el estado actual de la cuadrícula
    saveGridState();
    
    // Guardar en localStorage
    localStorage.setItem('currentForm', JSON.stringify(formData));
    setSavedChanges();
    alert('Formulario guardado exitosamente');
  }
  
  function saveAsNewForm() {
    const newTitle = prompt('Ingrese un nuevo título para el formulario:');
    if (newTitle) {
      formData.title = newTitle;
      formData.id = Date.now(); // Nuevo ID
      
      // Guardar como nuevo
      const allForms = JSON.parse(localStorage.getItem('savedForms') || '[]');
      allForms.push(formData);
      localStorage.setItem('savedForms', JSON.stringify(allForms));
      
      setSavedChanges();
      alert('Formulario guardado como nuevo exitosamente');
    }
  }
  
  function previewForm() {
    // Guardar primero
    saveForm();
    
    // Aquí iría la lógica para abrir una vista previa
    alert('Esta función abriría una vista previa del formulario');
  }
  
  function exitForm() {
    if (hasUnsavedChanges) {
      const confirmExit = confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?');
      if (!confirmExit) return;
    }
    
    // Redirigir a la página anterior o al dashboard
    window.location.href = 'Administrador.html'; // Cambiar por la URL correcta
  }
  
  function loadGridItems() {
    if (!formData.items.length || !grid) return;
    
    formData.items.forEach(item => {
      let itemHtml = '';
      
      switch(item.type) {
        case 'text':
          itemHtml = `
            <div class="form-item-header">
              <input type="text" class="form-item-title" placeholder="Pregunta de texto" value="${item.question || ''}">
              <div class="form-item-actions">
                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
              </div>
            </div>
            <div class="form-item-content">
              <input type="text" class="text-input" placeholder="Respuesta de texto" value="${item.answer || ''}">
            </div>
          `;
          break;
        case 'multiple':
          itemHtml = `
            <div class="form-item-header">
              <input type="text" class="form-item-title" placeholder="Pregunta de opción múltiple" value="${item.question || ''}">
              <div class="form-item-actions">
                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
              </div>
            </div>
            <div class="form-item-content">
              <div class="multiple-options">
                ${item.options ? item.options.map((option, index) => `
                  <div class="multiple-option">
                    <input type="radio" name="mc_${item.id}" disabled>
                    <input type="text" placeholder="Opción ${index + 1}" value="${option}">
                    <button class="form-item-action-btn remove-option-btn" title="Eliminar opción">×</button>
                  </div>
                `).join('') : ''}
              </div>
              <button class="add-option-btn">+ Añadir opción</button>
            </div>
          `;
          break;
        case 'truefalse':
          itemHtml = `
            <div class="form-item-header">
              <input type="text" class="form-item-title" placeholder="Pregunta Verdadero/Falso" value="${item.question || ''}">
              <div class="form-item-actions">
                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
              </div>
            </div>
            <div class="form-item-content">
              <div class="truefalse-options">
                <label><input type="radio" name="tf_${item.id}" value="true"> Verdadero</label>
                <label><input type="radio" name="tf_${item.id}" value="false"> Falso</label>
              </div>
            </div>
          `;
          break;
        case 'connect':
          itemHtml = `
            <div class="form-item-header">
              <input type="text" class="form-item-title" placeholder="Pregunta de conectar" value="${item.question || ''}">
              <div class="form-item-actions">
                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
              </div>
            </div>
            <div class="form-item-content">
              <div class="connect-pairs">
                ${item.pairs ? item.pairs.map(pair => `
                  <div class="connect-pair">
                    <input type="text" placeholder="Elemento A" value="${pair.a || ''}">
                    <span>→</span>
                    <input type="text" placeholder="Elemento B" value="${pair.b || ''}">
                    <button class="form-item-action-btn remove-pair-btn" title="Eliminar par">×</button>
                  </div>
                `).join('') : ''}
              </div>
              <button class="add-pair-btn">+ Añadir par</button>
            </div>
          `;
          break;
        case 'progression':
          itemHtml = `
            <div class="form-item-header">
              <span class="progression-number">Progresión ${item.number || 1}</span>
              <div class="form-item-actions">
                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
              </div>
            </div>
            <div class="form-item-content"></div>
          `;
          break;
        case 'subtitle':
          itemHtml = `
            <div class="form-item-header">
              <input type="text" class="subtitle-text" placeholder="Escribe tu subtítulo aquí" value="${item.text || ''}">
              <div class="form-item-actions">
                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
              </div>
            </div>
            <div class="form-item-content"></div>
          `;
          break;
        case 'heading':
          itemHtml = `
            <div class="form-item-header">
              <input type="text" class="heading-text" placeholder="Escribe tu título aquí" value="${item.text || ''}">
              <div class="form-item-actions">
                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
              </div>
            </div>
            <div class="form-item-content"></div>
          `;
          break;
        case 'textarea':
          itemHtml = `
            <div class="form-item-header">
              <input type="text" class="form-item-title" placeholder="Título del área de texto" value="${item.question || ''}">
              <div class="form-item-actions">
                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
              </div>
            </div>
            <div class="form-item-content">
              <textarea class="large-textarea" placeholder="Escribe tu texto aquí...">${item.content || ''}</textarea>
            </div>
          `;
          break;
        case 'image':
          itemHtml = `
            <div class="form-item-header">
              <input type="text" class="form-item-title" placeholder="Título de la imagen" value="${item.question || ''}">
              <div class="form-item-actions">
                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
              </div>
            </div>
            <div class="form-item-content">
              <div class="image-upload-container">
                <div class="image-preview">
                  ${item.imageData ? 
                    `<img src="${item.imageData}" alt="Vista previa">` : 
                    `<div class="image-preview-placeholder">
                      <p>🖼️ Vista previa de la imagen</p>
                      <p>Haz clic en "Seleccionar imagen" para agregar una</p>
                    </div>`
                  }
                </div>
                <input type="file" class="image-file-input" accept="image/*" style="display: none;">
                <button class="image-upload-btn">Seleccionar imagen</button>
                <input type="text" class="image-caption" placeholder="Descripción de la imagen (opcional)" value="${item.caption || ''}">
              </div>
            </div>
          `;
          break;
      }
      
      // Crear la estructura correcta para GridStack
      const itemElement = document.createElement('div');
      itemElement.className = 'grid-stack-item';
      
      const contentElement = document.createElement('div');
      contentElement.className = 'grid-stack-item-content';
      contentElement.setAttribute('data-type', item.type);
      contentElement.innerHTML = itemHtml;
      
      itemElement.appendChild(contentElement);
      
      // Agregar a la cuadrícula
      grid.addWidget(itemElement, {
        w: item.dimensions?.width || 2,
        h: item.dimensions?.height || 2,
        x: item.position?.x || 0,
        y: item.position?.y || 0,
        minW: 1,
        minH: 1,
        id: item.id
      });
      
      setupItemEvents(contentElement, item.type, item.id);
      
      // Actualizar contador de progresiones
      if (item.type === 'progression') {
        progressionCounter = Math.max(progressionCounter, item.number || 0);
      }
    });
    
    // Actualizar números de progresión después de cargar
    updateProgressionNumbers();
  }
});
// Agregar esta función para manejar redimensionamiento de ventana
function handleResize() {
  if (grid) {
    // Forzar recálculo del grid
    setTimeout(() => {
      grid.engine.updateNodeAll();
      grid.compact();
    }, 100);
  }
}

// Agregar event listener para redimensionamiento
window.addEventListener('resize', handleResize);

// Llamar una vez al inicio
setTimeout(handleResize, 500);