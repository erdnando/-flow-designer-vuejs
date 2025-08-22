# 📐 Ajustes de Dimensiones para Iframe - Bradescard Integration (v2)

## 🎯 **Problema Resuelto**

**Antes**: Iframe cortaba la aplicación React en la parte inferior
**Después**: Iframe muestra la aplicación React completa con altura optimizada

---

## ⚙️ **Cambios Realizados (Versión Final)**

### **1. Dimensiones del Device Aumentadas**

**Archivo**: `src/components/FlowCanvas.vue`

```javascript
const defaultDevice = {
    label: 'Responsive',
    width: 430,
    height: 1300  // ✅ Altura final optimizada
};
```

### **2. CSS Completamente Optimizado**

**Archivo**: `src/components/IframeMicrofrontendView.vue`

```css
/* Container principal - Flexible y adaptable */
.iframe-microfrontend-container {
    justify-content: flex-start;  /* Alineación superior */
    overflow: visible;            /* Sin restricciones */
    min-height: 600px;           /* Altura mínima generosa */
}

/* Container del iframe - Sin cortes */
.iframe-container {
    overflow: visible;  /* Permitir contenido completo */
}

/* Iframe - Con scroll interno si necesario */
.microfrontend-iframe {
    overflow: auto;          /* Scroll interno si es necesario */
    min-height: 100%;        /* Altura mínima garantizada */
}
```

### **3. Media Queries Responsivos**

```css
/* Para pantallas medianas */
@media (max-height: 1400px) {
    .iframe-microfrontend-container {
        justify-content: flex-start;
        padding-top: 10px;
    }
}

/* Para pantallas pequeñas - fallback con scroll */
@media (max-height: 800px) {
    .iframe-microfrontend-container {
        overflow-y: auto;
    }
}
```

---

## 📊 **Especificaciones Técnicas Finales**

| Propiedad | Valor | Función |
|-----------|-------|---------|
| **Ancho** | 430px | Mantiene diseño móvil |
| **Alto** | 1300px | ✅ Altura completa para Bradescard |
| **Min-Height iframe** | 1300px | Garantiza espacio mínimo |
| **Container overflow** | `visible` | No corta contenido |
| **Iframe overflow** | `auto` | Scroll interno si necesario |
| **Justification** | `flex-start` | Alineación superior |

---

## 🎨 **Resultado Esperado**

✅ **Aplicación React completamente visible**
✅ **Sin cortes en la parte inferior**  
✅ **Scroll interno solo si es absolutamente necesario**
✅ **Responsive para diferentes tamaños de pantalla**
✅ **Centrado y bien presentado**

---

## 🔄 **Alternativas Implementadas**

### **Opción 1: Altura Fija Optimizada (Actual)**
- Altura: 1300px
- Mejor para la mayoría de casos
- Sin scroll interno

### **Opción 2: Altura Dinámica (Fallback)**
- Media queries para diferentes pantallas
- Scroll habilitado en pantallas pequeñas
- Adaptable automáticamente

### **Opción 3: Height Auto (Si se requiere más)**
```javascript
// Si aún necesitas más flexibilidad:
const containerStyle = computed(() => ({
    width: `${deviceWidth}px`,
    height: 'auto',  // Altura automática
    minHeight: `${deviceHeight}px`,
    // ... resto de propiedades
}))
```

---

## 🔄 **Rollback (si es necesario)**

Si por alguna razón necesitas volver a las dimensiones originales:

```javascript
// En FlowCanvas.vue
const defaultDevice = {
    label: 'Responsive',
    width: 430,
    height: 932
};
```

```css
/* En IframeMicrofrontendView.vue */
.iframe-container {
    overflow: hidden;
}
.iframe-microfrontend-container {
    overflow: hidden;
}
```
