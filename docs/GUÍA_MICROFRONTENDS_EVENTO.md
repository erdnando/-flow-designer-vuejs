# Guía para Integrar Microfrontends con el Wizard del Simulador de Flujos

## Objetivo
Permitir que cada microfrontend (web component) pueda:
- Recibir variables de entrada desde el wizard.
- Emitir un evento personalizado (`next-step`) con variables de salida cuando el usuario complete la acción principal (ej. clic en "Iniciar").
- Sincronizar la navegación del wizard con la interacción del usuario en el microfrontend.

---

## 1. Recepción de Variables de Entrada
- El wizard pasará variables de entrada como atributos HTML o propiedades del custom element.
- Ejemplo en HTML:
  ```html
  <landing-web-component user-id="123" session-id="abc" datos='{ "foo": "bar" }'></landing-web-component>
  ```
- En el microfrontend, puedes acceder a estos valores usando:
  - `this.getAttribute('user-id')` para atributos simples.
  - `JSON.parse(this.getAttribute('datos'))` para objetos serializados.
- Si usas frameworks (React, Vue, etc. dentro del web component), puedes mapear atributos a props.

---

## 2. Emisión del Evento `next-step`
- Cuando el usuario haga clic en el botón principal (ej. "Iniciar"), el microfrontend debe emitir un evento personalizado llamado `next-step`.
- El evento debe incluir en `event.detail` las variables de salida que el wizard debe capturar.
- Ejemplo en JavaScript:
  ```js
  // Dentro del microfrontend, al hacer clic en el botón principal
  const outputVariables = {
    nombre: 'Juan',
    email: 'juan@ejemplo.com',
    // ...otras variables de salida
  };
  this.dispatchEvent(new CustomEvent('next-step', {
    detail: outputVariables,
    bubbles: true,
    composed: true
  }));
  ```
- Es importante usar `bubbles: true` y `composed: true` para que el evento sea capturado por el contenedor Vue.

---

## 3. Recuperación de Variables de Salida
- El wizard escuchará el evento `next-step` y tomará las variables de salida de `event.detail`.
- No es necesario que el microfrontend conozca la estructura del flujo ni el siguiente paso, solo debe emitir sus datos.

---

## 4. Buenas Prácticas
- Documenta claramente qué variables de entrada espera y qué variables de salida emite cada microfrontend.
- Valida los datos antes de emitir el evento.
- Si necesitas enviar objetos complejos, serialízalos a JSON.
- Si el microfrontend necesita notificar errores o estados especiales, puede emitir otros eventos personalizados (ej. `validation-error`).

---

## Ejemplo Resumido
```js
// Al inicializar el componente
connectedCallback() {
  const userId = this.getAttribute('user-id');
  const datos = JSON.parse(this.getAttribute('datos') || '{}');
  // ...usar variables de entrada
}

// Al hacer clic en el botón principal
handleClick() {
  const output = { nombre: 'Juan', email: 'juan@ejemplo.com' };
  this.dispatchEvent(new CustomEvent('next-step', {
    detail: output,
    bubbles: true,
    composed: true
  }));
}
```

---

## Resumen
- Recibe variables de entrada como atributos/props.
- Emite el evento `next-step` con las variables de salida en `event.detail`.
- El wizard se encarga del resto del flujo.

Cualquier duda sobre la integración, consulta al equipo del wizard.
