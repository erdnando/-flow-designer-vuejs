# Lecciones Aprendidas: Integración de Microfrontends React como Web Components en Vue Wizard

## Problemáticas Encontradas

### 1. Propagación de eventos entre microfrontend y host Vue
- **Problema:** El evento `next-step` emitido desde el microfrontend React no era capturado por el wizard Vue.
- **Causa:** El evento se emitía sobre un nodo incorrecto o sin las opciones `bubbles: true, composed: true`.
- **Solución:**
  - Emitir el evento sobre el nodo real del custom element (`document.querySelector('landing-web-component')`).
  - Asegurarse de usar `bubbles: true, composed: true` en el `CustomEvent`.

### 2. El wizard no avanzaba visualmente aunque el evento era recibido
- **Problema:** El log mostraba que el paso avanzaba internamente, pero la UI no se actualizaba.
- **Causa:** Vue no remonta el componente hijo si no cambia la key del `<component>`, por lo que el microfrontend no se reinicializaba.
- **Solución:**
  - Agregar `:key="wizardSteps[currentWizardStep].id"` al `<component ... />` para forzar el remount y la actualización visual.

### 3. Error de DOM al desmontar el microfrontend
- **Problema:** Error `NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.`
- **Causa:** Al forzar el remount, Vue desmonta el componente y el código intentaba remover un nodo que ya no era hijo del padre.
- **Solución:**
  - Antes de llamar a `removeChild`, verificar que el nodo tenga `parentNode`.
  - Usar: `if (componentInstance.value.parentNode) { componentInstance.value.parentNode.removeChild(componentInstance.value); }`

### 4. Problemas de altura y desbordamiento en el microfrontend
- **Problema:** El microfrontend usaba `100vh` y se desbordaba del contenedor del wizard.
- **Solución:**
  - Inyectar CSS y usar MutationObserver para forzar alturas relativas al contenedor y evitar el uso de `100vh`.
  - Interceptar `getComputedStyle` para reemplazar valores de `100vh` por el alto disponible.

## Buenas Prácticas y Recomendaciones

- Usar siempre eventos personalizados con `bubbles: true, composed: true` para comunicación entre Web Components y el host.
- Forzar el remount de componentes dinámicos en Vue usando `:key` única por paso.
- Validar la existencia de `parentNode` antes de manipular el DOM manualmente.
- Inyectar CSS y usar observadores para controlar el layout de microfrontends de terceros.
- Mantener logs detallados para depuración de eventos y flujos de navegación.

## Resumen

La integración exitosa de microfrontends React como Web Components en un wizard Vue requiere atención especial a la propagación de eventos, la reactividad de Vue, el manejo seguro del DOM y la contención visual de los componentes externos. Las soluciones aplicadas permiten una arquitectura robusta, escalable y fácil de depurar para futuros microfrontends.
