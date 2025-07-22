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

### 3. **No Circular Connections** (`no-circular-connections`)
- **Propósito**: Previene conexiones que formen ciclos infinitos
- **Categoría**: `connection`
- **Severidad**: `error`
- **Algoritmo**: DFS (Depth-First Search) para detección de ciclos

### Reglas Futuras (Ejemplos):
```typescript
// Ejemplo de regla de propiedades obligatorias
const requiredPropertiesRule: ValidationRule = {
    id: 'required-properties',
    name: 'Propiedades obligatorias',
    description: 'Ciertos tipos de nodos requieren propiedades específicas',
    category: 'node',
    enabled: true,
    validate: (nodes: Node[]) => {
        // Lógica para verificar propiedades requeridas
        // ...
    }
};

// Ejemplo de regla de flujo conectado
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

### Regla Implementada: No Circular Connections

```typescript
// Regla real implementada en el sistema
const noCircularConnectionsRule: ValidationRule = {
    id: 'no-circular-connections',
    name: 'Sin conexiones circulares',
    description: 'No se permiten conexiones que formen ciclos infinitos en el flujo',
    severity: 'error',
    category: 'connection',
    validate: (nodes: Node[], edges: Edge[] = []): ValidationResult => {
        if (edges.length === 0) {
            return {
                isValid: true,
                severity: 'error',
                ruleId: 'no-circular-connections'
            };
        }
        
        const cycleResult = hasCycle(nodes, edges);
        
        if (cycleResult.hasCycle) {
            const cycleNodeNames = cycleResult.cycleNodes
                .map(nodeId => {
                    const node = nodes.find(n => n.id === nodeId);
                    return node?.data?.label || nodeId;
                })
                .join(' → ');
            
            return {
                isValid: false,
                message: `Se detectó una conexión circular: ${cycleNodeNames}. Las conexiones circulares pueden causar bucles infinitos.`,
                severity: 'error',
                ruleId: 'no-circular-connections',
                affectedNodes: cycleResult.cycleNodes,
                affectedEdges: cycleResult.cycleEdges
            };
        }
        
        return {
            isValid: true,
            severity: 'error',
            ruleId: 'no-circular-connections'
        };
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

### Ejemplo de Regla de Conexión - Implementada
```typescript
const noCircularConnectionsRule: ValidationRule = {
    id: 'no-circular-connections',
    name: 'Sin conexiones circulares',
    description: 'No se permiten conexiones que formen ciclos infinitos en el flujo',
    category: 'connection',
    severity: 'error',
    validate: (nodes: Node[], edges: Edge[] = []): ValidationResult => {
        // Usar función auxiliar para detectar ciclos
        const cycleResult = hasCycle(nodes, edges);
        
        if (cycleResult.hasCycle) {
            return {
                isValid: false,
                message: `Se detectó conexión circular en: ${cycleResult.cycleNodes.join(' → ')}`,
                severity: 'error',
                ruleId: 'no-circular-connections',
                affectedNodes: cycleResult.cycleNodes,
                affectedEdges: cycleResult.cycleEdges
            };
        }
        
        return { isValid: true, ruleId: 'no-circular-connections', severity: 'error' };
    }
};
```

### Algoritmo de Detección de Ciclos
```typescript
function hasCycle(nodes: Node[], edges: Edge[]): { 
    hasCycle: boolean; 
    cycleNodes: string[]; 
    cycleEdges: string[] 
} {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    // Construir grafo de adyacencia
    const adjacencyMap = new Map<string, { nodeId: string; edgeId: string }[]>();
    nodes.forEach(node => adjacencyMap.set(node.id, []));
    edges.forEach(edge => {
        if (adjacencyMap.has(edge.source)) {
            adjacencyMap.get(edge.source)!.push({
                nodeId: edge.target,
                edgeId: edge.id
            });
        }
    });
    
    // DFS para detectar ciclos
    function dfs(nodeId: string, path: string[]): boolean {
        if (recursionStack.has(nodeId)) {
            // Ciclo detectado - extraer nodos y aristas del ciclo
            return true;
        }
        
        if (visited.has(nodeId)) return false;
        
        visited.add(nodeId);
        recursionStack.add(nodeId);
        
        const neighbors = adjacencyMap.get(nodeId) || [];
        for (const neighbor of neighbors) {
            if (dfs(neighbor.nodeId, [...path, nodeId])) {
                return true;
            }
        }
        
        recursionStack.delete(nodeId);
        return false;
    }
    
    // Verificar cada nodo como punto de inicio
    for (const node of nodes) {
        if (!visited.has(node.id)) {
            if (dfs(node.id, [])) {
                return { hasCycle: true, cycleNodes: [...], cycleEdges: [...] };
            }
        }
    }
    
    return { hasCycle: false, cycleNodes: [], cycleEdges: [] };
}
```

### Casos de Uso Validados
1. **Ciclo simple**: A → B → A ❌
2. **Ciclo complejo**: A → B → C → A ❌  
3. **Auto-referencia**: A → A ❌
4. **Flujo lineal**: A → B → C ✅
5. **Flujo ramificado**: A → B, A → C ✅

## 4. Regla de Conexiones de Handlers - IMPLEMENTADA

### Descripción
Valida que los nodos respeten los límites de conexiones de entrada y salida según su tipo.

### Límites por Tipo de Nodo
- **START**: 0 entradas, 1 salida máxima
- **END**: 1 entrada máxima, 0 salidas  
- **CONDITION (IF)**: 1 entrada, 2 salidas máximas (true/false)
- **Otros nodos**: 1 entrada, 1 salida máximas

### Implementación
```typescript
const validHandlerConnectionsRule: ValidationRule = {
    id: 'valid-handler-connections',
    name: 'Conexiones válidas de handlers',
    description: 'Los handlers de salida solo pueden conectarse a handlers de entrada. Cada nodo tiene límites específicos de conexiones.',
    category: 'connection',
    severity: 'error',
    validate: (nodes: Node[], edges: Edge[] = []): ValidationResult => {
        // Definir límites por tipo de nodo
        const getNodeLimits = (nodeType: string) => {
            switch (nodeType) {
                case 'start': return { maxIncoming: 0, maxOutgoing: 1 };
                case 'end': return { maxIncoming: 1, maxOutgoing: 0 };
                case 'condition': return { maxIncoming: 1, maxOutgoing: 2 };
                default: return { maxIncoming: 1, maxOutgoing: 1 };
            }
        };
        
        // Validar límites para cada nodo...
        // [Implementación completa en nodeValidationRules.ts]
    }
};
```

### Casos Validados
1. **START con entrada**: START ← Action ❌
2. **END con salida**: END → Action ❌  
3. **Nodo regular múltiples entradas**: Action1 → Target, Action2 → Target ❌
4. **Nodo regular múltiples salidas**: Action → Target1, Action → Target2 ❌
5. **Condition con >2 salidas**: IF → T1, IF → T2, IF → T3 ❌
6. **Auto-conexión**: Node → Node ❌
7. **Flujo válido**: START → IF → Action1, IF → Action2, Action1 → END ✅

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
