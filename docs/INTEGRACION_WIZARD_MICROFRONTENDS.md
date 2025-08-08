# Integración Wizard y Microfrontends: Plan y Estrategia

## Objetivo
Sincronizar la navegación del wizard del simulador de flujo con los microfrontends (web components), permitiendo que:
- El microfrontend avance el wizard al hacer clic en su botón principal (ej. "Iniciar").
- Se pasen variables de entrada y salida entre el wizard y el microfrontend en cada paso.
- El wizard mantenga el control del flujo, el estado y la visualización de variables.

---

## Estrategia General

### 1. Comunicación de Entrada
- El wizard pasa las variables de entrada al microfrontend como atributos HTML o propiedades del custom element.
- Estas variables pueden ser simples (string, number) o complejas (JSON serializado).
- El wizard determina qué variables enviar según el paso actual y el flujo de nodos.

### 2. Comunicación de Salida y Navegación
- El microfrontend, al completar su acción principal (ej. clic en "Iniciar"), emite un evento personalizado (por ejemplo, `next-step`).
- El evento incluye en `event.detail` las variables de salida generadas o modificadas por el microfrontend.
- El wizard escucha este evento, recupera las variables de salida, las almacena en su estado y avanza al siguiente paso del flujo (`nextWizardStep()`).

### 3. Sincronización del Flujo
- El wizard es el "orquestador" del flujo: sabe cuántos pasos hay, qué microfrontend cargar en cada uno y qué variables pasar.
- El microfrontend es agnóstico del flujo: solo recibe variables de entrada y emite variables de salida.
- El panel de variables a la derecha siempre refleja el estado actualizado, ya que el wizard es el único responsable de la gestión de datos.

---

## Detalle de Implementación

### A. Wizard (Vue)
1. **Renderizar el microfrontend** usando un custom element, pasando las variables de entrada como atributos/props.
2. **Escuchar el evento personalizado** (`next-step`) en el contenedor del microfrontend.
3. **Al recibir el evento:**
   - Recuperar las variables de salida de `event.detail`.
   - Actualizar el estado del wizard y el panel de variables.
   - Ejecutar `nextWizardStep()` para avanzar el flujo.

### B. Microfrontend (Web Component)
1. **Recibir variables de entrada** como atributos o propiedades.
2. **Emitir el evento personalizado** (`next-step`) con las variables de salida en `event.detail` al hacer clic en el botón principal.
   - Ejemplo: `this.dispatchEvent(new CustomEvent('next-step', { detail: { ...outputVariables }, bubbles: true, composed: true }));`
3. **(Opcional)**: Validar datos antes de emitir el evento.

### C. Variables
- **Entrada**: El wizard determina y pasa las variables necesarias para el microfrontend en cada paso.
- **Salida**: El microfrontend emite solo las variables relevantes para el siguiente paso o para el flujo global.
- **Panel de variables**: Siempre actualizado por el wizard tras cada evento recibido.

---

## Ejemplo de Flujo
1. El wizard carga el microfrontend A y le pasa `{ userId, sessionId }`.
2. El usuario interactúa y hace clic en "Iniciar" en el microfrontend A.
3. El microfrontend A emite `next-step` con `{ nombre, email }` en `event.detail`.
4. El wizard recibe el evento, actualiza su estado y el panel de variables, y carga el microfrontend B con las variables necesarias.

---

## Ventajas de la Estrategia
- Desacoplamiento: El microfrontend no necesita conocer el flujo global.
- Escalabilidad: Permite agregar, quitar o reordenar pasos fácilmente.
- Mantenibilidad: El wizard centraliza la lógica de flujo y datos.
- Flexibilidad: Permite validaciones, transformaciones y lógica adicional en el wizard.

---

## Siguientes pasos sugeridos
1. Implementar la emisión del evento en el microfrontend.
2. Implementar la escucha y manejo del evento en el wizard.
3. Probar el flujo con variables de entrada y salida.
4. Ajustar el panel de variables para reflejar los cambios en tiempo real.
5. Documentar el contrato de variables esperado para cada microfrontend.

---

¡Gracias por la confianza! Si necesitas ejemplos de código para cada parte, avísame y los generamos juntos.
