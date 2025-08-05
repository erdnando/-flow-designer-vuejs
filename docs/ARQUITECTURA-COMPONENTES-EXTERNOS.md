# 📚 Estrategia de Arquitectura: Flow Designer con Componentes Externos

## 🎯 **Resumen Ejecutivo**

Este documento describe la evolución del **Flow Designer VueJS** hacia una arquitectura modular que permite integrar componentes React desarrollados por múltiples fábricas de software externas. El objetivo es crear un sistema escalable donde cada componente visual puede ser desarrollado, versionado y desplegado independientemente.

---

## 🏗️ **Problema Principal**

### **Contexto Inicial:**
- **Flow Designer**: Aplicación Vue 3 + TypeScript para diseño de flujos de nodos
- **Simulador**: Sistema que ejecuta los flujos creados paso a paso
- **Limitación**: Todos los componentes visuales están hardcodeados en Vue

### **Nuevo Requerimiento:**
- Cada nodo del flujo debe corresponderse con una **vista web externa**
- Diferentes **fábricas de software** desarrollarán los componentes
- Cada componente debe ser **independiente** (propio proyecto, versionado, despliegue)
- Sistema debe soportar **200 trámites por minuto** en producción
- **Paso de parámetros** entre nodos (similar a BPM)

---

## 🎨 **Estrategia de Solución**

### **Arquitectura Distribuida de Componentes**

```
🏢 Fábrica A - "Identidad Digital"
├── ine-component-react/          → https://cdn-fabrica-a.com/ine/v1.2.3/
├── selfie-component-react/       → https://cdn-fabrica-a.com/selfie/v2.0.1/

🏢 Fábrica B - "Verificación SMS"  
├── sms-component-react/          → https://cdn-fabrica-b.com/sms/v2.1.0/

🏢 Fábrica C - "Datos Personales"
├── personal-data-react/          → https://cdn-fabrica-c.com/data/v1.5.2/
├── legal-terms-react/            → https://cdn-fabrica-c.com/legal/v1.0.5/

🏢 Tu Empresa - "Orquestador"
├── flow-designer-vue/            → Diseñador de flujos
└── component-registry-api/       → Registro centralizado
```

### **Tecnologías Elegidas:**

1. **Web Components** como estándar de integración
2. **React** para desarrollo de componentes externos
3. **Component Registry API** para descubrimiento dinámico
4. **CDN** para distribución de componentes
5. **Event-driven communication** para paso de parámetros

---

## 🔧 **Arquitectura Técnica**

### **1. Component Registry (Centralizado)**
```typescript
interface ComponentRegistry {
  id: string;
  name: string;
  provider: string;           // Identificador de la fábrica
  version: string;
  cdnUrl: string;            // URL del componente compilado
  type: 'web-component';
  contract: {
    inputs: string[];        // Parámetros que recibe
    outputs: string[];       // Datos que produce
    events: string[];        // Eventos que emite
  };
}
```

### **2. Estándar para Fábricas de Software**
```javascript
// Cada fábrica debe seguir este patrón
class INECaptureElement extends HTMLElement {
  // Métodos estándar requeridos
  setInputData(data)      // Recibir datos del nodo anterior
  sendOutputData(data)    // Enviar datos al siguiente nodo
  
  // Eventos estándar requeridos
  'component-ready'       // Componente listo para usar
  'node-completed'        // Nodo terminó exitosamente
  'node-error'           // Error en el nodo
  'data-changed'         // Datos del nodo cambiaron
}
```

### **3. Carga Dinámica en Vue**
```typescript
// ExternalComponentLoader.ts
class ExternalComponentLoader {
  static async loadReactComponent(config) {
    // 1. Cargar script desde CDN
    // 2. Crear wrapper Vue para Web Component
    // 3. Manejar comunicación entre Vue y React
    // 4. Implementar fallbacks y cache
  }
}
```

---

## 🚀 **Fases de Implementación**

### **Fase 1: Fundación (ACTUAL)**
- ✅ **Flow Designer funcionando** (Vue + TypeScript + Vite)
- ✅ **Simulador básico** con placeholders
- ✅ **Sistema de nodos** modular y extensible
- ✅ **Validaciones** y reglas de flujo
- ✅ **Auto-guardado** y persistencia local

### **Fase 2: Integración de Componentes Externos (EN DESARROLLO)**
- 🔄 **Proyecto React demo** (simular fábrica externa)
- 🔄 **Web Components wrapper** para React
- 🔄 **Component Loader** en Vue
- 🔄 **Comunicación bidireccional** Vue ↔ React

### **Fase 3: Registry y Versionado (PLANEADO)**
- 📋 **Component Registry API**
- 📋 **Versionado dinámico** de componentes
- 📋 **Cache y fallbacks**
- 📋 **Hot-swapping** de versiones

### **Fase 4: Producción y Escalabilidad (FUTURO)**
- 📋 **Backend orchestrator** (Azure Functions)
- 📋 **State management** distribuido
- 📋 **Paso de parámetros** entre nodos
- 📋 **Métricas y monitoreo**

---

## 📖 **Lecciones Aprendidas**

### **1. Arquitectura de Simulador** ⭐
**Problema**: Simulador inicial estaba hardcodeado con componentes Vue.

**Solución**: Sistema de mapeo dinámico que convierte flujo de nodos en pasos de wizard.

**Código clave**:
```typescript
// FlowCanvas.vue - createWizardFromFlow()
function createWizardFromFlow() {
  const flowSequence = buildFlowSequence();  // Sigue conexiones del flujo
  const steps: WizardStep[] = [];
  
  flowSequence.forEach(node => {
    steps.push({
      id: `step-${index + 1}`,
      nodeId: node.id,
      title: getNodeTitle(node),
      component: getComponentForNode(node),  // ← Aquí se mapea a componente externo
      description: getNodeDescription(node),
      nodeData: node.data  // ← Datos del nodo para ícono y configuración
    });
  });
}
```

**Aprendizaje**: El simulador debe ser agnóstico al tipo de componente (Vue, React, Web Component).

### **2. Gestión de Estados Complejos** ⭐
**Problema**: Cada modificación del canvas requería auto-guardado sin afectar rendimiento.

**Solución**: Sistema de auto-guardado inteligente con debouncing.

**Código clave**:
```typescript
// Auto-guardado que detecta cambios reales
watch([nodes, edges], () => {
  debouncedSave();
}, { deep: true });

const debouncedSave = debounce(() => {
  if (hasRealChanges()) {
    saveToLocalStorage();
  }
}, 1000);
```

**Aprendizaje**: El auto-guardado debe ser imperceptible pero confiable.

### **3. Validaciones Dinámicas** ⭐
**Problema**: Reglas de validación complejas (ej: solo un nodo START, conexiones válidas).

**Solución**: Sistema de reglas composable y extensible.

**Código clave**:
```typescript
// nodeValidationRules.ts
const validationRules = [
  {
    id: 'single-start-node',
    check: (nodes) => nodes.filter(n => n.type === 'start').length === 1,
    message: 'Debe haber exactamente un nodo START'
  }
  // ... más reglas
];
```

**Aprendizaje**: Las validaciones deben ser declarativas y fáciles de extender.

### **4. Gestión de Catálogo de Nodos** ⭐
**Problema**: Nodos hardcodeados en código, difícil de mantener.

**Solución**: Store centralizado con sistema de templates.

**Código clave**:
```typescript
// nodeCatalog.ts
export interface NodeTemplate {
  id: string;
  name: string;
  categoria: string;
  version: string;
  type: 'processNode' | 'engineNode';
  data?: {
    icon?: string;           // SVG embebido
    customTypeId?: string;   // Identificador único
  };
}
```

**Aprendizaje**: El catálogo debe prepararse para recibir datos de API externa.

---

## ⚠️ **Desafíos Identificados**

### **1. Comunicación Vue ↔ React**
**Desafío**: Pasar datos y eventos entre frameworks diferentes.

**Estrategias evaluadas**:
- ✅ **Web Components** (estándar, compatible)
- ✅ **Module Federation** (potente, complejo)
- ✅ **Iframe + PostMessage** (aislado, limitado)
- ✅ **Veaury Bridge** (específico Vue-React)

**Decisión**: Web Components como estándar principal.

### **2. Versionado y Dependencias**
**Desafío**: Cada fábrica puede usar diferentes versiones de React.

**Estrategia**: Componentes auto-contenidos con React bundleado.

### **3. Performance con 200 trámites/min**
**Desafío**: Carga dinámica de componentes sin afectar rendimiento.

**Estrategias**:
- Cache de componentes cargados
- Lazy loading inteligente
- Web Workers para operaciones pesadas
- CDN con caché global

### **4. Testing de Componentes Externos**
**Desafío**: ¿Cómo testear componentes que vienen de fábricas externas?

**Estrategia planeada**:
- Contract testing
- Componentes mock para desarrollo
- Integration tests con componentes reales

---

## 🎯 **Próximos Pasos**

### **Inmediatos (Esta semana)**
1. **Crear proyecto React demo** (`../react-components-demo`)
2. **Implementar primer Web Component** (INE Capture)
3. **Integrar en simulador Vue** con carga dinámica
4. **Probar comunicación bidireccional**

### **Corto plazo (Próximas 2 semanas)**
1. **Component Registry API** (mock inicial)
2. **Sistema de versionado** de componentes
3. **Fallbacks y error handling**
4. **Documentación para fábricas**

### **Mediano plazo (Próximo mes)**
1. **Backend orchestrator** con Azure Functions
2. **Paso de parámetros** entre nodos
3. **State management** distribuido
4. **Testing strategy** completa

---

## 💡 **Principios de Diseño**

1. **Modularidad**: Cada componente es independiente
2. **Intercambiabilidad**: Componentes se pueden reemplazar sin afectar el sistema
3. **Versionado**: Soporte para múltiples versiones simultáneas
4. **Fallback graceful**: Sistema funciona aunque componentes fallen
5. **Performance**: Carga bajo demanda, cache inteligente
6. **Standards compliance**: Uso de estándares web (Web Components)
7. **Developer experience**: Fácil para fábricas desarrollar componentes

---

## 📚 **Referencias Técnicas**

### **Documentación clave**:
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [React 18 Features](https://reactjs.org/blog/2022/03/29/react-v18.html)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)

### **Archivos importantes del proyecto**:
- `src/stores/nodeCatalog.ts` - Catálogo de nodos
- `src/components/FlowCanvas.vue` - Canvas principal y simulador
- `src/services/ExternalComponentLoader.ts` - Cargador de componentes
- `docs/WIZARD-SIMULATOR-SISTEMA.md` - Documentación del simulador

---

## 👥 **Equipo y Responsabilidades**

- **Arquitecto de solución**: Diseño de arquitectura distribuida
- **Frontend Vue**: Mantenimiento del Flow Designer
- **Integration lead**: Desarrollo del Component Loader
- **DevOps**: Setup de CDN y registry API
- **Fábricas externas**: Desarrollo de componentes React

---

**Versión**: 1.0  
**Última actualización**: Agosto 2025  
**Próxima revisión**: Después de Fase 2

---

*Este documento es un living document que se actualiza conforme evoluciona la arquitectura.*
