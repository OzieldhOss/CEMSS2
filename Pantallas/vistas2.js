 // ===== VARIABLES GLOBALES =====
        const formGridContainer = document.getElementById('formGridContainer');
        const formOptionButtons = document.querySelectorAll('.form-option-btn');
        const saveBtn = document.getElementById('saveBtn');
        const saveAsNewBtn = document.getElementById('saveAsNewBtn');
        const previewBtn = document.getElementById('previewBtn');
        const exitBtn = document.getElementById('exitBtn');
        const exportWordBtn = document.getElementById('exportWordBtn');
        const saveStatus = document.getElementById('saveStatus');
        const formTitleInput = document.querySelector('.form-title-input');
        const formDescriptionInput = document.querySelector('.form-description-input');
        
        let grid = null;
        let formData = {
            title: '',
            description: '',
            items: []
        };
        let hasUnsavedChanges = false;
        let progressionCounter = 0;

        // ===== INICIALIZACIÓN =====
        document.addEventListener('DOMContentLoaded', function() {
            initGrid();
            loadFormData();
            setupEventListeners();
        });

        // ===== CONFIGURACIÓN DEL GRID =====
        function initGrid() {
            if (grid) {
                grid.destroy(false);
            }

            grid = GridStack.init({
                column: 1,
                cellHeight: 80,
                minRow: 1,
                margin: 5,
                float: false,
                disableOneColumnMode: true,
                alwaysShowResizeHandle: false,
                resizable: {
                    handles: 's'
                },
                draggable: {
                    handle: '.form-item-header'
                },
                acceptWidgets: true,
                staticGrid: false,
                animate: true
            }, formGridContainer);

            grid.on('change', function(event, items) {
                saveGridState();
                setTimeout(updateGridLayout, 100);
            });

            grid.on('added', function(event, items) {
                setTimeout(updateGridLayout, 100);
            });

            grid.on('removed', function(event, items) {
                setTimeout(updateGridLayout, 100);
            });
        }

        function updateGridLayout() {
            if (!grid) return;
            
            const nodes = grid.engine.nodes || [];
            let totalHeight = 0;
            
            if (nodes.length > 0) {
                const maxY = Math.max(...nodes.map(n => n.y + n.h));
                totalHeight = maxY * grid.opts.cellHeight;
            }
            
            const gridStackElement = document.querySelector('.grid-stack');
            if (gridStackElement) {
                gridStackElement.style.minHeight = Math.max(totalHeight, 300) + 'px';
            }
        }

        // ===== GESTIÓN DE DATOS =====
        function loadFormData() {
            const savedForm = localStorage.getItem('currentForm');
            if (savedForm) {
                try {
                    formData = JSON.parse(savedForm);
                    if (formTitleInput) formTitleInput.value = formData.title || '';
                    if (formDescriptionInput) formDescriptionInput.value = formData.description || '';
                    
                    progressionCounter = 0;
                    setSavedChanges();
                } catch (e) {
                    console.error('Error loading form data:', e);
                }
            }
            loadGridItems();
        }

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

        // ===== GESTIÓN DE ELEMENTOS DEL FORMULARIO =====
        function addFormItem(type) {
            if (!grid) {
                console.error('Grid no inicializada');
                return;
            }
            
            const itemId = Date.now();
            const { itemHtml, initialHeight, itemData } = generateItemHtml(type, itemId);
            
            const itemElement = document.createElement('div');
            itemElement.className = 'grid-stack-item';
            
            const contentElement = document.createElement('div');
            contentElement.className = 'grid-stack-item-content';
            contentElement.setAttribute('data-type', type);
            contentElement.setAttribute('data-item-id', itemId);
            contentElement.innerHTML = itemHtml;
            
            itemElement.appendChild(contentElement);
            
            // Calcular posición Y (debajo del último elemento)
            const nodes = grid.engine.nodes || [];
            const maxY = nodes.length > 0 ? Math.max(...nodes.map(n => n.y + n.h)) : 0;
            const positionY = maxY;
            
            grid.addWidget(itemElement, {
                w: 1,
                h: initialHeight,
                minW: 1,
                maxW: 1,
                minH: 1,
                x: 0,
                y: positionY,
                id: itemId,
                noMove: false,
                noResize: true,
                autoPosition: false
            });
            
            setupItemEvents(contentElement, type, itemId);
            formData.items.push({ ...itemData, id: itemId, position: { x: 0, y: positionY }, dimensions: { width: 1, height: initialHeight } });
            setUnsavedChanges();
            
            setTimeout(updateGridLayout, 100);
        }

        function generateItemHtml(type, itemId) {
            const templates = {
                text: {
                    height: 2,
                    html: `
                        <div class="form-item-header">
                            <input type="text" class="form-item-title" placeholder="Pregunta de texto">
                            <div class="form-item-actions">
                                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
                            </div>
                        </div>
                        <div class="form-item-content">
                            <input type="text" class="text-input" placeholder="Respuesta de texto">
                        </div>
                    `,
                    data: { type: 'text', question: '', answer: '' }
                },
                multiple: {
                    height: 3,
                    html: `
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
                    `,
                    data: { type: 'multiple', question: '', options: ['Opción 1', 'Opción 2'], correctAnswer: 0 }
                },
                truefalse: {
                    height: 2,
                    html: `
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
                    `,
                    data: { type: 'truefalse', question: '', answer: '' }
                },
                connect: {
                    height: 3,
                    html: `
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
                    `,
                    data: { type: 'connect', question: '', pairs: [{a: '', b: ''}] }
                },
                progression: {
                    height: 1,
                    html: `
                        <div class="form-item-header">
                            <span class="progression-number">Progresión ${progressionCounter + 1}</span>
                            <div class="form-item-actions">
                                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
                            </div>
                        </div>
                        <div class="form-item-content"></div>
                    `,
                    data: { type: 'progression', number: progressionCounter + 1 }
                },
                subtitle: {
                    height: 1,
                    html: `
                        <div class="form-item-header">
                            <input type="text" class="subtitle-text" placeholder="Escribe tu subtítulo aquí">
                            <div class="form-item-actions">
                                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
                            </div>
                        </div>
                        <div class="form-item-content"></div>
                    `,
                    data: { type: 'subtitle', text: '' }
                },
                heading: {
                    height: 1,
                    html: `
                        <div class="form-item-header">
                            <input type="text" class="heading-text" placeholder="Escribe tu título aquí">
                            <div class="form-item-actions">
                                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
                            </div>
                        </div>
                        <div class="form-item-content"></div>
                    `,
                    data: { type: 'heading', text: '' }
                },
                textarea: {
                    height: 3,
                    html: `
                        <div class="form-item-header">
                            <input type="text" class="form-item-title" placeholder="Título del área de texto">
                            <div class="form-item-actions">
                                <button class="form-item-action-btn" title="Eliminar">🗑️</button>
                            </div>
                        </div>
                        <div class="form-item-content">
                            <textarea class="large-textarea" placeholder="Escribe tu texto aquí..."></textarea>
                        </div>
                    `,
                    data: { type: 'textarea', question: '', content: '' }
                },
                image: {
                    height: 4,
                    html: `
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
                    `,
                    data: { type: 'image', question: '', imageData: null, caption: '' }
                }
            };

            if (type === 'progression') progressionCounter++;
            
            return {
                itemHtml: templates[type].html,
                initialHeight: templates[type].height,
                itemData: templates[type].data
            };
        }

        function setupItemEvents(itemElement, type, itemId) {
            // Evento para eliminar item
            const deleteBtn = itemElement.querySelector('.form-item-action-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    const itemToRemove = grid.engine.nodes.find(n => n.id == itemId);
                    if (itemToRemove) {
                        grid.removeWidget(itemToRemove.el, true);
                        formData.items = formData.items.filter(item => item.id !== itemId);
                        
                        if (type === 'progression') {
                            updateProgressionNumbers();
                        }
                        
                        setUnsavedChanges();
                        setTimeout(updateGridLayout, 100);
                    }
                });
            }
            
            // Configurar eventos específicos según el tipo
            const eventHandlers = {
                multiple: () => setupMultipleChoiceEvents(itemElement, itemId),
                connect: () => setupConnectEvents(itemElement, itemId),
                image: () => setupImageEvents(itemElement, itemId),
                text: () => setupInputEvents(itemElement, itemId, type),
                truefalse: () => setupInputEvents(itemElement, itemId, type),
                textarea: () => setupInputEvents(itemElement, itemId, type),
                subtitle: () => setupInputEvents(itemElement, itemId, type),
                heading: () => setupInputEvents(itemElement, itemId, type)
            };
            
            if (eventHandlers[type]) {
                eventHandlers[type]();
            }
        }

        function setupMultipleChoiceEvents(itemElement, itemId) {
            // Agregar nueva opción
            const addOptionBtn = itemElement.querySelector('.add-option-btn');
            addOptionBtn.addEventListener('click', function() {
                const optionsContainer = itemElement.querySelector('.multiple-options');
                const optionCount = optionsContainer.children.length + 1;
                
                const newOption = document.createElement('div');
                newOption.className = 'multiple-option';
                newOption.innerHTML = `
                    <input type="radio" name="mc_${itemId}" disabled>
                    <input type="text" placeholder="Opción ${optionCount}">
                    <button class="form-item-action-btn remove-option-btn" title="Eliminar opción">×</button>
                `;
                
                optionsContainer.appendChild(newOption);
                
                // Configurar evento para eliminar opción
                const removeOptionBtn = newOption.querySelector('.remove-option-btn');
                removeOptionBtn.addEventListener('click', function() {
                    if (optionsContainer.children.length > 1) {
                        newOption.remove();
                        updateMultipleOptionsData(itemId);
                    }
                });
                
                // Configurar evento para actualizar datos
                const optionInput = newOption.querySelector('input[type="text"]');
                optionInput.addEventListener('input', function() {
                    updateMultipleOptionsData(itemId);
                });
                
                updateMultipleOptionsData(itemId);
            });
            
            // Configurar eventos para opciones existentes
            const removeOptionBtns = itemElement.querySelectorAll('.remove-option-btn');
            removeOptionBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const option = this.parentElement;
                    if (itemElement.querySelectorAll('.multiple-option').length > 1) {
                        option.remove();
                        updateMultipleOptionsData(itemId);
                    }
                });
            });
            
            // Configurar eventos para inputs de opciones
            const optionInputs = itemElement.querySelectorAll('.multiple-option input[type="text"]');
            optionInputs.forEach(input => {
                input.addEventListener('input', function() {
                    updateMultipleOptionsData(itemId);
                });
            });
            
            // Configurar evento para título
            const titleInput = itemElement.querySelector('.form-item-title');
            titleInput.addEventListener('input', function() {
                updateItemData(itemId, 'question', this.value);
            });
        }

        function setupConnectEvents(itemElement, itemId) {
            // Agregar nuevo par
            const addPairBtn = itemElement.querySelector('.add-pair-btn');
            addPairBtn.addEventListener('click', function() {
                const pairsContainer = itemElement.querySelector('.connect-pairs');
                
                const newPair = document.createElement('div');
                newPair.className = 'connect-pair';
                newPair.innerHTML = `
                    <input type="text" placeholder="Elemento A">
                    <span>→</span>
                    <input type="text" placeholder="Elemento B">
                    <button class="form-item-action-btn remove-pair-btn" title="Eliminar par">×</button>
                `;
                
                pairsContainer.appendChild(newPair);
                
                // Configurar evento para eliminar par
                const removePairBtn = newPair.querySelector('.remove-pair-btn');
                removePairBtn.addEventListener('click', function() {
                    if (pairsContainer.children.length > 1) {
                        newPair.remove();
                        updateConnectPairsData(itemId);
                    }
                });
                
                // Configurar eventos para inputs
                const pairInputs = newPair.querySelectorAll('input[type="text"]');
                pairInputs.forEach(input => {
                    input.addEventListener('input', function() {
                        updateConnectPairsData(itemId);
                    }
                )});
                
                updateConnectPairsData(itemId);
            });
            
            // Configurar eventos para pares existentes
            const removePairBtns = itemElement.querySelectorAll('.remove-pair-btn');
            removePairBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const pair = this.parentElement;
                    if (itemElement.querySelectorAll('.connect-pair').length > 1) {
                        pair.remove();
                        updateConnectPairsData(itemId);
                    }
                });
            });
            
            // Configurar eventos para inputs de pares
            const pairInputs = itemElement.querySelectorAll('.connect-pair input[type="text"]');
            pairInputs.forEach(input => {
                input.addEventListener('input', function() {
                    updateConnectPairsData(itemId);
                });
            });
            
            // Configurar evento para título
            const titleInput = itemElement.querySelector('.form-item-title');
            titleInput.addEventListener('input', function() {
                updateItemData(itemId, 'question', this.value);
            });
        }

        function setupImageEvents(itemElement, itemId) {
            const uploadBtn = itemElement.querySelector('.image-upload-btn');
            const fileInput = itemElement.querySelector('.image-file-input');
            const imagePreview = itemElement.querySelector('.image-preview');
            
            uploadBtn.addEventListener('click', function() {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
                        updateItemData(itemId, 'imageData', e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Configurar evento para título
            const titleInput = itemElement.querySelector('.form-item-title');
            titleInput.addEventListener('input', function() {
                updateItemData(itemId, 'question', this.value);
            });
            
            // Configurar evento para descripción
            const captionInput = itemElement.querySelector('.image-caption');
            captionInput.addEventListener('input', function() {
                updateItemData(itemId, 'caption', this.value);
            });
        }

        function setupInputEvents(itemElement, itemId, type) {
            // Configurar evento para título (si existe)
            const titleInput = itemElement.querySelector('.form-item-title');
            if (titleInput) {
                titleInput.addEventListener('input', function() {
                    updateItemData(itemId, 'question', this.value);
                });
            }
            
            // Configurar evento para texto (subtítulo, heading)
            const textInput = itemElement.querySelector('.subtitle-text, .heading-text');
            if (textInput) {
                textInput.addEventListener('input', function() {
                    updateItemData(itemId, 'text', this.value);
                });
            }
            
            // Configurar evento para textarea
            const textarea = itemElement.querySelector('.large-textarea');
            if (textarea) {
                textarea.addEventListener('input', function() {
                    updateItemData(itemId, 'content', this.value);
                });
            }
            
            // Configurar evento para input de texto simple
            const textInputField = itemElement.querySelector('.text-input');
            if (textInputField) {
                textInputField.addEventListener('input', function() {
                    updateItemData(itemId, 'answer', this.value);
                });
            }
            
            // Configurar evento para opciones verdadero/falso
            const trueFalseInputs = itemElement.querySelectorAll('input[type="radio"]');
            if (trueFalseInputs.length > 0) {
                trueFalseInputs.forEach(input => {
                    input.addEventListener('change', function() {
                        updateItemData(itemId, 'answer', this.value);
                    });
                });
            }
        }

        function updateItemData(itemId, property, value) {
            const itemIndex = formData.items.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                formData.items[itemIndex][property] = value;
                setUnsavedChanges();
            }
        }

        function updateMultipleOptionsData(itemId) {
            const itemElement = document.querySelector(`.grid-stack-item-content[data-item-id="${itemId}"]`);
            if (!itemElement) return;
            
            const options = [];
            const optionInputs = itemElement.querySelectorAll('.multiple-option input[type="text"]');
            
            optionInputs.forEach(input => {
                options.push(input.value || input.placeholder);
            });
            
            updateItemData(itemId, 'options', options);
        }

        function updateConnectPairsData(itemId) {
            const itemElement = document.querySelector(`.grid-stack-item-content[data-item-id="${itemId}"]`);
            if (!itemElement) return;
            
            const pairs = [];
            const pairElements = itemElement.querySelectorAll('.connect-pair');
            
            pairElements.forEach(pair => {
                const inputs = pair.querySelectorAll('input[type="text"]');
                if (inputs.length === 2) {
                    pairs.push({
                        a: inputs[0].value || '',
                        b: inputs[1].value || ''
                    });
                }
            });
            
            updateItemData(itemId, 'pairs', pairs);
        }

        function updateProgressionNumbers() {
            progressionCounter = 0;
            const progressionItems = formData.items.filter(item => item.type === 'progression');
            
            progressionItems.forEach(item => {
                progressionCounter++;
                item.number = progressionCounter;
                
                // Actualizar en la UI
                const itemElement = document.querySelector(`.grid-stack-item-content[data-item-id="${item.id}"]`);
                if (itemElement) {
                    const numberElement = itemElement.querySelector('.progression-number');
                    if (numberElement) {
                        numberElement.textContent = `Progresión ${progressionCounter}`;
                    }
                }
            });
        }

        // ===== CARGA DE ELEMENTOS GUARDADOS =====
        function loadGridItems() {
            if (!formData.items.length || !grid) return;
            
            formData.items.forEach(item => {
                const { itemHtml } = generateItemHtml(item.type, item.id);
                
                const itemElement = document.createElement('div');
                itemElement.className = 'grid-stack-item';
                
                const contentElement = document.createElement('div');
                contentElement.className = 'grid-stack-item-content';
                contentElement.setAttribute('data-type', item.type);
                contentElement.setAttribute('data-item-id', item.id);
                contentElement.innerHTML = itemHtml;
                
                itemElement.appendChild(contentElement);
                
                grid.addWidget(itemElement, {
                    w: 1,
                    h: item.dimensions.height,
                    minW: 1,
                    maxW: 1,
                    minH: 1,
                    x: 0,
                    y: item.position.y,
                    id: item.id,
                    noMove: false,
                    noResize: true,
                    autoPosition: false
                });
                
                // Restaurar datos guardados
                restoreItemData(contentElement, item);
                setupItemEvents(contentElement, item.type, item.id);
                
                if (item.type === 'progression') {
                    progressionCounter = Math.max(progressionCounter, item.number || 0);
                }
            });
            
            updateProgressionNumbers();
            setTimeout(updateGridLayout, 300);
        }

        function restoreItemData(itemElement, item) {
            switch(item.type) {
                case 'text':
                    if (itemElement.querySelector('.form-item-title')) itemElement.querySelector('.form-item-title').value = item.question || '';
                    if (itemElement.querySelector('.text-input')) itemElement.querySelector('.text-input').value = item.answer || '';
                    break;
                case 'multiple':
                    if (itemElement.querySelector('.form-item-title')) itemElement.querySelector('.form-item-title').value = item.question || '';
                    if (item.options && itemElement.querySelector('.multiple-options')) {
                        const optionsContainer = itemElement.querySelector('.multiple-options');
                        optionsContainer.innerHTML = '';
                        
                        item.options.forEach((option, index) => {
                            const optionElement = document.createElement('div');
                            optionElement.className = 'multiple-option';
                            optionElement.innerHTML = `
                                <input type="radio" name="mc_${item.id}" ${index === item.correctAnswer ? 'checked' : ''}>
                                <input type="text" placeholder="Opción ${index + 1}" value="${option}">
                                <button class="form-item-action-btn remove-option-btn" title="Eliminar opción">×</button>
                            `;
                            optionsContainer.appendChild(optionElement);
                        });
                    }
                    break;
                case 'truefalse':
                    if (itemElement.querySelector('.form-item-title')) itemElement.querySelector('.form-item-title').value = item.question || '';
                    if (item.answer) {
                        const radioButton = itemElement.querySelector(`input[value="${item.answer}"]`);
                        if (radioButton) radioButton.checked = true;
                    }
                    break;
                case 'connect':
                    if (itemElement.querySelector('.form-item-title')) itemElement.querySelector('.form-item-title').value = item.question || '';
                    if (item.pairs && itemElement.querySelector('.connect-pairs')) {
                        const pairsContainer = itemElement.querySelector('.connect-pairs');
                        pairsContainer.innerHTML = '';
                        
                        item.pairs.forEach(pair => {
                            const pairElement = document.createElement('div');
                            pairElement.className = 'connect-pair';
                            pairElement.innerHTML = `
                                <input type="text" placeholder="Elemento A" value="${pair.a || ''}">
                                <span>→</span>
                                <input type="text" placeholder="Elemento B" value="${pair.b || ''}">
                                <button class="form-item-action-btn remove-pair-btn" title="Eliminar par">×</button>
                            `;
                            pairsContainer.appendChild(pairElement);
                        });
                    }
                    break;
                case 'progression':
                    if (itemElement.querySelector('.progression-number')) {
                        itemElement.querySelector('.progression-number').textContent = `Progresión ${item.number || 1}`;
                    }
                    break;
                case 'subtitle':
                    if (itemElement.querySelector('.subtitle-text')) {
                        itemElement.querySelector('.subtitle-text').value = item.text || '';
                    }
                    break;
                case 'heading':
                    if (itemElement.querySelector('.heading-text')) {
                        itemElement.querySelector('.heading-text').value = item.text || '';
                    }
                    break;
                case 'textarea':
                    if (itemElement.querySelector('.form-item-title')) itemElement.querySelector('.form-item-title').value = item.question || '';
                    if (itemElement.querySelector('.large-textarea')) itemElement.querySelector('.large-textarea').value = item.content || '';
                    break;
                case 'image':
                    if (itemElement.querySelector('.form-item-title')) itemElement.querySelector('.form-item-title').value = item.question || '';
                    if (itemElement.querySelector('.image-caption')) itemElement.querySelector('.image-caption').value = item.caption || '';
                    if (item.imageData && itemElement.querySelector('.image-preview')) {
                        itemElement.querySelector('.image-preview').innerHTML = `<img src="${item.imageData}" alt="Vista previa">`;
                    }
                    break;
            }
        }

        // ===== MANEJO DE EVENTOS =====
        function setupEventListeners() {
            // Botones de opciones de formulario
            if (formOptionButtons && formOptionButtons.length) {
                formOptionButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        addFormItem(this.dataset.type);
                    });
                });
            }
            
            // Campos de título y descripción
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
            
            // Botones de acción
            if (saveBtn) saveBtn.addEventListener('click', saveForm);
            if (saveAsNewBtn) saveAsNewBtn.addEventListener('click', saveAsNewForm);
            if (previewBtn) previewBtn.addEventListener('click', previewForm);
            if (exportWordBtn) exportWordBtn.addEventListener('click', exportToWord);
            if (exitBtn) exitBtn.addEventListener('click', exitForm);
        }

        function setUnsavedChanges() {
            hasUnsavedChanges = true;
            if (saveStatus) {
                saveStatus.textContent = 'Cambios no guardados';
                saveStatus.style.backgroundColor = '#ffebee';
                saveStatus.style.color = '#c62828';
            }
        }
        
        function setSavedChanges() {
            hasUnsavedChanges = false;
            if (saveStatus) {
                saveStatus.textContent = 'Cambios guardados';
                saveStatus.style.backgroundColor = '#e8f5e9';
                saveStatus.style.color = '#2e7d32';
            }
        }

        // ===== FUNCIONALIDADES PRINCIPALES =====
        function saveForm() {
            formData.title = formTitleInput.value;
            formData.description = formDescriptionInput.value;
            
            localStorage.setItem('currentForm', JSON.stringify(formData));
            setSavedChanges();
            alert('Formulario guardado correctamente');
        }
        
        function saveAsNewForm() {
            const newFormData = {
                title: formTitleInput.value + ' (Copia)',
                description: formDescriptionInput.value,
                items: JSON.parse(JSON.stringify(formData.items))
            };
            
            // Generar nuevos IDs para los items
            newFormData.items.forEach(item => {
                item.id = Date.now() + Math.floor(Math.random() * 1000);
            });
            
            localStorage.setItem('currentForm', JSON.stringify(newFormData));
            location.reload();
        }
        
        function previewForm() {
            localStorage.setItem('currentForm', JSON.stringify(formData));
            window.open('preview.html', '_blank');
        }
        
        function exitForm() {
            if (hasUnsavedChanges) {
                const confirmExit = confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?');
                if (!confirmExit) return;
            }
            window.location.href = 'index.html';
        }

        // ===== EXPORTACIÓN A WORD =====
        function exportToWord() {
            const jsonData = getFormDataAsJSON();
            
            let htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${escapeHtml(jsonData.titulo)}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                        .description { color: #7f8c8d; margin-bottom: 30px; font-style: italic; }
                        .question { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #3498db; }
                        .question-title { font-weight: bold; color: #2c3e50; }
                        .options { margin: 10px 0 0 20px; }
                        .option { margin: 5px 0; }
                        .correct-answer { color: #27ae60; font-weight: bold; }
                        .pair { display: flex; margin: 5px 0; }
                        .pair-item { margin: 0 10px; }
                        .image-container { text-align: center; margin: 15px 0; }
                        .image-caption { font-style: italic; color: #7f8c8d; }
                        .text-content { margin: 10px 0; white-space: pre-wrap; }
                    </style>
                </head>
                <body>
                    <h1>${escapeHtml(jsonData.titulo)}</h1>
                    <div class="description">${escapeHtml(jsonData.descripcion)}</div>
            `;
            
            // Agregar cada pregunta al contenido HTML
            jsonData.preguntas.forEach((pregunta, index) => {
                htmlContent += `<div class="question">`;
                htmlContent += `<div class="question-title">${index + 1}. ${escapeHtml(pregunta.pregunta)}</div>`;
                
                switch(pregunta.tipo) {
                    case 'opcion_multiple':
                        htmlContent += `<div class="options">`;
                        pregunta.opciones.forEach((opcion, idx) => {
                            const isCorrect = pregunta.respuesta_correcta === idx;
                            htmlContent += `<div class="option ${isCorrect ? 'correct-answer' : ''}">`;
                            htmlContent += `○ ${escapeHtml(opcion)} ${isCorrect ? ' ✓' : ''}`;
                            htmlContent += `</div>`;
                        });
                        htmlContent += `</div>`;
                        break;
                        
                    case 'verdadero_falso':
                        htmlContent += `<div class="options">`;
                        htmlContent += `<div class="option ${pregunta.respuesta_correcta ? 'correct-answer' : ''}">`;
                        htmlContent += `○ Verdadero ${pregunta.respuesta_correcta ? ' ✓' : ''}`;
                        htmlContent += `</div>`;
                        htmlContent += `<div class="option ${!pregunta.respuesta_correcta ? 'correct-answer' : ''}">`;
                        htmlContent += `○ Falso ${!pregunta.respuesta_correcta ? ' ✓' : ''}`;
                        htmlContent += `</div>`;
                        htmlContent += `</div>`;
                        break;
                        
                    case 'conectar':
                        if (pregunta.pares && pregunta.pares.length > 0) {
                            htmlContent += `<div class="options">`;
                            pregunta.pares.forEach(par => {
                                htmlContent += `<div class="pair">`;
                                htmlContent += `<div class="pair-item">${escapeHtml(par.a)}</div>`;
                                htmlContent += `<div class="pair-item">→</div>`;
                                htmlContent += `<div class="pair-item">${escapeHtml(par.b)}</div>`;
                                htmlContent += `</div>`;
                            });
                            htmlContent += `</div>`;
                        }
                        break;
                        
                    case 'texto':
                        htmlContent += `<div class="options">`;
                        htmlContent += `<div class="option">Respuesta: ${escapeHtml(pregunta.respuesta_correcta || '[Texto libre]')}</div>`;
                        htmlContent += `</div>`;
                        break;
                        
                    case 'texto_largo':
                        htmlContent += `<div class="text-content">${escapeHtml(pregunta.contenido || '[Contenido de texto]')}</div>`;
                        break;
                        
                    case 'imagen':
                        if (pregunta.imagen_data) {
                            htmlContent += `<div class="image-container">`;
                            htmlContent += `<img src="${pregunta.imagen_data}" alt="${escapeHtml(pregunta.pie_de_imagen || 'Imagen')}" style="max-width: 100%; height: auto;">`;
                            if (pregunta.pie_de_imagen) {
                                htmlContent += `<div class="image-caption">${escapeHtml(pregunta.pie_de_imagen)}</div>`;
                            }
                            htmlContent += `</div>`;
                        }
                        break;
                        
                    case 'subtitulo':
                        htmlContent += `<h3>${escapeHtml(pregunta.texto)}</h3>`;
                        break;
                        
                    case 'encabezado':
                        htmlContent += `<h2>${escapeHtml(pregunta.texto)}</h2>`;
                        break;
                        
                    case 'progresion':
                        htmlContent += `<div>Progresión ${pregunta.numero}</div>`;
                        break;
                        
                    default:
                        htmlContent += `<div class="options">[Tipo de pregunta: ${pregunta.tipo}]</div>`;
                }
                
                htmlContent += `</div>`;
            });
            
            htmlContent += `
                </body>
                </html>
            `;
            
            // Crear y descargar el archivo HTML (que puede abrirse con Word)
            const blob = new Blob([htmlContent], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'formulario.doc';
            document.body.appendChild(a);
            a.click();
            
            // Limpiar
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }
        
        function getFormDataAsJSON() {
            const jsonData = {
                titulo: formData.title || '',
                descripcion: formData.description || '',
                preguntas: []
            };
            
            // Mapear cada item a una pregunta en el formato requerido
            formData.items.forEach(item => {
                let pregunta = {
                    tipo: mapQuestionType(item.type),
                    pregunta: item.question || ''
                };
                
                // Agregar propiedades específicas según el tipo
                switch(item.type) {
                    case 'multiple':
                        pregunta.opciones = item.options || [];
                        pregunta.respuesta_correcta = item.correctAnswer !== undefined ? item.correctAnswer : 0;
                        break;
                        
                    case 'truefalse':
                        pregunta.respuesta_correcta = item.answer === 'true';
                        break;
                        
                    case 'connect':
                        pregunta.pares = item.pairs || [];
                        break;
                        
                    case 'text':
                        pregunta.respuesta_correcta = item.answer || '';
                        break;
                        
                    case 'textarea':
                        pregunta.tipo = 'texto_largo';
                        pregunta.contenido = item.content || '';
                        break;
                        
                    case 'image':
                        pregunta.tipo = 'imagen';
                        pregunta.imagen_data = item.imageData || '';
                        pregunta.pie_de_imagen = item.caption || '';
                        break;
                        
                    case 'subtitle':
                        pregunta.tipo = 'subtitulo';
                        pregunta.texto = item.text || '';
                        break;
                        
                    case 'heading':
                        pregunta.tipo = 'encabezado';
                        pregunta.texto = item.text || '';
                        break;
                        
                    case 'progression':
                        pregunta.tipo = 'progresion';
                        pregunta.numero = item.number || 0;
                        break;
                }
                
                jsonData.preguntas.push(pregunta);
            });
            
            return jsonData;
        }
        
        function mapQuestionType(internalType) {
            const typeMap = {
                'text': 'texto',
                'multiple': 'opcion_multiple',
                'truefalse': 'verdadero_falso',
                'connect': 'conectar',
                'progression': 'progresion',
                'subtitle': 'subtitulo',
                'heading': 'encabezado',
                'textarea': 'texto_largo',
                'image': 'imagen'
            };
            
            return typeMap[internalType] || internalType;
        }
        
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }