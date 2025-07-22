# Sistema de Reglas de Validación para Nodos y Flujos

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tipos de Validación](#tipos-de-validación)
4. [Estructura de Reglas](#estructura-de-reglas)
5. [Reglas Predefinidas](#reglas-predefinidas)
6. [Cómo Agregar Nuevas Reglas](#cómo-agregar-nuevas-reglas)
7. [Validación de Conexiones](#validación-de-conexiones)
8. [Integración con el Sistema de Alertas](#integración-con-el-sistema-de-alertas)
9. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## Descripción General

El sistema de reglas de validación es un mecanismo escalable y modular que permite definir, ejecutar y gestionar reglas de negocio para nodos, conexiones y flujos completos en el flow designer. 

### Características Principales:
- **Escalable**: Fácil agregar nuevas reglas sin modificar código existente
- **Tipado**: Full TypeScript con interfaces bien definidas
- **Modular**: Reglas independientes que se pueden habilitar/deshabilitar
- **Integrado**: Conectado automáticamente con el sistema de notificaciones visuales

---

## Arquitectura del Sistema

### Archivo Principal: `src/utils/nodeValidationRules.ts`

```typescript
// Estructura base de una regla de validación
export interface ValidationRule {
    id: string;                    // Identificador único
    name: string;                  // Nombre descriptivo
    description: string;           // Descripción detallada
    category: 'node' | 'connection' | 'flow'; // Tipo de validación
    enabled: boolean;              // Si la regla está activa
    validate: (nodes: Node[], edges?: Edge[]) => ValidationResult;
}

// Resultado de una validación
export interface ValidationResult {
    isValid: boolean;              // Si pasó la validación
    ruleId: string;               // ID de la regla que se ejecutó
    message?: string;             // Mensaje descriptivo del error
    affectedNodes?: string[];     // IDs de nodos afectados
    affectedEdges?: string[];     // IDs de conexiones afectadas
    severity: 'error' | 'warning' | 'info'; // Nivel de severidad
}
```

---

## Tipos de Validación

### 1. **Validación de Nodos** (`category: 'node'`)
Valida aspectos individuales o grupales de los nodos:
- Unicidad de tipos específicos (START, END)
- Configuración mínima requerida
- Propiedades obligatorias

### 2. **Validación de Conexiones** (`category: 'connection'`)
Valida las conexiones entre nodos:
- Conexiones válidas entre tipos específicos
- Límites de conexiones entrantes/salientes
- Ciclos no permitidos

### 3. **Validación de Flujo** (`category: 'flow'`)
Valida el flujo completo:
- Estructura general válida
- Caminos de ejecución completos
- Nodos huérfanos o desconectados

---

## Estructura de Reglas

### Regla Básica
```typescript
const singleStartNodeRule: ValidationRule = {
    id: 'single-start-node',
    name: 'Nodo START único',
    description: 'Solo puede existir un nodo de tipo START en el flujo',
    category: 'node',
    enabled: true,
    validate: (nodes: Node[]) => {
        const startNodes = nodes.filter(node => node.type === 'start');
        
        if (startNodes.length === 0) {
            return {
                isValid: false,
                ruleId: 'single-start-node',
                message: 'El flujo debe tener al menos un nodo START',
                severity: 'error'
            };
        }
        
        if (startNodes.length > 1) {
            return {
                isValid: false,
                ruleId: 'single-start-node',
                message: `Se encontraron ${startNodes.length} nodos START. Solo se permite uno.`,
                affectedNodes: startNodes.map(n => n.id),
                severity: 'error'
            };
        }
        
        return {
            isValid: true,
            ruleId: 'single-start-node',
            severity: 'info'
        };
    }
};
```

---

## Reglas Predefinidas

### 1. **Single Start Node** (`single-start-node`)
- **Propósito**: Garantiza que solo exista un nodo START
- **Categoría**: `node`
- **Severidad**: `error`

### 2. **Single End Node** (`single-end-node`)  
- **Propósito**: Garantiza que solo exista un nodo END
- **Categoría**: `node`
- **Severidad**: `error`

### Reglas Futuras (Ejemplos):
```typescript
// Ejemplo de regla de conexión
const noCircularConnectionsRule: ValidationRule = {
    id: 'no-circular-connections',
    name: 'Sin conexiones circulares',
    description: 'No se permiten conexiones que formen ciclos infinitos',
    category: 'connection',
    enabled: true,
    validate: (nodes: Node[], edges: Edge[]) => {
        // Lógica para detectar ciclos
        // ...
    }
};

// Ejemplo de regla de flujo
const connectedFlowRule: ValidationRule = {
    id: 'connected-flow',
    name: 'Flujo conectado',
    description: 'Todos los nodos deben estar conectados al flujo principal',
    category: 'flow',
    enabled: true,
    validate: (nodes: Node[], edges: Edge[]) => {
        // Lógica para verificar conectividad
        // ...
    }
};
```

---

## Cómo Agregar Nuevas Reglas

### Paso 1: Definir la Regla
```typescript
// En src/utils/nodeValidationRules.ts
const miNuevaRegla: ValidationRule = {
    id: 'mi-nueva-regla',
    name: 'Mi Nueva Regla',
    description: 'Descripción de lo que hace la regla',
    category: 'node', // o 'connection' o 'flow'
    enabled: true,
    validate: (nodes: Node[], edges?: Edge[]) => {
        // Tu lógica de validación aquí
        
        if (/* condición de error */) {
            return {
                isValid: false,
                ruleId: 'mi-nueva-regla',
                message: 'Mensaje de error descriptivo',
                affectedNodes: ['id1', 'id2'], // opcional
                severity: 'error'
            };
        }
        
        return {
            isValid: true,
            ruleId: 'mi-nueva-regla',
            severity: 'info'
        };
    }
};
```

### Paso 2: Registrar la Regla
```typescript
// Agregar al array de reglas
const validationRules: ValidationRule[] = [
    singleStartNodeRule,
    singleEndNodeRule,
    miNuevaRegla, // ← Agregar aquí
];
```

### Paso 3: Probar la Regla
La regla se ejecutará automáticamente en estos momentos:
- Al agregar nodos
- Al duplicar nodos  
- Al actualizar propiedades
- Al eliminar nodos
- Al cargar un flujo desde localStorage

---

## Validación de Conexiones

### Ejemplo de Regla de Conexión
```typescript
const maxConnectionsRule: ValidationRule = {
    id: 'max-connections-per-node',
    name: 'Límite de conexiones por nodo',
    description: 'Cada nodo puede tener máximo 5 conexiones salientes',
    category: 'connection',
    enabled: true,
    validate: (nodes: Node[], edges: Edge[] = []) => {
        for (const node of nodes) {
            const outgoingConnections = edges.filter(edge => edge.source === node.id);
            
            if (outgoingConnections.length > 5) {
                return {
                    isValid: false,
                    ruleId: 'max-connections-per-node',
                    message: `El nodo "${node.data.label}" tiene ${outgoingConnections.length} conexiones salientes. Máximo permitido: 5.`,
                    affectedNodes: [node.id],
                    affectedEdges: outgoingConnections.map(e => e.id),
                    severity: 'warning'
                };
            }
        }
        
        return { isValid: true, ruleId: 'max-connections-per-node', severity: 'info' };
    }
};
```

---

## Integración con el Sistema de Alertas

El sistema de validación está completamente integrado con las notificaciones visuales:

### Función Principal de Validación
```typescript
// En FlowCanvas.vue
function runNodeValidations(showNotifications: boolean = true) {
    const errors = getValidationErrors(nodes.value);
    validationErrors.value = errors;
    
    if (showNotifications && errors.length > 0) {
        // Mostrar notificaciones automáticamente
        showValidationError(error.message!, {
            title: 'Regla de validación violada',
            description: `Regla "${error.ruleId}": ${error.message}`,
            actions: [
                {
                    label: 'Entendido',
                    action: () => {},
                    style: 'primary'
                },
                {
                    label: 'Ver reglas',
                    action: () => {
                        // Mostrar detalles de las reglas
                    },
                    style: 'secondary'
                }
            ]
        });
    }
    
    return errors.length === 0;
}
```

### Tipos de Integración:
1. **Preventiva**: Impide acciones que violarían reglas
2. **Reactiva**: Muestra alertas después de detectar violaciones
3. **Informativa**: Proporciona resumen al cargar flujos con errores

---

## Ejemplos de Implementación

### 1. Regla Personalizada: "Nodos Requeridos"
```typescript
const requiredNodesRule: ValidationRule = {
    id: 'required-nodes',
    name: 'Nodos requeridos',
    description: 'El flujo debe tener al menos un nodo START y un nodo END',
    category: 'flow',
    enabled: true,
    validate: (nodes: Node[]) => {
        const hasStart = nodes.some(n => n.type === 'start');
        const hasEnd = nodes.some(n => n.type === 'end');
        
        if (!hasStart || !hasEnd) {
            return {
                isValid: false,
                ruleId: 'required-nodes',
                message: `Faltan nodos requeridos: ${!hasStart ? 'START' : ''} ${!hasEnd ? 'END' : ''}`,
                severity: 'error'
            };
        }
        
        return { isValid: true, ruleId: 'required-nodes', severity: 'info' };
    }
};
```

### 2. Regla de Propiedades Obligatorias
```typescript
const requiredPropertiesRule: ValidationRule = {
    id: 'required-properties',
    name: 'Propiedades obligatorias',
    description: 'Ciertos tipos de nodos requieren propiedades específicas',
    category: 'node',
    enabled: true,
    validate: (nodes: Node[]) => {
        const conditionNodes = nodes.filter(n => n.type === 'condition');
        
        for (const node of conditionNodes) {
            if (!node.data.condition || node.data.condition.trim() === '') {
                return {
                    isValid: false,
                    ruleId: 'required-properties',
                    message: `El nodo de condición "${node.data.label}" requiere definir una condición`,
                    affectedNodes: [node.id],
                    severity: 'warning'
                };
            }
        }
        
        return { isValid: true, ruleId: 'required-properties', severity: 'info' };
    }
};
```

---

## Configuración y Personalización

### Habilitar/Deshabilitar Reglas
```typescript
// Deshabilitar una regla específica
const rule = validationRules.find(r => r.id === 'single-start-node');
if (rule) {
    rule.enabled = false;
}

// Filtrar reglas habilitadas
const enabledRules = validationRules.filter(rule => rule.enabled);
```

### Configuración por Categoría
```typescript
// Ejecutar solo reglas de nodos
const nodeRules = validationRules.filter(r => r.category === 'node' && r.enabled);
const nodeResults = nodeRules.map(rule => rule.validate(nodes));

// Ejecutar solo reglas de conexiones  
const connectionRules = validationRules.filter(r => r.category === 'connection' && r.enabled);
const connectionResults = connectionRules.map(rule => rule.validate(nodes, edges));
```

---

## Mejores Prácticas

### 1. **Nomenclatura**
- IDs en kebab-case: `single-start-node`
- Nombres descriptivos: `"Nodo START único"`
- Mensajes claros y accionables

### 2. **Rendimiento**
- Validaciones rápidas para ejecución frecuente
- Cachear resultados costosos cuando sea posible
- Usar `showNotifications: false` en validaciones silenciosas

### 3. **Mantenibilidad**
- Una regla por responsabilidad
- Funciones auxiliares para lógica compleja
- Documentar el propósito de cada regla

### 4. **Usuario**
- Mensajes de error descriptivos
- Incluir sugerencias de solución
- Proporcionar acciones útiles en las notificaciones

---

## Próximas Funcionalidades

1. **Reglas Contextuales**: Reglas que se aplican solo en ciertos contextos
2. **Reglas Asíncronas**: Para validaciones que requieren llamadas externas
3. **Editor de Reglas**: Interfaz visual para crear/editar reglas
4. **Reglas Dinámicas**: Basadas en configuración externa o usuario
5. **Métricas de Validación**: Seguimiento de violaciones más comunes
