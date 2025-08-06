# Guía de Integración de Componentes Web Externos

## Resumen
Este documento describe las validaciones y observaciones que deben implementarse del lado del componente web externo para asegurar una integración exitosa con el Flow Designer.

## 1. Estructura Básica del Componente Web

### ✅ Validaciones Requeridas

#### 1.1 Definición del Custom Element
```typescript
// ✅ CORRECTO
class LandingWebComponent extends HTMLElement {
    constructor() {
        super(); // SIEMPRE llamar super() primero
        // Inicialización aquí
    }
}

// ❌ INCORRECTO - Error que estamos viendo
class LandingWebComponent {
    constructor() {
        HTMLElement(); // Error: no usar como función
    }
}
```

#### 1.2 Registro del Custom Element
```typescript
// ✅ CORRECTO
customElements.define('landing-web-component', LandingWebComponent);

// Verificar si ya está registrado antes de definir
if (!customElements.get('landing-web-component')) {
    customElements.define('landing-web-component', LandingWebComponent);
}
```

## 2. Atributos y Propiedades

### ✅ Atributos Estándar que el Flow Designer Envía

El componente debe estar preparado para recibir estos atributos:

```typescript
class LandingWebComponent extends HTMLElement {
    static get observedAttributes() {
        return ['session-id', 'flow-context'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch(name) {
            case 'session-id':
                this.sessionId = newValue;
                break;
            case 'flow-context':
                try {
                    this.flowContext = JSON.parse(newValue);
                } catch (e) {
                    console.warn('Invalid flow-context JSON:', newValue);
                }
                break;
        }
    }
}
```

### 📋 Propiedades Esperadas

| Atributo | Tipo | Descripción | Ejemplo |
|----------|------|-------------|---------|
| `session-id` | string | ID único de sesión del simulador | `"sim-1754502722129"` |
| `flow-context` | JSON string | Contexto del flujo actual | `'{"sessionId":"sim-123","currentStep":"landing","simulationMode":true}'` |

## 3. Eventos del Componente

### ✅ Eventos que el Componente DEBE Emitir

#### 3.1 Evento: component-ready
```typescript
// Disparar cuando el componente esté completamente cargado
this.dispatchEvent(new CustomEvent('component-ready', {
    detail: {
        componentId: 'landing',
        version: '1.0.0',
        ready: true
    },
    bubbles: true
}));
```

#### 3.2 Evento: output-data
```typescript
// Disparar cuando el usuario complete el paso
this.dispatchEvent(new CustomEvent('output-data', {
    detail: {
        stepCompleted: true,
        data: {
            // Datos recopilados por el componente
            formData: { /* ... */ },
            validationPassed: true
        },
        nextAction: 'continue' // 'continue' | 'back' | 'finish'
    },
    bubbles: true
}));
```

#### 3.3 Evento: request-navigation
```typescript
// Para solicitar navegación hacia atrás
this.dispatchEvent(new CustomEvent('request-navigation', {
    detail: {
        direction: 'previous' // 'previous' | 'next'
    },
    bubbles: true
}));
```

#### 3.4 Evento: node-error
```typescript
// Para reportar errores del componente
this.dispatchEvent(new CustomEvent('node-error', {
    detail: {
        error: 'Error message',
        code: 'VALIDATION_FAILED',
        recoverable: true
    },
    bubbles: true
}));
```

## 4. Ciclo de Vida del Componente

### ✅ Métodos Requeridos

```typescript
class LandingWebComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // El componente se añadió al DOM
        this.render();
        this.setupEventListeners();
        
        // Notificar que está listo
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('component-ready', {
                detail: { ready: true },
                bubbles: true
            }));
        }, 100);
    }

    disconnectedCallback() {
        // Limpieza cuando se remueve del DOM
        this.cleanup();
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        // Reaccionar a cambios de atributos
        if (oldValue !== newValue) {
            this.handleAttributeChange(name, newValue);
        }
    }
}
```

## 5. Estilos y Encapsulación

### ✅ Recomendaciones de Estilos

```typescript
// Usar Shadow DOM para encapsulación
constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Estilos encapsulados
    const style = document.createElement('style');
    style.textContent = `
        :host {
            display: block;
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .container {
            padding: 20px;
            box-sizing: border-box;
        }
    `;
    this.shadowRoot.appendChild(style);
}
```

## 6. Validaciones de Integración

### 🔍 Checklist para el Desarrollador del Componente Web

#### Estructura Básica
- [ ] ✅ Extiende correctamente de `HTMLElement`
- [ ] ✅ Llama a `super()` en el constructor
- [ ] ✅ Se registra correctamente con `customElements.define()`
- [ ] ✅ Verifica si ya está registrado antes de definir

#### Atributos y Propiedades
- [ ] ✅ Define `observedAttributes` estático
- [ ] ✅ Implementa `attributeChangedCallback`
- [ ] ✅ Maneja `session-id` y `flow-context`
- [ ] ✅ Valida JSON antes de parsear `flow-context`

#### Eventos
- [ ] ✅ Emite `component-ready` cuando está listo
- [ ] ✅ Emite `output-data` con datos del usuario
- [ ] ✅ Emite `request-navigation` para navegación
- [ ] ✅ Emite `node-error` para errores
- [ ] ✅ Todos los eventos usan `bubbles: true`

#### Ciclo de Vida
- [ ] ✅ Implementa `connectedCallback`
- [ ] ✅ Implementa `disconnectedCallback`
- [ ] ✅ Hace limpieza de event listeners
- [ ] ✅ Maneja la reactividad de atributos

#### Estilos
- [ ] ✅ Usa Shadow DOM para encapsulación
- [ ] ✅ Los estilos no interfieren con el host
- [ ] ✅ Responsive y adaptable al contenedor

## 7. Debugging y Troubleshooting

### 🐛 Errores Comunes y Soluciones

#### Error: "Failed to construct 'HTMLElement'"
```typescript
// ❌ PROBLEMA
class MyComponent {
    constructor() {
        HTMLElement(); // Error!
    }
}

// ✅ SOLUCIÓN
class MyComponent extends HTMLElement {
    constructor() {
        super(); // Correcto!
    }
}
```

#### Error: "Custom element already defined"
```typescript
// ✅ SOLUCIÓN
if (!customElements.get('my-component')) {
    customElements.define('my-component', MyComponent);
}
```

### 📊 Logs Recomendados

```typescript
// En desarrollo, agregar logs útiles
console.log(`📦 ${this.tagName} Component v${this.version} loaded successfully`);
console.log(`🎯 Custom element registered: ${this.tagName.toLowerCase()}`);
console.log(`✅ Component ${this.tagName} ready`);
```

## 8. Testing del Componente

### 🧪 Tests Básicos Recomendados

```typescript
// Test básico de integración
function testComponentIntegration() {
    const component = document.createElement('landing-web-component');
    
    // Test 1: Creación exitosa
    assert(component instanceof HTMLElement, 'Component should be HTMLElement');
    
    // Test 2: Atributos
    component.setAttribute('session-id', 'test-123');
    component.setAttribute('flow-context', '{"test": true}');
    
    // Test 3: Eventos
    let readyFired = false;
    component.addEventListener('component-ready', () => {
        readyFired = true;
    });
    
    document.body.appendChild(component);
    
    setTimeout(() => {
        assert(readyFired, 'component-ready event should fire');
        document.body.removeChild(component);
    }, 200);
}
```

## 9. Template de Componente Mínimo

### 📝 Código Base Recomendado

```typescript
class ExternalWebComponent extends HTMLElement {
    private sessionId: string = '';
    private flowContext: any = {};

    static get observedAttributes() {
        return ['session-id', 'flow-context'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        
        // Notificar que está listo
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('component-ready', {
                detail: { ready: true },
                bubbles: true
            }));
        }, 100);
    }

    disconnectedCallback() {
        this.cleanup();
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch(name) {
            case 'session-id':
                this.sessionId = newValue;
                break;
            case 'flow-context':
                try {
                    this.flowContext = JSON.parse(newValue);
                } catch (e) {
                    console.warn('Invalid flow-context JSON:', newValue);
                }
                break;
        }
    }

    private render() {
        if (!this.shadowRoot) return;
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                .container {
                    padding: 20px;
                    box-sizing: border-box;
                }
            </style>
            <div class="container">
                <h2>Mi Componente Externo</h2>
                <button id="next-btn">Continuar</button>
            </div>
        `;
    }

    private setupEventListeners() {
        const nextBtn = this.shadowRoot?.querySelector('#next-btn');
        nextBtn?.addEventListener('click', () => {
            this.handleNext();
        });
    }

    private handleNext() {
        this.dispatchEvent(new CustomEvent('output-data', {
            detail: {
                stepCompleted: true,
                data: { /* datos del componente */ },
                nextAction: 'continue'
            },
            bubbles: true
        }));
    }

    private cleanup() {
        // Limpiar event listeners si es necesario
    }
}

// Registrar el componente
if (!customElements.get('external-web-component')) {
    customElements.define('external-web-component', ExternalWebComponent);
}
```

## 10. Configuración en MockComponentRegistry

### ⚙️ Configuración Requerida

```typescript
// En el Flow Designer
{
    id: 'landing',
    name: 'Landing Component',
    version: '1.0.0',
    cdnUrl: 'http://localhost:3001/landing-v1.0.0.js',
    healthCheckUrl: 'http://localhost:3001/health',
    metadata: {
        tagName: 'landing-web-component', // Debe coincidir con customElements.define()
        category: 'form',
        description: 'Componente de landing page'
    }
}
```

---

## 📞 Contacto y Soporte

Si encuentras problemas durante la integración:

1. Verifica que todos los checkpoints estén cumplidos
2. Revisa los logs de la consola del navegador
3. Asegúrate de que el componente emita todos los eventos requeridos
4. Testa el componente de forma aislada antes de integrarlo

**Última actualización:** Agosto 2025
