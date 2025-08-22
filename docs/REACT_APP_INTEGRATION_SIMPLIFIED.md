# Integración Simplificada React con Flow Designer

## Hook Simplificado (Recomendado)

Después de eliminar el dropdown de dispositivos, puedes usar esta versión más simple:

```javascript
// hooks/useFlowDesignerCommunication.js - VERSIÓN SIMPLIFICADA
import { useState, useEffect, useCallback } from 'react';

export const useFlowDesignerCommunication = () => {
  const [config, setConfig] = useState(null);
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

    // Enviar ready después de un pequeño delay
    setTimeout(sendReady, 500);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
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
    isInIframe,
    sendToParent,
    completeStep,
    requestPreviousStep
  };
};
```

## Componente App Simplificado

```javascript
// App.js - VERSIÓN SIMPLIFICADA
import React from 'react';
import { useFlowDesignerCommunication } from './hooks/useFlowDesignerCommunication';

function App() {
  const {
    config,
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
      {/* Tu contenido actual */}
      <div className="credit-card-promo">
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

## CSS Simplificado

```css
/* responsive.css - VERSIÓN SIMPLIFICADA */
.app {
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
}

.iframe-mode {
  /* Ajustes específicos cuando está en iframe */
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
}

/* Responsive design automático */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* Para pantallas muy pequeñas */
@media (max-width: 350px) {
  .benefits-grid { 
    grid-template-columns: 1fr; 
  }
  .iframe-mode {
    padding: 10px;
  }
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

## ¿Qué se eliminó?

❌ **Removido del código original**:
- Manejo de eventos `DEVICE_CHANGED` y `RESIZE`
- State de `device` y `setDevice()`  
- Función `updateViewport()`
- CSS custom properties dinámicas
- Lógica de responsive breakpoints complejos

## ✅ Beneficios de la versión simplificada:

1. **Menos código**: ~50% menos líneas de código
2. **Más fácil de mantener**: Sin lógica de devices complejos
3. **Mejor performance**: No re-renders por cambios de device
4. **CSS más simple**: Responsive design nativo

## 🎯 Recomendación:

**SÍ, puedes simplificar la integración React** usando la versión reducida arriba. Mantiene toda la funcionalidad esencial (navegación, comunicación, detección de iframe) pero elimina la complejidad innecesaria de manejo de dispositivos.
