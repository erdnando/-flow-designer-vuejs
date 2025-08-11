# Ajustes Requeridos en el Componente `ExternalComponentView.vue`

Actualmente el micro-frontend ya no carga tras mover la lógica de selector de dispositivo al padre. Para que el SFC Vue se compile y funcione correctamente, el equipo de micro-frontend debe aplicar estos cambios:

---

## 1. Reordenar el SFC para seguir la sintaxis de Vue

- **Problema**: El `<template>` está definido *después* del `<script setup>`, lo cual invalida el archivo como Single File Component.
- **Solución**: Mover TODO el bloque `<template>…</template>` para que quede *antes* de la etiqueta `<script setup lang="ts">`.

```diff
*** Antes
<script setup lang="ts">
  // …script code…
</script>
<template>
  <!-- markup -->
</template>

*** Después
<template>
  <!-- markup -->
</template>
<script setup lang="ts">
  // …script code…
</script>
```

---

## 2. Eliminar la lógica interna de dropdown y presets

- Quitar cualquier referencia a:
  - `devicePresets`
  - `selectedDevice`
  - `matchMedia` override
  - `<select>` interno en el template

Todo esto ahora se gestiona desde el componente padre (`FlowCanvas.vue`).

---

## 3. Añadir prop `device` y `computed` para estilos

En la sección `<script setup lang="ts">`, asegúrate de:

1. Importar `computed`:
   ```ts
   import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
   ```
2. Definir la prop:
   ```ts
   const props = defineProps<{
     wizardStep: { componentData?: { customTypeId?: string; componentVersion?: string } };
     zoomLevel?: number;
     device?: { label: string; width: number; height: number };
   }>();
   ```
3. Crear un `computed` para el estilo de contenedor:
   ```ts
   const deviceStyle = computed(() => {
     if (props.device) {
       return {
         width:  `${props.device.width}px`,  
         height: `${props.device.height}px`
       };
     }
     return {};
   });
   ```

---

## 4. Aplicar `deviceStyle` al contenedor raíz

En tu `<template>`, la envoltura principal debe usar:

```vue
<template>
  <div class="external-component-container" :style="[deviceStyle, { overflowY: 'auto' }]">
    <!-- resto del markup -->
  </div>
</template>
```

Con esto, el contenedor del micro-frontend recibirá el ancho y alto desde la prop pasada por el wizard y se ajustará automáticamente.

---

## 5. Verificación final

1. El SFC debe compilar sin errores de parseo (template antes del script).  
2. No debe haber referencias a `devicePresets` ni `<select>` en `ExternalComponentView.vue`.  
3. La prop `device` debe venir correctamente del padre (`FlowCanvas.vue`).  
4. En tiempo de ejecución, inspecciona el elemento `.external-component-container` para confirmar que su `width` y `height` se correspondan con el dispositivo elegido.

---

Con estos cambios, el componente volverá a cargar y respetará la resolución simulada por el wizard sin necesidad de iframes ni hacks adicionales.
