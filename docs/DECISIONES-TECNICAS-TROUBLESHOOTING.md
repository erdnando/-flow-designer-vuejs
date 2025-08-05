# 🔧 Decisiones Técnicas y Troubleshooting Guide

## 🎯 **Decisiones de Arquitectura Críticas**

### **1. ¿Por qué Web Components en lugar de Module Federation?**

#### **Evaluación realizada:**

| Criterio | Web Components | Module Federation | Iframe + PostMessage |
|----------|----------------|------------------|---------------------|
| **Estándares Web** | ✅ Nativo | ❌ Webpack específico | ✅ Nativo |
| **Multi-framework** | ✅ Universal | ⚠️ Complejo | ✅ Aislado |
| **Performance** | ✅ Excelente | ✅ Excelente | ❌ Overhead |
| **Debugging** | ⚠️ Moderado | ❌ Complejo | ✅ Fácil |
| **Vendor Lock-in** | ✅ Sin dependencias | ❌ Webpack | ✅ Sin dependencias |
| **Community Support** | ⚠️ Creciendo | ✅ Maduro | ✅ Maduro |

#### **Decisión**: Web Components
**Razón**: Máxima interoperabilidad y estándares nativos del navegador.

---

### **2. ¿Cómo manejar versiones de React diferentes entre fábricas?**

#### **Problema identificado:**
```
Fábrica A → React 18.2.0
Fábrica B → React 17.0.2  
Fábrica C → React 19.0.0-beta
```

#### **Estrategias evaluadas:**

**Opción A: React Global Compartido**
```javascript
// Problemas: Conflictos de versiones
window.React = React; // ¿Cuál versión usar?
```

**Opción B: Bundle Separado por Componente** ✅
```javascript
// Cada componente incluye su propia versión de React
// Componente A: ine-component.bundle.js (incluye React 18.2.0)
// Componente B: sms-component.bundle.js (incluye React 17.0.2)
```

#### **Decisión**: Bundle separado
**Razón**: Aislamiento completo, sin conflictos, cada fábrica controla su stack.
**Trade-off**: Mayor tamaño de descarga, pero cache HTTP mitiga el impacto.

---

### **3. ¿Cómo estructurar la comunicación de datos entre nodos?**

#### **Patrón de Comunicación Elegido:**

```typescript
// Estándar para todas las fábricas
interface NodeCommunication {
  // Datos que recibe del nodo anterior
  inputs: {
    previousNodeData?: any;
    flowContext?: {
      userId: string;
      sessionId: string;
      currentStep: number;
    };
    nodeConfig?: {
      customProperties: Record<string, any>;
    };
  };
  
  // Datos que envía al siguiente nodo
  outputs: {
    success: boolean;
    data: Record<string, any>;
    nextAction?: 'continue' | 'stop' | 'branch';
    errors?: string[];
  };
  
  // Eventos que puede emitir
  events: {
    'node-ready': void;
    'node-completed': { data: any };
    'node-error': { error: string };
    'data-changed': { changes: any };
    'request-navigation': { direction: 'next' | 'previous' };
  };
}
```

#### **Implementación en Web Component:**
```javascript
class CustomNodeElement extends HTMLElement {
  connectedCallback() {
    // Escuchar datos de entrada
    this.addEventListener('input-data', (event) => {
      this.processInputData(event.detail);
    });
  }
  
  sendOutput(data) {
    // Enviar datos de salida
    this.dispatchEvent(new CustomEvent('output-data', {
      detail: data,
      bubbles: true
    }));
  }
}
```

---

## 🚨 **Problemas Conocidos y Soluciones**

### **Problema 1: Component Not Loading**

#### **Síntomas:**
```
Error: Failed to fetch component from CDN
Network: ERR_FAILED when accessing https://cdn-fabrica.com/component.js
```

#### **Diagnóstico:**
```typescript
// Debug en ExternalComponentLoader.ts
async loadComponent(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Component load failed: ${response.status}`);
      // Log para troubleshooting
      console.log('URL:', url);
      console.log('Headers:', response.headers);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

#### **Soluciones:**
1. **Verificar CORS**: Fábrica debe configurar headers correctos
   ```javascript
   // En el servidor CDN de la fábrica
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, OPTIONS
   ```

2. **Fallback URL**: Usar mirrors o versiones locales
   ```typescript
   const fallbackUrls = [
     'https://cdn-primary.fabrica.com/component.js',
     'https://cdn-backup.fabrica.com/component.js',
     '/local-fallbacks/component.js'
   ];
   ```

3. **Timeout apropiado**: No indefinido
   ```typescript
   const controller = new AbortController();
   setTimeout(() => controller.abort(), 10000); // 10s timeout
   ```

---

### **Problema 2: React Hydration Mismatch**

#### **Síntomas:**
```
Warning: Text content did not match. Server: "Loading..." Client: "INE Capture"
React DOM: Hydration failed
```

#### **Causa Root:**
Web Component carga asíncronamente, React intenta hidratar antes de que esté listo.

#### **Solución:**
```typescript
// En el wrapper Vue del Web Component
export default defineComponent({
  setup(props) {
    const isComponentReady = ref(false);
    const componentRef = ref<HTMLElement>();
    
    onMounted(() => {
      const element = componentRef.value;
      element?.addEventListener('component-ready', () => {
        isComponentReady.value = true;
      });
    });
    
    return { isComponentReady, componentRef };
  },
  
  template: `
    <div ref="componentRef">
      <div v-if="!isComponentReady" class="loading-skeleton">
        Cargando componente...
      </div>
      <component-tag v-else></component-tag>
    </div>
  `
});
```

---

### **Problema 3: Memory Leaks en Simulador**

#### **Síntomas:**
```
Performance degradation after multiple simulation runs
Memory usage keeps growing
```

#### **Causa Root:**
Event listeners no se limpian al cambiar de paso en wizard.

#### **Solución:**
```typescript
// En FlowCanvas.vue - gestión de lifecycle
export default defineComponent({
  setup() {
    const cleanupFunctions = ref<Function[]>([]);
    
    function setupStep(step: WizardStep) {
      // Limpiar listeners anteriores
      cleanupFunctions.value.forEach(cleanup => cleanup());
      cleanupFunctions.value = [];
      
      // Setup nuevo step
      const element = loadExternalComponent(step.component);
      
      // Guardar función de limpieza
      const cleanup = () => {
        element.removeEventListeners?.();
        element.destroy?.();
      };
      cleanupFunctions.value.push(cleanup);
    }
    
    onUnmounted(() => {
      // Limpiar todo al destruir componente
      cleanupFunctions.value.forEach(cleanup => cleanup());
    });
  }
});
```

---

### **Problema 4: CSS Conflicts Between Components**

#### **Síntomas:**
```
Component A styles affecting Component B
Global CSS bleeding into Web Components
```

#### **Solución:**
```typescript
// Shadow DOM obligatorio para aislamiento
class CustomNodeElement extends HTMLElement {
  connectedCallback() {
    // Crear Shadow DOM para aislamiento completo
    this.attachShadow({ mode: 'closed' });
    
    // CSS encapsulado
    const styles = `
      <style>
        :host {
          display: block;
          /* Estilos solo afectan este componente */
        }
      </style>
    `;
    
    this.shadowRoot.innerHTML = styles + this.template;
  }
}
```

---

## 📋 **Checklist para Fábricas de Software**

### **Pre-desarrollo:**
- [ ] **Definir contrato de datos** (inputs/outputs esperados)
- [ ] **Setup del proyecto React** con build para Web Components
- [ ] **Configurar CDN** con CORS apropiado
- [ ] **Establecer versionado** semántico (v1.2.3)

### **Durante desarrollo:**
- [ ] **Implementar interface estándar** (NodeCommunication)
- [ ] **Usar Shadow DOM** para aislamiento CSS
- [ ] **Bundle React incluido** (no dependencias externas)
- [ ] **Error handling robusto** (graceful degradation)
- [ ] **Loading states** apropiados

### **Testing:**
- [ ] **Unit tests** para el componente React
- [ ] **Integration tests** como Web Component
- [ ] **Cross-browser testing** (Chrome, Firefox, Safari, Edge)
- [ ] **Performance testing** (tiempo de carga, memoria)

### **Deploy:**
- [ ] **CDN configurado** con cache apropiado
- [ ] **Versioning strategy** (múltiples versiones disponibles)
- [ ] **Monitoring** y alertas de disponibilidad
- [ ] **Rollback plan** para versiones problemáticas

---

## 🔍 **Herramientas de Debug**

### **1. Component Registry Inspector**
```typescript
// Agregar en consola de browser para debug
window.debugComponentRegistry = () => {
  console.table(window.__COMPONENT_REGISTRY__);
};

// Ver componentes cargados
window.debugLoadedComponents = () => {
  const components = document.querySelectorAll('[data-external-component]');
  console.log('Loaded components:', components);
};
```

### **2. Event Flow Tracer**
```typescript
// Debug de flujo de eventos entre componentes
window.enableEventTracing = () => {
  const originalDispatch = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function(event) {
    if (event.type.startsWith('node-')) {
      console.log('Event:', event.type, 'Data:', event.detail);
    }
    return originalDispatch.call(this, event);
  };
};
```

### **3. Performance Profiler**
```typescript
// Medir tiempo de carga de componentes
window.profileComponentLoad = async (componentUrl) => {
  const start = performance.now();
  await ExternalComponentLoader.loadComponent(componentUrl);
  const end = performance.now();
  console.log(`Component loaded in ${end - start}ms`);
};
```

---

## 📊 **Métricas a Monitorear**

### **Performance KPIs:**
- **Component Load Time**: < 2 segundos promedio
- **Memory Usage**: No incremento > 10MB por simulación
- **Network Requests**: Cache hit ratio > 80%
- **Error Rate**: < 1% de componentes fallan al cargar

### **Business KPIs:**
- **Simulation Success Rate**: > 95%
- **User Engagement**: Tiempo promedio en simulador
- **Component Adoption**: % de nodos usando componentes externos

### **Technical Metrics:**
```typescript
// Implementar en producción
interface ComponentMetrics {
  loadTime: number;
  errorCount: number;
  cacheHitRate: number;
  memoryUsage: number;
}

const trackComponentMetrics = (componentId: string, metrics: ComponentMetrics) => {
  // Enviar a sistema de monitoreo (ApplicationInsights, etc.)
};
```

---

## 🎓 **Lessons Learned para Nuevos Developers**

### **1. Siempre pensar en Fallbacks**
❌ **Mal**: Asumir que componente externo siempre carga
```typescript
const component = await loadExternalComponent(url); // ¿Y si falla?
render(component);
```

✅ **Bien**: Siempre tener plan B
```typescript
const component = await loadExternalComponent(url)
  .catch(() => loadFallbackComponent());
render(component);
```

### **2. Event Cleanup es Crítico**
❌ **Mal**: Dejar listeners colgando
```typescript
element.addEventListener('click', handler); // Memory leak
```

✅ **Bien**: Siempre limpiar
```typescript
const cleanup = () => element.removeEventListener('click', handler);
onUnmounted(cleanup);
```

### **3. Testing con Componentes Mock**
✅ **Recomendado**: Desarrollar con mocks, testear con reales
```typescript
// Development: usar componentes mock
const component = isDev 
  ? MockINEComponent 
  : await loadExternalComponent(url);
```

---

**Próxima actualización**: Después de implementar primer componente externo  
**Contacto para dudas**: Equipo de Arquitectura

---

*"La complejidad distribuida requiere simplicidad en las interfaces."*
