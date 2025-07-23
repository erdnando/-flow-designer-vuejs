# Sistema de Conexiones - Flow Designer

## 📋 Resumen Ejecutivo

Este documento detalla la implementación completa del sistema de conexiones en el Flow Designer, incluyendo los desafíos técnicos enfrentados, las soluciones implementadas y el conocimiento técnico adquirido para futuras sesiones de desarrollo.

## 🎯 Objetivos del Sistema

- **Selección interactiva**: Permitir seleccionar conexiones mediante click
- **Visualización clara**: Diferenciar estados (normal, seleccionada, hover)
- **Animaciones fluidas**: Conexiones animadas con efectos visuales atractivos
- **Integración completa**: Panel de propiedades para gestionar conexiones
- **Selección exclusiva**: Solo un elemento seleccionado a la vez (nodo O conexión)
- **Consistencia visual**: Estado visual y lógico siempre sincronizado

## 🚫 Problemáticas Principales Encontradas

### 1. **Problema de Captura de Eventos**
**Descripción**: Vue Flow captura todos los eventos de mouse en las conexiones, impidiendo la detección de clicks.

**Síntomas**:
- Los event listeners normales (`@click`, `onEdgeClick`) no se ejecutan
- Los eventos se propagan hasta Vue Flow pero no llegan a nuestros handlers
- Las conexiones no responden a interacciones del usuario

**Causa Raíz**: 
```css
.vue-flow__edge {
    pointer-events: none !important; /* Vue Flow desactiva eventos por defecto */
}
```

### 2. **Problema de Z-Index y Visibilidad**
**Descripción**: Las conexiones estaban invisibles o no interactuables debido a problemas de capas CSS.

**Síntomas**:
- Conexiones presentes en el DOM pero no visibles
- Elementos SVG sin `pointer-events`
- Z-index insuficiente para interacción

### 3. **Problema de Estado Inconsistente**
**Descripción**: Desincronización entre el estado visual y el estado lógico de selección.

**Síntomas**:
- Panel muestra información de conexión pero visualmente está seleccionado un nodo
- Al arrastrar nodos, la selección no se actualiza correctamente
- Selección múltiple accidental (nodo Y conexión seleccionados)

## 💡 Soluciones Implementadas

### 1. **Detección Global de Clicks**
Implementamos un sistema de detección global usando `document.elementsFromPoint()`:

```javascript
function setupGlobalEdgeClickDetection() {
    document.addEventListener('click', (event) => {
        const clickX = event.clientX;
        const clickY = event.clientY;
        
        // Obtener TODOS los elementos en esa posición
        const elementsAtPoint = document.elementsFromPoint(clickX, clickY);
        
        // Buscar edges en la pila de elementos
        for (const element of elementsAtPoint) {
            if (element.classList.contains('vue-flow__edge-path')) {
                handleGlobalEdgeClick(element, event);
                return;
            }
        }
    }, true); // Usar capture phase
}
```

**¿Por qué funciona?**
- `elementsFromPoint()` ignora las restricciones de `pointer-events`
- Obtiene todos los elementos en las coordenadas del click
- Permite detectar elementos SVG que normalmente son inaccesibles

### 2. **CSS Corregido para Interactividad**
```css
/* Hacer que los edges sean interactuables */
.vue-flow__edge {
    cursor: pointer !important;
    pointer-events: all !important;
    z-index: 100 !important;
}

.vue-flow__edge-path {
    pointer-events: all !important;
    cursor: pointer !important;
    z-index: 104 !important;
}

.vue-flow__edge svg {
    pointer-events: all !important;
    cursor: pointer !important;
    z-index: 102 !important;
}
```

### 3. **Sistema de Animaciones Diferenciadas**
```css
/* Animación para conexiones normales */
@keyframes dash {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: -13; }
}

/* Animación para conexiones seleccionadas (más rápida) */
@keyframes dash-selected {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: -13; }
}

.vue-flow__edge-path {
    animation: dash 2s linear infinite;
    stroke: #5078ff;
    stroke-width: 3px;
}

.vue-flow__edge.selected .vue-flow__edge-path {
    animation: dash-selected 1.0s linear infinite;
    stroke: #ffd700;
    stroke-width: 5px;
}
```

### 4. **Selección Mutual Exclusiva**
```javascript
// Al seleccionar una conexión
function onEdgeClick({ edge }) {
    // Deseleccionar todos los nodos
    selectedNodeId.value = null;
    selectedNode.value = null;
    nodes.value = nodes.value.map(n => ({ ...n, selected: false }));
    
    // Seleccionar solo esta conexión
    selectedEdgeId.value = edge.id;
    edges.value = edges.value.map(e => ({ ...e, selected: e.id === edge.id }));
}

// Al seleccionar un nodo
function onNodeClick({ node }) {
    // Deseleccionar todas las conexiones
    selectedEdgeId.value = null;
    selectedEdge.value = null;
    edges.value = edges.value.map(e => ({ ...e, selected: false }));
    
    // Seleccionar solo este nodo
    selectedNodeId.value = node.id;
    nodes.value = nodes.value.map(n => ({ ...n, selected: n.id === node.id }));
}
```

### 5. **Sincronización en Drag & Drop**
```javascript
function onNodeDragStop(event) {
    const draggedNode = event.node;
    if (draggedNode?.id) {
        // Forzar selección del nodo arrastrado
        selectedEdgeId.value = null;
        selectedEdge.value = null;
        edges.value = edges.value.map(e => ({ ...e, selected: false }));
        
        selectedNodeId.value = draggedNode.id;
        nodes.value = nodes.value.map(n => ({ ...n, selected: n.id === draggedNode.id }));
        
        showingProjectProps.value = false;
        if (panelCollapsed.value) panelCollapsed.value = false;
    }
}
```

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **FlowCanvas.vue**
   - Contiene la lógica principal de selección
   - Maneja eventos globales de click
   - Sincroniza estados visual y lógico

2. **NodePropertiesPanel.vue**
   - Muestra propiedades de conexiones seleccionadas
   - Permite editar tipo, animación y metadata
   - Integración completa con el sistema de selección

3. **Stores/flow.ts**
   - Almacena el estado de conexiones con propiedades completas
   - Incluye `animated: true`, `selectable: true`, etc.

### Flujo de Datos

```
User Click → elementsFromPoint() → handleGlobalEdgeClick() → onEdgeClick() → Update States → UI Refresh
```

## 📊 Estados del Sistema

### Estados de Conexión
- **Normal**: Azul (#5078ff), 3px, animada a 2s
- **Hover**: Azul claro (#6b8aff), 4px, animada
- **Seleccionada**: Dorada (#ffd700), 5px, animada a 1.0s (más rápida)

### Variables de Estado
```javascript
const selectedEdgeId = ref<string | null>(null);
const selectedEdge = ref<Edge | null>(null);
const selectedNodeId = ref<string | null>(null);
const selectedNode = ref<Node | null>(null);
const showingProjectProps = ref(false);
```

## 🔧 Funciones Clave

### Detección y Selección
- `setupGlobalEdgeClickDetection()`: Configura detección global
- `handleGlobalEdgeClick()`: Procesa clicks en conexiones
- `onEdgeClick()`: Actualiza selección de conexiones
- `deselectAll()`: Limpia toda selección

### Sincronización
- `updateSelectedEdgeFromList()`: Mantiene referencias actualizadas
- `onNodeDragStop()`: Sincroniza selección tras arrastre

### Propiedades
- `updateEdgeProperty()`: Actualiza propiedades de conexiones
- `updateProperty()`: Función unificada para nodos y conexiones

## 🎨 Consideraciones de UX

### Feedback Visual
- **Inmediato**: Cambio de color al seleccionar
- **Consistente**: Mismo patrón de selección para todos los elementos
- **Intuitivo**: Velocidad de animación indica selección

### Interactividad
- **Click simple**: Selección básica
- **Hover**: Preview visual
- **Drag**: Selección automática del elemento arrastrado

## 🚀 Rendimiento

### Optimizaciones Implementadas
- Event listeners con `capture: true` para mejor rendimiento
- Debounced updates en funciones de sincronización
- CSS con `will-change` y `transform` para animaciones GPU
- Watchers con `deep: false` para evitar re-renders innecesarios

## 📋 Testing y Validación

### Casos de Prueba Cubiertos
- ✅ Click en conexión selecciona correctamente
- ✅ Click en nodo deselecciona conexión
- ✅ Arrastrar nodo actualiza selección
- ✅ Panel muestra información correcta
- ✅ Animaciones funcionan en todos los estados
- ✅ Z-index permite interacción
- ✅ Selección exclusiva funciona correctamente

## 🔮 Futuras Mejoras

### Posibles Extensiones
1. **Multi-selección**: Seleccionar múltiples conexiones con Ctrl+Click
2. **Conexiones personalizadas**: Diferentes tipos visuales
3. **Animaciones condicionales**: Basadas en estado del flujo
4. **Tooltips informativos**: Al hacer hover en conexiones
5. **Shortcuts de teclado**: Delete, Copy, Paste para conexiones

### Consideraciones Técnicas
- Mantener compatibilidad con futuras versiones de Vue Flow
- Optimizar para casos con muchas conexiones (1000+)
- Considerar accessibility (a11y) para selección por teclado

## 📚 Recursos y Referencias

### Documentación Técnica
- [Vue Flow Documentation](https://vueflow.dev/)
- [SVG Event Handling](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events)
- [Document.elementsFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint)

### Commits Relevantes
- Implementación inicial de detección global
- Corrección de CSS y z-index
- Sistema de animaciones diferenciadas
- Integración con panel de propiedades
- Sincronización en drag & drop

---

**Autor**: GitHub Copilot & erdnando  
**Fecha**: 22 de Julio, 2025  
**Versión**: 1.0
