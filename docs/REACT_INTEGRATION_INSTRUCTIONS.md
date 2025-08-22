# 📋 Instrucciones para el Equipo React: Actualización del Hook de Integración

## 🎯 **Objetivo**
Simplificar la integración con Flow Designer eliminando la lógica de cambios de dispositivo y manteniendo solo la comunicación esencial.

## 🔄 **Cambios Requeridos**

### **ANTES vs DESPUÉS**

| **Funcionalidad** | **Estado Anterior** | **Estado Nuevo** |
|-------------------|-------------------|------------------|
| Cambios de dispositivo | ✅ Complejo | ❌ Eliminado |
| Comunicación PostMessage | ✅ Mantenido | ✅ Simplificado |
| Navegación de wizard | ✅ Mantenido | ✅ Mantenido |
| CSS responsive | ✅ Custom properties | ✅ Responsive nativo |

---

## 📝 **PASO 1: Actualizar el Hook**

**Archivo:** `hooks/useFlowDesignerCommunication.js`

```javascript
import { useState, useEffect, useCallback } from 'react';

export const useFlowDesignerCommunication = () => {
  const [config, setConfig] = useState(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Detectar si estamos dentro de un iframe
    const inIframe = window !== window.parent;
    setIsInIframe(inIframe);

    if (!inIframe) {
      console.log('🖥️  Running in standalone mode');
      return;
    }

    console.log('🖼️  Running inside Flow Designer iframe');

    const handleMessage = (event) => {
      // Verificar origen por seguridad
      const allowedOrigins = [
        'http://localhost:5173',  // Flow Designer dev
        'https://flow-designer.tu-dominio.com'  // Flow Designer producción
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('🚫 Message from unauthorized origin:', event.origin);
        return;
      }

      const { type, data } = event.data;
      console.log(`📨 Received: ${type}`, data);

      switch (type) {
        case 'FLOW_CONFIG':
          console.log('📦 Initial configuration received');
          setConfig(data);
          break;

        default:
          console.log(`🔔 Unknown message type: ${type}`);
      }
    };

    // Escuchar mensajes del Flow Designer
    window.addEventListener('message', handleMessage);
    
    // Notificar al Flow Designer que estamos listos
    const notifyReady = () => {
      console.log('✅ Notifying Flow Designer that app is ready');
      window.parent.postMessage({
        type: 'MICROFRONTEND_READY',
        data: {
          timestamp: Date.now(),
          url: window.location.href,
          version: '1.0.0' // Versión de tu app
        }
      }, '*');
    };

    // Esperar un momento para que el iframe se inicialice completamente
    setTimeout(notifyReady, 300);

    return () => {
      window.removeEventListener('message', handleMessage);
      console.log('🧹 Cleanup: Message listener removed');
    };
  }, []);

  const sendToParent = useCallback((type, data) => {
    if (!isInIframe) {
      console.log(`📤 Would send ${type} (standalone mode - ignored)`);
      return;
    }
    
    console.log(`📤 Sending to Flow Designer: ${type}`, data);
    window.parent.postMessage({
      type,
      data: {
        ...data,
        timestamp: Date.now()
      }
    }, '*');
  }, [isInIframe]);

  const completeStep = useCallback((stepData = {}) => {
    console.log('✅ Completing wizard step with data:', stepData);
    sendToParent('STEP_COMPLETED', stepData);
  }, [sendToParent]);

  const requestPreviousStep = useCallback(() => {
    console.log('⬅️  Requesting previous step');
    sendToParent('STEP_PREVIOUS', {});
  }, [sendToParent]);

  const sendProgress = useCallback((progress) => {
    console.log('📊 Sending progress update:', progress);
    sendToParent('PROGRESS_UPDATE', { progress });
  }, [sendToParent]);

  return {
    config,
    isInIframe,
    sendToParent,
    completeStep,
    requestPreviousStep,
    sendProgress
  };
};
```

---

## 📝 **PASO 2: Actualizar el Componente Principal**

**Archivo:** `App.js` o tu componente principal

```javascript
import React from 'react';
import { useFlowDesignerCommunication } from './hooks/useFlowDesignerCommunication';
import './App.css';

function App() {
  const {
    config,
    isInIframe,
    completeStep,
    requestPreviousStep,
    sendProgress
  } = useFlowDesignerCommunication();

  const handleSubmit = (formData) => {
    console.log('📋 Form submitted with data:', formData);
    
    // Opcional: Enviar progreso del 100%
    sendProgress(100);
    
    // Completar paso con los datos del formulario
    completeStep({
      formData,
      stepName: 'landing-form',
      completed: true
    });
  };

  const handleBack = () => {
    console.log('⬅️  User requested previous step');
    requestPreviousStep();
  };

  return (
    <div className={`app ${isInIframe ? 'iframe-mode' : 'standalone-mode'}`}>
      {/* DEBUG: Eliminar este banner en producción */}
      {/* 
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-banner">
          Mode: {isInIframe ? 'Flow Designer' : 'Standalone'} | 
          Config: {config ? '✅' : '❌'} |
          Step: {config?.stepId || 'N/A'}
        </div>
      )}
      */}

      {/* Tu contenido principal */}
      <div className="main-content">
        <header className="app-header">
          <div className="brand-tabs">
            <button className="brand-tab active">Bradescard</button>
            <button className="brand-tab">Promoda</button>
          </div>
        </header>

        <main className="card-presentation">
          <h1>Tarjeta de crédito Promoda Bradescard</h1>
          <p className="subtitle">¡Solicítala hoy sin costo!</p>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-number">5%</div>
              <p>de descuento<br/>en tu primera compra y siempre</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-number">4</div>
              <p>meses sin intereses<br/>en tiendas Promoda</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-number">20%</div>
              <p>de descuento en Starbucks<br/>con tu tarjeta nueva</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">$</div>
              <p>Mensualidad<br/>de $61+IVA</p>
            </div>
          </div>

          <div className="card-visual">
            {/* Tu diseño de tarjeta visual */}
            <div className="credit-card">
              <div className="card-number">•••• •••• •••• 2458</div>
              <div className="card-holder">NOMBRE APELLIDO</div>
              <div className="card-expiry">12/28</div>
            </div>
          </div>

          <div className="benefits-footer">
            ★ Beneficios y promos todo el año ★
          </div>
        </main>

        {/* Controles de navegación (solo en iframe mode) */}
        {isInIframe && (
          <footer className="wizard-navigation">
            <button 
              onClick={handleBack}
              className="nav-button nav-button--secondary"
              type="button"
            >
              ← Anterior
            </button>
            
            <button 
              onClick={() => handleSubmit({ 
                cardType: 'promoda-bradescard',
                interest: 'shown',
                timestamp: Date.now()
              })}
              className="nav-button nav-button--primary"
              type="button"
            >
              Siguiente →
            </button>
          </footer>
        )}

        {/* IMPORTANTE: NO mostrar CTA en modo iframe */}
        {!isInIframe && (
          <footer className="standalone-footer">
            <button 
              onClick={() => alert('¡Redirección a formulario de solicitud!')}
              className="cta-button"
            >
              ¡Solicítala ahora!
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;
```

---

## 📝 **PASO 3: CSS Actualizado**

**Archivo:** `App.css`

```css
/* === BASE STYLES === */
.app {
  width: 100%;
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%);
  color: white;
  overflow-x: hidden;
}

/* === MODE-SPECIFIC STYLES === */
.iframe-mode {
  height: 100vh; /* Llenar completamente el iframe */
  padding: 16px;
  box-sizing: border-box;
}

.standalone-mode {
  min-height: 100vh;
  padding: 20px;
}

/* === DEBUG BANNER === */
.debug-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 12px;
  font-size: 11px;
  font-family: monospace;
  z-index: 9999;
  text-align: center;
}

/* === MAIN CONTENT === */
.main-content {
  max-width: 400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  margin-bottom: 20px;
}

.brand-tabs {
  display: flex;
  gap: 8px;
}

.brand-tab {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.brand-tab.active,
.brand-tab:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* === CARD PRESENTATION === */
.card-presentation {
  flex: 1;
  text-align: center;
}

.card-presentation h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.2;
}

.subtitle {
  font-size: 16px;
  margin-bottom: 24px;
  opacity: 0.9;
}

/* === BENEFITS GRID === */
.benefits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.benefit-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.benefit-number,
.benefit-icon {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  display: block;
}

.benefit-card p {
  font-size: 12px;
  line-height: 1.3;
  margin: 0;
}

/* === CARD VISUAL === */
.card-visual {
  margin: 24px 0;
}

.credit-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  color: #333;
  border-radius: 12px;
  padding: 20px;
  max-width: 280px;
  margin: 0 auto;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.card-number {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  letter-spacing: 2px;
  margin-bottom: 16px;
}

.card-holder {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-expiry {
  font-size: 12px;
  opacity: 0.7;
}

/* === FOOTER ELEMENTS === */
.benefits-footer {
  font-size: 14px;
  margin: 20px 0;
  font-weight: 600;
}

/* === NAVIGATION === */
.wizard-navigation {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
}

.nav-button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button--primary {
  background: white;
  color: #e91e63;
}

.nav-button--secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-button--primary:hover {
  background: #f5f5f5;
}

.nav-button--secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* === STANDALONE CTA === */
.standalone-footer {
  text-align: center;
  margin-top: 32px;
}

.cta-button {
  background: white;
  color: #e91e63;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* === RESPONSIVE === */
@media (max-width: 380px) {
  .iframe-mode {
    padding: 12px;
  }
  
  .card-presentation h1 {
    font-size: 20px;
  }
  
  .benefits-grid {
    gap: 8px;
  }
  
  .benefit-card {
    padding: 12px;
  }
  
  .benefit-number,
  .benefit-icon {
    font-size: 24px;
  }
}

@media (max-width: 350px) {
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .wizard-navigation {
    flex-direction: column;
  }
  
  .nav-button {
    flex: none;
  }
}
```

---

## 🧪 **PASO 4: Testing**

### **Checklist de Verificación**

- [ ] **Modo Standalone**: La app funciona correctamente cuando se accede directamente
- [ ] **Modo Iframe**: La app detecta cuando está dentro del Flow Designer  
- [ ] **Comunicación**: Los mensajes se envían y reciben correctamente
- [ ] **Navegación**: Los botones "Anterior" y "Siguiente" funcionan
- [ ] **Responsive**: El diseño se adapta correctamente en el iframe de 430x932px
- [ ] **Debug**: Los console.log muestran el flujo correcto de mensajes
- [ ] **Error Handling**: No hay errores en la consola del navegador

### **Comandos de Testing**

```bash
# Desarrollo local
npm start

# Build de producción
npm run build

# Servir build locally para testing
npx serve -s build -p 3000
```

### **URLs de Testing**

- **Standalone**: `http://localhost:3000`
- **En Flow Designer**: `http://localhost:5173` (ejecutar wizard)

---

## 🚀 **PASO 5: Despliegue**

### **Variables de Entorno**

Crear archivo `.env.production`:

```bash
REACT_APP_FLOW_DESIGNER_ORIGIN=https://flow-designer.tu-dominio.com
```

### **Configuración de Seguridad**

En el hook, actualizar los orígenes permitidos:

```javascript
const allowedOrigins = [
  'http://localhost:5173',  // Desarrollo
  process.env.REACT_APP_FLOW_DESIGNER_ORIGIN  // Producción
].filter(Boolean);
```

---

## ✅ **¿Qué se logra con estos cambios?**

1. **✨ Código más limpio**: ~60% menos líneas de código
2. **🚀 Mejor rendimiento**: Sin re-renders innecesarios
3. **🔧 Fácil mantenimiento**: Lógica simplificada
4. **📱 Responsive automático**: CSS nativo sin custom properties
5. **🐛 Mejor debugging**: Logs claros y específicos
6. **🔒 Más seguro**: Validación de orígenes mejorada

---

## 📞 **Soporte**

Si tienes dudas durante la implementación:

1. **Revisar console.log**: Los mensajes son muy descriptivos
2. **Verificar orígenes**: Asegurar que las URLs coincidan
3. **Testing paso a paso**: Probar primero en standalone, luego en iframe
4. **Network tab**: Verificar que no hay errores de CORS

---

## 📋 **Entrega**

**Archivos a modificar:**
- `hooks/useFlowDesignerCommunication.js`
- `App.js` 
- `App.css`
- `.env.production` (nuevo)

**Tiempo estimado:** 2-3 horas de implementación + testing

**Prioridad:** Alta (requerido para integración completa con Flow Designer)
