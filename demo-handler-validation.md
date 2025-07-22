# Demo - Regla de Handlers: Casos de la Imagen

## Análisis de la Imagen Proporcionada

Según la imagen, se observan las siguientes conexiones problemáticas que la nueva regla debería detectar:

### Problemas Identificados:

#### 1. Conexiones Múltiples Incorrectas
- **Webhook Node**: Parece tener múltiples conexiones de entrada y salida
- **Condición (IF)**: Puede tener conexiones válidas (2 salidas) pero necesita validarse

#### 2. Posibles Violaciones de Handler
- **Líneas azules punteadas**: Indican conexiones que pueden estar violando las reglas
- **Conexiones rojas**: Muestran flujo que puede no respetar entrada→salida

### Prueba en Vivo

Para probar la nueva regla:

1. **Abre el navegador** en `http://localhost:5173/`
2. **Crea los siguientes nodos**:
   - 1 nodo START
   - 1 nodo CONDITION (IF) 
   - 1 nodo Webhook
   - 1 nodo END

3. **Intenta estas conexiones inválidas**:
   
   a) **START con entrada**:
   ```
   Webhook → START
   ```
   - Esperado: ❌ Error "El nodo START tiene 1 conexiones de entrada, pero el máximo permitido es 0"

   b) **END con salida**:
   ```
   END → Webhook
   ```
   - Esperado: ❌ Error "El nodo END tiene 1 conexiones de salida, pero el máximo permitido es 0"

   c) **Nodo regular con múltiples salidas**:
   ```
   Webhook → START
   Webhook → Condition
   ```
   - Esperado: ❌ Error "El nodo Webhook tiene 2 conexiones de salida, pero el máximo permitido es 1"

   d) **Nodo con múltiples entradas**:
   ```
   START → Webhook
   Condition → Webhook
   ```
   - Esperado: ❌ Error "El nodo Webhook tiene 2 conexiones de entrada, pero el máximo permitido es 1"

4. **Conexiones válidas**:
   ```
   START → Condition → Webhook → END
             ↘ END
   ```
   - Esperado: ✅ Todas las conexiones válidas

### Mensajes Esperados

La regla proporcionará mensajes específicos como:
- "El nodo 'START' tiene X conexiones de entrada, pero el máximo permitido es 0"
- "El nodo 'Webhook' tiene X conexiones de salida, pero el máximo permitido es 1"
- "El nodo 'Condition' tiene X conexiones de salida, pero el máximo permitido es 2"

### Integración Visual

- **Notificaciones**: Aparecen en la esquina superior derecha
- **Highlighting**: Nodos y edges problemáticos se resaltan
- **Prevención**: No se permiten conexiones que violen las reglas
- **Feedback inmediato**: El usuario ve el error tan pronto intenta hacer la conexión

## Notas Técnicas

La regla funciona durante:
1. **onConnect()**: Validación en tiempo real al crear conexiones
2. **Validación completa**: Al validar todo el flujo
3. **Guardado**: Antes de permitir guardar el flujo

Tipos de nodo reconocidos:
- `start`: Nodo de inicio
- `end`: Nodo final  
- `condition`: Nodo IF/decisión
- Cualquier otro: Nodo regular (action, webhook, etc.)
