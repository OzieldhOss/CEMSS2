document.addEventListener('DOMContentLoaded', function() {
  const formulario = document.getElementById('formulario-admision');
  
  // Validar confirmación de email
  const email = document.getElementById('email');
  const emailConfirm = document.getElementById('email-confirm');
  
  function validateEmail() {
    if(email.value !== emailConfirm.value) {
      emailConfirm.setCustomValidity('Los correos electrónicos no coinciden');
    } else {
      emailConfirm.setCustomValidity('');
    }
  }
  
  email.addEventListener('change', validateEmail);
  emailConfirm.addEventListener('keyup', validateEmail);
  
  // Manejar envío del formulario
  formulario.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar todos los campos
    if(!formulario.checkValidity()) {
      e.stopPropagation();
      alert('Por favor complete todos los campos requeridos correctamente.');
      return;
    }
    
    // Simular envío (en una implementación real sería una llamada AJAX)
    alert('Solicitud enviada con éxito. Nos pondremos en contacto contigo pronto.');
    formulario.reset();
    
    // Aquí iría la lógica real para enviar el formulario
    // const formData = new FormData(formulario);
    // fetch('/procesar-admision', { method: 'POST', body: formData })
    //   .then(response => response.json())
    //   .then(data => console.log(data))
    //   .catch(error => console.error(error));
  });
  
  // Mostrar nombre del archivo seleccionado
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.addEventListener('change', function() {
      const fileName = this.files[0]?.name || 'Ningún archivo seleccionado';
      const label = this.previousElementSibling;
      const hint = document.createElement('span');
      hint.className = 'file-hint';
      hint.textContent = `: ${fileName}`;
      
      // Eliminar hint anterior si existe
      const existingHint = label.querySelector('.file-hint');
      if(existingHint) {
        label.removeChild(existingHint);
      }
      
      label.appendChild(hint);
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Configuración inicial
  const form = document.getElementById('formulario-admision');
  const inputs = form.querySelectorAll('input, select, textarea');
  
  // Marcar campos como no tocados al inicio
  inputs.forEach(input => {
    input.dataset.touched = 'false';
  });

  // Validación al salir del campo (blur)
  form.addEventListener('blur', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      validateField(e.target, true);
    }
  }, true);

  // Validación al cambiar valor
  form.addEventListener('input', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      validateField(e.target, false);
    }
  }, true);

  // Validación para campos de archivo
  const fileInputs = form.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.addEventListener('change', function() {
      validateFileField(this);
    });
  });

  // Validación al enviar
  form.addEventListener('submit', function(e) {
    let isValid = true;
    
    inputs.forEach(input => {
      if (input.required) {
        input.dataset.touched = 'true'; // Marcar todos como tocados al enviar
        
        if (input.type === 'file') {
          if (!validateFileField(input)) isValid = false;
        } else {
          if (!validateField(input, true)) isValid = false;
        }
      }
    });

    if (!isValid) {
      e.preventDefault();
      // Enfocar el primer error
      const firstError = form.querySelector('.invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
    }
  });

  // Función para validar campos normales
  function validateField(field, showError) {
    const container = field.closest('.form-group');
    const errorMessage = container.querySelector('.error-message');
    
    // Solo validar si el campo es requerido
    if (!field.required) return true;
    
    // Validar el campo
    const isValid = field.checkValidity();
    
    // Actualizar clases
    if (field.value.trim() !== '') {
      field.classList.add('valid');
      field.classList.remove('invalid');
      container.classList.remove('show-error');
    } else if (field.dataset.touched === 'true' || showError) {
      field.classList.remove('valid');
      field.classList.add('invalid');
      container.classList.add('show-error');
    }
    
    return isValid;
  }

  // Función para validar campos de archivo
  function validateFileField(input) {
    const container = input.closest('.file-field');
    const formGroup = input.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    
    if (!input.required) return true;
    
    const isValid = input.files.length > 0;
    
    if (isValid) {
      container.classList.add('valid');
      container.classList.remove('invalid');
      formGroup.classList.remove('show-error');
    } else if (input.dataset.touched === 'true') {
      container.classList.remove('valid');
      container.classList.add('invalid');
      formGroup.classList.add('show-error');
    }
    
    return isValid;
  }
});

// Agrega esto al DOMContentLoaded
document.getElementById('solicitar-prorroga')?.addEventListener('change', function(e) {
  if(e.target.checked) {
    // Mostrar alerta con los términos de la prórroga
    const aceptaProrroga = confirm(
      "ATENCIÓN: La prórroga es por 3 meses. " +
      "Si no subes tu certificado en este plazo, se te dará de baja automáticamente. " +
      "¿Aceptas estos términos?"
    );
    
    if(!aceptaProrroga) {
      e.target.checked = false;
    } else {
      // Si acepta la prórroga, desmarcar el requerido del certificado
      const certificadoInput = document.getElementById('certificado-notas');
      certificadoInput.required = false;
      certificadoInput.closest('.file-field').classList.remove('invalid');
      certificadoInput.closest('.form-group').classList.remove('show-error');
    }
  } else {
    // Si desmarca, volver a hacer requerido el certificado
    document.getElementById('certificado-notas').required = true;
  }
});

// Modifica la validación del formulario para considerar la prórroga
form.addEventListener('submit', function(e) {
  const prorrogaChecked = document.getElementById('solicitar-prorroga')?.checked;
  const certificadoSubido = document.getElementById('certificado-notas').files.length > 0;
  
  if(!prorrogaChecked && !certificadoSubido) {
    const certificadoGroup = document.getElementById('certificado-notas').closest('.form-group');
    certificadoGroup.classList.add('show-error');
    e.preventDefault();
    
    // Desplazarse al campo
    document.getElementById('certificado-notas').scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
    
    return false;
  }
  
  // Resto de la validación...
});

// Mostrar nombre de archivo seleccionado
document.querySelectorAll('input[type="file"]').forEach(input => {
  input.addEventListener('change', function() {
    const statusElement = this.closest('.file-upload').querySelector('.file-status');
    if(this.files.length > 0) {
      statusElement.textContent = this.files[0].name;
      statusElement.style.color = '#27ae60'; // Verde cuando hay archivo
    } else {
      statusElement.textContent = 'Sin archivo seleccionado';
      statusElement.style.color = '#666';
    }
  });
});