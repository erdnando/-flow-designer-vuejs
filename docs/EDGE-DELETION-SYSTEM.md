# Sistema de Eliminación de Conexiones (Edge Deletion System)

## Resumen Ejecutivo

Se implementó un sistema completo para eliminar conexiones en Vue Flow con botón visual y confirmación mediante diálogo. La implementación requirió superar limitaciones técnicas de Vue Flow relacionadas con la interceptación de eventos en componentes personalizados.

## Funcionalidades Implementadas

### 1. Botón de Eliminación Visual
- **Ubicación**: Integrado en cada conexión a través del componente `CustomEdge.vue`
- **Visibilidad**: Solo aparece cuando la conexión está seleccionada
- **Diseño**: Botón rojo con ícono de papelera, posicionado en el punto medio de la conexión
- **Tecnología**: Implementado usando `foreignObject` en SVG para insertar HTML/Vue en elementos SVG

### 2. Sistema de Confirmación
- **Componente**: Utiliza `SimpleDialog.vue` existente
- **Mensaje personalizado**: Muestra nombres de los nodos origen y destino
- **Opciones**: "Cancelar" y "Sí, eliminar" con estilos diferenciados
- **Notificaciones**: Confirmación visual al eliminar con detalles de la conexión eliminada

### 3. Gestión de Estado
- **Selección**: Sistema reactivo para mostrar/ocultar botón según conexión seleccionada
- **Validaciones**: Ejecuta validaciones automáticas después de eliminar
- **Auto-guardado**: Persiste cambios automáticamente en localStorage
- **Limpieza**: Deselecciona conexión eliminada y actualiza interfaz

## Arquitectura Técnica

### Componentes Involucrados

#### CustomEdge.vue
```vue
- Wrapper de BaseEdge de Vue Flow
- foreignObject con botón de eliminación
- Detección de selección de conexión
- Emisión de eventos de eliminación
```

#### FlowCanvas.vue
```vue
- Global click listener para capturar eventos interceptados
- Manejo de diálogos de confirmación
- Gestión de estado de conexiones seleccionadas
- Funciones de eliminación y validación
```

#### SimpleDialog.vue
```vue
- Diálogo reutilizable para confirmaciones
- Configuración dinámica de mensajes
- Botones personalizables
```

### Flujo de Datos

```
Usuario Click → CustomEdge → Global Listener → FlowCanvas → SimpleDialog → Confirmación → Eliminación
```

## Problemáticas Encontradas y Soluciones

### 🚨 Problema Principal: Interceptación de Eventos por Vue Flow

**Descripción**: Vue Flow intercepta automáticamente los eventos de componentes personalizados dentro de edges, evitando que los eventos custom (como clicks en botones) se propaguen correctamente al componente padre.

**Síntomas**:
- El botón aparece correctamente
- Los clicks se detectan a nivel DOM pero no llegan a las funciones de Vue
- `elementsFromPoint` muestra el botón pero el `event.target` es incorrecto

**Evidencia en logs**:
```
📍 Elementos en esa posición: [..., div.edge-delete-button, foreignObject.vue-flow__edge-delete-button, ...]
🔍 Tag name del target: DIV (vue-flow__nodes vue-flow__container)
```

### ✅ Solución: Global Click Listener

Se implementó un sistema de detección global que usa `document.elementsFromPoint()` para bypass la interceptación de Vue Flow:

```javascript
document.addEventListener('click', (event) => {
    // Verificar usando elementsFromPoint para capturar clicks interceptados
    const elementsFromPoint = document.elementsFromPoint(event.clientX, event.clientY);
    
    // Buscar botón de eliminar conexión en la pila de elementos
    const deleteButton = elementsFromPoint.find(el => 
        el.classList.contains('edge-delete-button') || 
        el.closest('.edge-delete-button')
    );
    
    if (deleteButton) {
        handleEdgeDeleteButtonClick(deleteButton, event);
        return;
    }
    
    // Método de fallback para casos donde elementsFromPoint no funcione
    if (target && (target.classList.contains('edge-delete-button') || target.closest('.edge-delete-button'))) {
        handleEdgeDeleteButtonClick(target, event);
        return;
    }
});
```

### Problemáticas Secundarias Resueltas

#### 1. Posicionamiento del Botón
- **Problema**: Botón no aparecía en el punto medio de la conexión
- **Solución inicial**: Cálculo correcto de coordenadas usando `edgeCenterX` y `edgeCenterY`
- **Problema refinado**: Desfase en conexiones con curvas complejas (ej: handler "false" del nodo IF)
- **Solución final**: Cálculo matemático preciso usando fórmula de curva Bézier cúbica

#### 2. Algoritmo de Posicionamiento Preciso
**Implementación matemática**:
```javascript
// Calcular puntos de control reales
let controlDistanceX = Math.max(dx * 0.5, 50);
let controlDistanceY = Math.max(dy * 0.5, 50);

// Aplicar según dirección de handlers
if (sourcePosition === Position.Bottom) {
    controlY1 = sourceY + controlDistanceY;
}
if (targetPosition === Position.Left) {
    controlX2 = targetX - controlDistanceX;
}

// Calcular punto exacto en t=0.5 de la curva Bézier
const t = 0.5;
const x = Math.pow(1-t, 3) * sourceX + 
          3 * Math.pow(1-t, 2) * t * controlX1 + 
          3 * (1-t) * Math.pow(t, 2) * controlX2 + 
          Math.pow(t, 3) * targetX;
```

**Casos específicos resueltos**:
- ✅ Conexiones desde handler "false" (Bottom) del nodo IF
- ✅ Conexiones con curvas pronunciadas
- ✅ Diferentes tipos de edges (Bézier, straight, step)

#### 2. Z-Index y Visibilidad
- **Problema**: Botón no era clickeable debido a elementos superpuestos
- **Solución**: `pointer-events: auto` y z-index adecuado en CSS

#### 3. Detección de Selección
- **Problema**: Botón siempre visible
- **Solución**: Computed property reactivo basado en `selectedEdgeId`

## Lecciones Aprendidas

### 1. **Global Click Listener como Patrón de Solución**
**Contexto**: Cuando Vue Flow o librerías similares interceptan eventos, el patrón de global click listener es efectivo.

**Implementación**:
- Usar `document.addEventListener` con capture phase
- Combinar `event.target` y `document.elementsFromPoint()`
- Implementar fallbacks para diferentes escenarios

**Casos de uso futuros**:
- Botones en nodos personalizados
- Elementos interactivos en overlays
- Cualquier componente dentro de Vue Flow que necesite eventos custom

### 2. **Debugging de Eventos Interceptados**
**Herramientas clave**:
```javascript
console.log('📍 Elementos en esa posición:', document.elementsFromPoint(x, y));
console.log('🔍 Tag name del target:', event.target.tagName);
console.log('🔍 Clases del target:', event.target.classList?.toString());
```

**Señales de interceptación**:
- `event.target` no coincide con elemento visual clickeado
- `elementsFromPoint` muestra el elemento esperado
- Eventos no llegan a handlers de Vue

### 3. **ForeignObject en SVG**
**Ventajas**:
- Permite HTML/CSS/Vue dentro de elementos SVG
- Mantiene reactividad de Vue
- Posicionamiento preciso

**Limitaciones**:
- Eventos pueden ser interceptados por contenedor SVG
- Requiere manejo especial de z-index
- CSS puede comportarse diferente que en DOM normal

### 4. **Gestión de Estado en Vue Flow**
**Buenas prácticas**:
- Mantener estado de selección centralizado (`selectedEdgeId`)
- Usar watchers para sincronizar estado con elementos DOM
- Implementar cleanup al eliminar elementos
- Ejecutar validaciones después de modificaciones

## Patrón Reutilizable: Global Click Detection

### Template para Futuras Implementaciones

```javascript
function setupGlobalClickDetection() {
    document.addEventListener('click', (event) => {
        const target = event.target as Element;
        const elementsFromPoint = document.elementsFromPoint(event.clientX, event.clientY);
        
        // Buscar elemento específico en la pila
        const specificElement = elementsFromPoint.find(el => 
            el.classList.contains('your-target-class') || 
            el.closest('.your-target-class')
        );
        
        if (specificElement) {
            handleSpecificElementClick(specificElement, event);
            return;
        }
        
        // Fallback method
        if (target && (target.classList.contains('your-target-class') || target.closest('.your-target-class'))) {
            handleSpecificElementClick(target, event);
            return;
        }
    }, true); // Use capture phase
}

function handleSpecificElementClick(element: Element, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    // 1. Encontrar elemento padre relevante
    const parentElement = element.closest('.parent-container');
    
    // 2. Extraer ID o datos necesarios
    const dataId = parentElement?.getAttribute('data-id');
    
    // 3. Ejecutar acción correspondiente
    if (dataId) {
        yourActionFunction(dataId);
    }
}
```

### Casos de Uso Identificados

1. **Botones en Nodos**: Para toolbars, acciones rápidas
2. **Elementos en Edges**: Botones, badges, indicadores
3. **Overlays Personalizados**: Controles flotantes sobre Vue Flow
4. **Elementos en Minimap**: Controles adicionales en minimap
5. **Background Interactions**: Clicks en areas específicas del fondo

## Archivos Modificados

### Archivos Principales
- `src/components/CustomEdge.vue` - Componente de conexión con botón
- `src/components/FlowCanvas.vue` - Sistema global de detección y manejo
- `src/components/SimpleDialog.vue` - Diálogo de confirmación (existente)

### Archivos de Documentación
- `docs/EDGE-DELETION-SYSTEM.md` - Este documento
- `docs/DELETION-SYSTEM-AND-DIALOGS.md` - Documentación previa (referencia)

## Configuración y Dependencias

### Dependencias Utilizadas
- Vue Flow 1.42.1 (baseEdge, foreignObject)
- Vue 3 (reactive, ref, computed)
- CSS custom para estilos del botón

### Configuración Requerida
- Edge types configurados con tipo 'deletable'
- Global click listener inicializado en onMounted
- SimpleDialog components registrados en template

## Testing y Validación

### Escenarios Probados
✅ Botón aparece solo cuando conexión está seleccionada
✅ Click en botón abre diálogo de confirmación
✅ Confirmación elimina conexión correctamente
✅ Cancelación mantiene conexión intacta
✅ Notificaciones aparecen correctamente
✅ Estado se persiste en localStorage
✅ Validaciones se ejecutan después de eliminar

### Edge Cases Manejados
- Conexión no encontrada por ID
- Elementos DOM no disponibles
- Múltiples clicks rápidos
- Conexión eliminada antes de confirmación

## Referencias Técnicas

### Vue Flow Documentation
- [Custom Edges](https://vueflow.dev/guide/edges.html#custom-edges)
- [ForeignObject](https://vueflow.dev/examples/misc/foreign-object.html)

### MDN References
- [document.elementsFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint)
- [Event.stopPropagation()](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)
- [SVG foreignObject](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)

---

**Fecha de implementación**: Enero 2025
**Versión Vue Flow**: 1.42.1
**Estado**: ✅ Completado y funcional
