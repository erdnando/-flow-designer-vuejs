# Instrucciones para implementar CSS Container Queries en el Micro-Frontend

Este documento describe cómo migrar las media queries basadas en `window` (viewport) a Container Queries, para que el micro-frontend se adapte correctamente al ancho de su contenedor padre (por ejemplo, 430 px para iPhone 14 Pro Max), sin necesidad de iframes o hacks de `matchMedia`.

---

## 1. ¿Qué son las CSS Container Queries?

Las Container Queries permiten aplicar estilos CSS en función de las dimensiones del elemento contenedor (no del viewport global). De este modo, el componente puede «sentir» el ancho/alto de su wrapper y reorientar su layout (p. ej. switch a diseño móvil) sin importar el tamaño de la ventana del navegador.

## 2. Requisitos

1. El wrapper HTML que contiene al micro-frontend debe estar bajo control de CSS para definirlo como contenedor.  
2. El micro-frontend debe exponer o compilar sus estilos CSS con reglas `@container`.  
3. Para soporte en navegadores sin Container Queries nativas, considerar un polyfill o plugin PostCSS.

## 3. Pasos de implementación

### 3.1. Definir el contenedor

En el elemento padre que envuelve tu custom element (p. ej. `.external-component-container`):

```css
.external-component-container {
  /* 1) Activar container queries en su dimensión horizontal */
  container-type: inline-size;
  container-name: viewport;

  /* Opcional: asegurar overflow y box sizing */
  display: block;
  overflow: hidden;
  box-sizing: border-box;
}
```

> **Nota:** `inline-size` usa la dimensión horizontal del contenedor. Si necesitas reaccionar a la altura, usa `container-type: size;`.

### 3.2. Migrar media queries a container queries

Reemplaza las reglas basadas en `@media (max-width: XXXpx)` por:

```css
/* Antes (global viewport) */
@media (max-width: 430px) {
  .grid-item { width: 50%; }
}

/* Después (container query) */
@container viewport (max-width: 430px) {
  .grid-item { width: 50%; }
}
```

De esta forma, cuando el ancho de `.external-component-container` caiga por debajo de 430 px, tus estilos móviles se aplicarán.

### 3.3. Compatibilidad y polyfills

- **Polyfill oficial (en desuso):**  
  `npm install cqfill && import 'cqfill';`  
  En tu bundle principal.

- **PostCSS plugin:**  
  Agregar en `postcss.config.js`:  
  ```js
  module.exports = {
    plugins: {
      'postcss-container-query': {}
    }
  }
  ```
  Esto transpila `@container` a CSS compatible.

- **Can I Use**: https://caniuse.com/css-container-queries

## 4. Ejemplo completo

```html
<!-- index.html o template principal -->
<div class="external-component-container">
  <landing-web-component></landing-web-component>
</div>
```

```css
.external-component-container {
  container-type: inline-size;
  container-name: viewport;
  width: 430px;    /* simula iPhone 14 Pro Max */
  height: 932px;
  overflow: auto;
}

/* Layout desktop por defecto */
.landing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

/* Layout móvil cuando el contenedor ≤430px */
@container viewport (max-width: 430px) {
  .landing-grid {
    grid-template-columns: 1fr;
    grid-gap: 12px;
  }
  .cta-button {
    font-size: 1.1rem;
  }
}
```

## 5. Validación y pruebas

1. Levanta tu aplicación y desde devtools ajusta manualmente el ancho del contenedor (no el viewport) para verificar los `@container`.  
2. Incluye tests visuales (Storybook con controles de contenedor).  
3. En CI/CD, usa herramientas como Percy para snapshot testing en distintos anchos de contenedor.

## 6. Referencias

- MDN: https://developer.mozilla.org/docs/Web/CSS/CSS_Container_Queries  
- Especificación CSS Container Queries: https://www.w3.org/TR/css-contain-3/

---

Con estos pasos, el micro-frontend adoptará automáticamente el layout móvil/destkop según el tamaño de su contenedor, permitiendo integrar dentro de cualquier wrapper (p. ej. simulador) sin hacks de viewport.
