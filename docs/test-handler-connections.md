# Pruebas - Regla de Conexiones de Handlers

## Descripción de la Regla
**ID**: `valid-handler-connections`
**Nombre**: Conexiones válidas de handlers
**Descripción**: Los handlers de salida solo pueden conectarse a handlers de entrada. Cada nodo tiene límites específicos de conexiones.

## Límites por Tipo de Nodo

### Nodo START
- **Entrada**: 0 conexiones (no puede recibir conexiones)
- **Salida**: 1 conexión máximo
- **Propósito**: Punto de inicio del flujo

### Nodo END
- **Entrada**: 1 conexión máximo
- **Salida**: 0 conexiones (no puede enviar conexiones)
- **Propósito**: Punto final del flujo

### Nodo CONDITION (IF)
- **Entrada**: 1 conexión máximo
- **Salida**: 2 conexiones máximo (true/false branches)
- **Propósito**: Nodo de decisión con dos caminos posibles

### Nodos Regulares (Action, Process, etc.)
- **Entrada**: 1 conexión máximo
- **Salida**: 1 conexión máximo
- **Propósito**: Nodos de procesamiento estándar

## Reglas de Validación Específicas - ACTUALIZADAS

### Handler de Salida → Handler de Entrada

#### ✅ Conexiones Válidas:
1. **START → Webhook**: ✅ (salida válida → entrada válida)
2. **Webhook → END**: ✅ (salida válida → entrada válida)  
3. **Condition → Action**: ✅ (salida válida → entrada válida)
4. **Action → Condition**: ✅ (salida válida → entrada válida)

#### ❌ Conexiones Inválidas:

1. **Cualquier nodo → START**: ❌
   ```
   Webhook → START
   ```
   - **Error**: "El nodo START (START) no puede recibir conexiones de entrada"
   - **Razón**: START solo tiene handler de salida

2. **END → Cualquier nodo**: ❌
   ```
   END → Webhook
   ```
   - **Error**: "El nodo END (END) no puede enviar conexiones de salida"
   - **Razón**: END solo tiene handler de entrada

3. **Auto-conexión**: ❌
   ```
   Action → Action (mismo nodo)
   ```
   - **Error**: "El nodo Action no puede conectarse a sí mismo"
   - **Razón**: Violación de handler salida → entrada diferente

### Validaciones Mejoradas

La regla ahora valida específicamente:

1. **Capacidad de envío**: ¿Puede el nodo fuente enviar conexiones?
2. **Capacidad de recepción**: ¿Puede el nodo destino recibir conexiones?
3. **Handler específico**: Salida → Entrada únicamente
4. **Límites de conexiones**: Cantidad máxima según tipo de nodo

### ❌ Casos Inválidos

#### 1. START con Entrada
```
Action → START → END
```
- **Error**: START no puede recibir conexiones de entrada
- **Mensaje**: "El nodo START tiene 1 conexiones de entrada, pero el máximo permitido es 0"

#### 2. END con Salida
```
START → END → Action
```
- **Error**: END no puede enviar conexiones de salida
- **Mensaje**: "El nodo END tiene 1 conexiones de salida, pero el máximo permitido es 0"

#### 3. Nodo Regular con Múltiples Entradas
```
START → Action1 ↘
                  Action3 → END
START2 → Action2 ↗
```
- **Error**: Action3 tiene múltiples entradas
- **Mensaje**: "El nodo Action3 tiene 2 conexiones de entrada, pero el máximo permitido es 1"

#### 4. Nodo Regular con Múltiples Salidas
```
START → Action → Action1
              ↘ Action2
```
- **Error**: Action tiene múltiples salidas (no es tipo condition)
- **Mensaje**: "El nodo Action tiene 2 conexiones de salida, pero el máximo permitido es 1"

#### 5. Condition con Más de 2 Salidas
```
START → Condition → Action1
                 ↘ Action2
                 ↘ Action3
```
- **Error**: Condition tiene más de 2 salidas
- **Mensaje**: "El nodo Condition tiene 3 conexiones de salida, pero el máximo permitido es 2"

#### 6. Auto-conexión
```
Action → Action (mismo nodo)
```
- **Error**: Nodo conectado a sí mismo
- **Mensaje**: "El nodo Action no puede conectarse a sí mismo"

## Problemas Identificados en la Imagen

Según la imagen proporcionada, se observan los siguientes casos problemáticos:

1. **Conexiones múltiples no válidas**: Varios nodos parecen tener más conexiones de las permitidas
2. **Posibles auto-conexiones o ciclos cortos**: Las líneas azules punteadas sugieren conexiones que formarían ciclos
3. **Handler de salida conectando incorrectamente**: Conexiones que no respetan la regla entrada-salida

## Integración con el Sistema

La regla se integra automáticamente con:
- **Validación en tiempo real** durante la creación de conexiones
- **Sistema de notificaciones** para mostrar errores al usuario
- **Validación completa del flujo** antes de guardado/ejecución

## Mensajes de Error Específicos

La regla proporciona mensajes detallados que incluyen:
- Nombre del nodo problemático
- Número actual vs. máximo permitido de conexiones
- Tipo de conexión (entrada/salida) que causa el problema
- IDs de nodos y edges afectados para highlighting visual
