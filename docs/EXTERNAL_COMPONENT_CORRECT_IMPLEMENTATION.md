# 🔧 Solución al Error: "No se encontró el contenedor #root para React"

## 🚨 Problema Identificado

El Web Component externo en `http://localhost:3001/bundle.js` está intentando buscar un elemento con id `#root` que no existe en el Flow Designer. 

## ✅ Solución: Implementación Correcta del Web Component

El componente externo debe crear su propio contenedor en lugar de buscar uno existente.

### **Estructura Correcta del Web Component**

```typescript
// src/LandingWebComponent.ts
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import LandingComponent from './LandingComponent';

/**
 * Web Component wrapper para LandingComponent
 * ✅ IMPLEMENTACIÓN CORRECTA
 */
class LandingWebComponentElement extends HTMLElement {
  private reactRoot: Root | null = null;
  private isConnected = false;

  constructor() {
    super();
    // ✅ Crear Shadow DOM propio
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.isConnected = true;
    this.render();
    
    // Notificar que el componente está listo
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('component-ready', {
        detail: { componentId: 'landing', version: '1.0.0' },
        bubbles: true
      }));
    }, 100);
  }

  disconnectedCallback() {
    this.isConnected = false;
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    // ✅ CREAR CONTENEDOR PROPIO - No buscar #root
    let container = this.shadowRoot.querySelector('#react-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'react-container';
      container.style.width = '100%';
      container.style.height = '100%';
      this.shadowRoot.appendChild(container);
    }

    // ✅ Crear React Root en el contenedor propio
    if (!this.reactRoot) {
      this.reactRoot = createRoot(container);
    }

    // Obtener props de los atributos
    const props = {
      sessionId: this.getAttribute('session-id') || undefined,
      userId: this.getAttribute('user-id') || undefined,
      flowContext: this.parseJsonAttribute('flow-context'),
      config: this.parseJsonAttribute('config'),
      inputData: this.parseJsonAttribute('input-data'),
      
      // Callbacks para comunicación con el host
      onNext: (data: any) => {
        this.dispatchEvent(new CustomEvent('output-data', {
          detail: data,
          bubbles: true
        }));
      },
      
      onPrevious: (data: any) => {
        this.dispatchEvent(new CustomEvent('request-navigation', {
          detail: { direction: 'previous', data },
          bubbles: true
        }));
      },
      
      onDataChange: (data: any) => {
        this.dispatchEvent(new CustomEvent('data-changed', {
          detail: data,
          bubbles: true
        }));
      },
      
      onError: (error: string) => {
        this.dispatchEvent(new CustomEvent('node-error', {
          detail: { error },
          bubbles: true
        }));
      },
      
      onReady: () => {
        this.dispatchEvent(new CustomEvent('component-ready', {
          detail: { componentId: 'landing', version: '1.0.0' },
          bubbles: true
        }));
      }
    };

    // Renderizar componente React
    this.reactRoot.render(React.createElement(LandingComponent, props));
  }

  private parseJsonAttribute(name: string): any {
    try {
      const value = this.getAttribute(name);
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  }

  // Atributos observados para reactivity
  static get observedAttributes() {
    return ['session-id', 'user-id', 'flow-context', 'config', 'input-data'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
    }
  }

  // Métodos públicos
  setInputData(data: any) {
    this.setAttribute('input-data', JSON.stringify(data));
    if (this.isConnected) {
      this.render();
    }
  }

  getOutputData() {
    return {
      componentId: 'landing',
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };
  }
}

// ✅ Registrar el Web Component
customElements.define('landing-web-component', LandingWebComponentElement);

export default LandingWebComponentElement;
```

### **Entry Point Correcto**

```typescript
// src/index.ts
// Verificar disponibilidad de React
if (typeof window !== 'undefined') {
  if (!(window as any).React) {
    console.warn('React not found globally. Consider providing React as external dependency.');
  }
  
  if (!(window as any).ReactDOM) {
    console.warn('ReactDOM not found globally. Consider providing ReactDOM as external dependency.');
  }
}

// ✅ Importar y registrar el Web Component
import './LandingWebComponent';

// Exportar componente React para uso directo si es necesario
export { default as LandingComponent } from './LandingComponent';

console.log(`📦 Landing Component v1.0.0 loaded successfully`);
```

## 🔄 Lo que debe corregir el desarrollo externo

1. **No buscar elementos existentes**: El Web Component no debe buscar `#root` o cualquier otro elemento del host
2. **Crear contenedor propio**: Debe crear su propio contenedor dentro de su Shadow DOM
3. **Shadow DOM obligatorio**: Para encapsulación correcta
4. **React Root propio**: Crear su propio React Root, no reutilizar uno existente

## 🧪 Verificación

Para verificar que el componente externo está implementado correctamente, debería:

1. **Registrarse correctamente**: `customElements.get('landing-web-component')` debería retornar la clase
2. **Crear su propio DOM**: No depender de elementos externos
3. **Emitir eventos**: Los eventos `component-ready`, `output-data`, etc. deberían funcionar

## 📞 Mensaje para el Equipo Externo

> "El Web Component está intentando buscar un elemento `#root` que no existe en nuestro Flow Designer. Por favor, modifiquen la implementación para crear su propio contenedor dentro del Shadow DOM del componente, como se muestra en esta documentación. El Web Component debe ser completamente autónomo y no depender de elementos externos."
