# Integración de la Aplicación React con el Flow Designer

## Código para agregar a tu aplicación React (puerto 3000)

Para que tu aplicación React funcione correctamente con el Flow Designer, agrega este código. 
**El sistema ahora usa dimensiones responsivas por defecto (430x932px) similares al iPhone 14 Pro Max.**

### 1. Hook personalizado para comunicación con el Flow Designer

```javascript
// hooks/useFlowDesignerCommunication.js
import { useState, useEffect, useCallback } from 'react';

export const useFlowDesignerCommunication = () => {
  const [config, setConfig] = useState(null);
  const [device, setDevice] = useState(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Detectar si estamos dentro de un iframe
    const inIframe = window !== window.parent;
    setIsInIframe(inIframe);

    if (!inIframe) return;

    const handleMessage = (event) => {
      // Verificar origen (ajusta según tu configuración)
      if (event.origin !== 'http://localhost:5173') {
        return;
      }

      const { type, data } = event.data;

      switch (type) {
        case 'FLOW_CONFIG':
          console.log('📦 Received initial config:', data);
          setConfig(data);
          if (data.device) {
            setDevice(data.device);
            updateViewport(data.device.width, data.device.height);
          }
          break;

        case 'DEVICE_CHANGED':
          console.log('📱 Device dimensions updated:', data);
          if (data.device) {
            setDevice(data.device);
            updateViewport(data.device.width, data.device.height);
          }
          break;

        case 'RESIZE':
          console.log('🔄 Resize event:', data);
          updateViewport(data.width, data.height);
          break;

        default:
          console.log('🔔 Unknown message type:', type, data);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Enviar mensaje de que la aplicación está lista
    const sendReady = () => {
      window.parent.postMessage({
        type: 'MICROFRONTEND_READY',
        data: {
          timestamp: Date.now(),
          url: window.location.href
        }
      }, '*');
    };

    // Enviar ready después de un pequeño delay para asegurar que el padre esté listo
    setTimeout(sendReady, 500);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const updateViewport = useCallback((width, height) => {
    // Actualizar CSS custom properties para responsive design
    document.documentElement.style.setProperty('--viewport-width', `${width}px`);
    document.documentElement.style.setProperty('--viewport-height', `${height}px`);
    
    // Disparar evento resize para componentes que lo escuchen
    window.dispatchEvent(new Event('resize'));
    
    console.log(`🖥️ Viewport updated to ${width}x${height}`);
  }, []);

  const sendToParent = useCallback((type, data) => {
    if (!isInIframe) return;
    
    window.parent.postMessage({
      type,
      data: {
        ...data,
        timestamp: Date.now()
      }
    }, '*');
  }, [isInIframe]);

  const completeStep = useCallback((stepData) => {
    sendToParent('STEP_COMPLETED', stepData);
  }, [sendToParent]);

  const requestPreviousStep = useCallback(() => {
    sendToParent('STEP_PREVIOUS');
  }, [sendToParent]);

  return {
    config,
    device,
    isInIframe,
    sendToParent,
    completeStep,
    requestPreviousStep,
    updateViewport
  };
};
```

### 2. Componente principal con integración

```javascript
// App.js o tu componente principal
import React from 'react';
import { useFlowDesignerCommunication } from './hooks/useFlowDesignerCommunication';
import './responsive.css'; // CSS que responda a las custom properties

function App() {
  const {
    config,
    device,
    isInIframe,
    completeStep,
    requestPreviousStep
  } = useFlowDesignerCommunication();

  const handleNextStep = () => {
    completeStep({
      formData: {
        // Datos del formulario actual
        creditCardType: 'Promoda Bradescard',
        selectedOffer: '5% descuento'
      }
    });
  };

  return (
    <div className={`app ${isInIframe ? 'iframe-mode' : ''}`}>
      {/* Debug info (remover en producción) */}
      {process.env.NODE_ENV === 'development' && isInIframe && (
        <div className="debug-info">
          <small>
            Device: {device?.label} ({device?.width}x{device?.height})
            Step: {config?.stepId}
          </small>
        </div>
      )}

      {/* Tu contenido actual */}
      <div className="credit-card-promo">
        <div className="card-header">
          <button className="brand-btn">Bradescard</button>
          <button className="brand-btn">Promoda</button>
        </div>
        
        <h1>Tarjeta de crédito Promoda Bradescard</h1>
        <p>¡Solicítala hoy sin costo!</p>

        <div className="benefits-grid">
          <div className="benefit">
            <h3>5%</h3>
            <p>de descuento<br/>en tu primera compra y siempre</p>
          </div>
          <div className="benefit">
            <h3>4</h3>
            <p>meses sin intereses<br/>en tiendas Promoda</p>
          </div>
          <div className="benefit">
            <h3>20%</h3>
            <p>de descuento en Starbucks<br/>con tu tarjeta nueva</p>
          </div>
          <div className="benefit">
            <h3>$</h3>
            <p>Mensualidad<br/>de $61+IVA</p>
          </div>
        </div>

        <div className="card-preview">
          {/* Tu tarjeta visual */}
        </div>

        {/* Botones de navegación del wizard */}
        {isInIframe && (
          <div className="wizard-controls">
            <button 
              onClick={requestPreviousStep}
              className="btn-secondary"
            >
              ← Anterior
            </button>
            <button 
              onClick={handleNextStep}
              className="btn-primary"
            >
              Continuar →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

### 3. CSS responsivo con custom properties

```css
/* responsive.css */
:root {
  --viewport-width: 100vw;
  --viewport-height: 100vh;
}

.app {
  min-height: var(--viewport-height);
  width: var(--viewport-width);
  overflow-x: hidden;
}

.iframe-mode {
  /* Ajustes específicos cuando está en iframe */
  padding: 20px;
  box-sizing: border-box;
}

/* Responsive breakpoints basados en viewport custom properties */
.app {
  font-size: 16px;
}

/* iPhone 12/13 (390x844) */
@media (max-width: 390px) {
  .app { font-size: 14px; }
  .benefits-grid { grid-template-columns: repeat(2, 1fr); }
}

/* iPhone 14 Pro Max (430x932) */
@media (max-width: 430px) {
  .app { font-size: 15px; }
  .benefits-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Galaxy S21 (360x800) */
@media (max-width: 360px) {
  .app { font-size: 13px; }
  .benefits-grid { grid-template-columns: 1fr; }
}

.debug-info {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 5px 10px;
  font-size: 10px;
  z-index: 9999;
}

.wizard-controls {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #e91e63;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-primary:hover {
  background: #c2185b;
  transform: translateY(-1px);
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}
```

## Instalación

1. Agrega el hook `useFlowDesignerCommunication` a tu aplicación React
2. Importa y usa el hook en tu componente principal
3. Agrega los estilos CSS responsivos
4. Testea los cambios de dispositivo desde el Flow Designer

## Testing

- El sistema usa dimensiones responsivas por defecto (430x932px)
- Verifica que los mensajes PostMessage funcionen en la consola del navegador  
- Prueba la navegación entre pasos del wizard
- La aplicación debería ajustarse automáticamente al tamaño del contenedor iframe
