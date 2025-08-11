# Instrucciones Técnicas: Corrección de Simulación de Dispositivos en Microfrontends

## Problema Identificado

Los microfrontends no están respetando las dimensiones específicas de los dispositivos seleccionados en el simulador de flujo. El contenido se renderiza con limitaciones de ancho que impiden que se aproveche completamente el espacio asignado por el contenedor padre.

### Diagnóstico Técnico

**Ubicación del problema:** Shadow DOM del Web Component
**Elemento afectado:** `div` con clase `app` 
**Estilos problemáticos detectados:**
```css
.app {
  width: 100%;
  max-width: min(100vw, 1024px); /* ← ESTE ES EL PROBLEMA */
  /* ... otros estilos ... */
}
```

## Contexto del Sistema de Simulación

El sistema de simulación de dispositivos funciona de la siguiente manera:

1. **Flow Designer** renderiza un contenedor con dimensiones específicas según el dispositivo seleccionado
2. **Dispositivos soportados:**
   - iPhone 14 Pro Max: `430px × 932px`
   - iPhone 12 Pro: `390px × 844px`
   - iPad: `768px × 1024px`
3. **El Web Component se monta dentro de este contenedor** con restricciones de tamaño
4. **El contenido del microfrontend debe adaptarse** a estas dimensiones exactas

## Instrucciones de Corrección

### 1. Identificar Estilos Problemáticos

Buscar en los archivos CSS del microfrontend los siguientes patrones:

```css
/* Patrones que causan problemas */
max-width: 1024px;
max-width: min(100vw, 1024px);
max-width: min(100%, 1024px);
width: 1024px;
```

**Archivos típicos donde buscar:**
- `src/styles/app.css`
- `src/styles/globals.css`
- `src/components/App/App.module.css`
- Cualquier archivo que contenga estilos para el contenedor principal

### 2. Aplicar Correcciones

#### Opción A: Eliminación Completa (Recomendada)
```css
/* ANTES */
.app {
  width: 100%;
  max-width: min(100vw, 1024px);
  height: 100%;
  /* ... */
}

/* DESPUÉS */
.app {
  width: 100%;
  /* max-width: ELIMINADO */
  height: 100%;
  /* ... */
}
```

#### Opción B: Modificación Condicional
```css
/* Para casos donde se necesite max-width en otros contextos */
.app {
  width: 100%;
  max-width: 100%; /* En lugar de 1024px */
  height: 100%;
  /* ... */
}
```

### 3. Verificar Contenedores Anidados

Asegurar que contenedores internos también respeten las dimensiones:

```css
/* Verificar que estos elementos no tengan restricciones */
.main-container,
.content-wrapper,
.page-container {
  width: 100%;
  max-width: none; /* o 100% */
  height: 100%;
  box-sizing: border-box;
}
```

### 4. Estilos Responsivos Recomendados

Implementar estilos que se adapten al contenedor padre:

```css
.app {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  overflow: auto; /* Para contenido que exceda las dimensiones */
}

/* Para contenido scrolleable si es necesario */
.content-area {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
```

## Validación de la Corrección

### 1. Pruebas Locales
- Abrir el microfrontend en `http://localhost:3001/`
- Verificar que se adapte correctamente a diferentes tamaños de ventana
- No debe tener limitaciones de ancho fijas

### 2. Pruebas de Integración
- Ejecutar el Flow Designer
- Crear un flujo que incluya el microfrontend
- Ejecutar el test del flujo
- Cambiar entre diferentes dispositivos en el selector
- **Resultado esperado:** El contenido debe cambiar de tamaño según el dispositivo seleccionado

### 3. Inspección de Elementos
```
Verificar en DevTools que:
1. El web component tiene las dimensiones correctas (ej: 430×932px para iPhone 14 Pro Max)
2. El contenido interno (.app) no tiene max-width limitantes
3. El contenido se extiende hasta los bordes del contenedor
```

## Código de Referencia del Contenedor Padre

El Flow Designer está configurando el contenedor de la siguiente manera:

```typescript
const containerStyle = computed(() => {
  if (!props.device) return {}
  
  return {
    width: `${props.device.width}px`,
    height: `${props.device.height}px`,
    maxWidth: `${props.device.width}px`,
    maxHeight: `${props.device.height}px`,
    overflow: 'hidden',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff'
  }
})
```

## Checklist de Verificación

- [ ] Eliminadas todas las referencias a `max-width: 1024px`
- [ ] Eliminadas todas las referencias a `max-width: min(100vw, 1024px)`
- [ ] Verificado que `.app` usa `width: 100%` y `height: 100%`
- [ ] Verificado que contenedores anidados no tienen restricciones de tamaño
- [ ] Probado el microfrontend standalone (se adapta al tamaño de la ventana)
- [ ] Probado en el Flow Designer con diferentes dispositivos
- [ ] Contenido visible y utilizable en dispositivos móviles pequeños (390px ancho)

## Archivos Típicos a Revisar

```
src/
├── styles/
│   ├── app.css          ← Revisar estilos del contenedor principal
│   ├── globals.css      ← Revisar estilos globales
│   └── responsive.css   ← Revisar media queries
├── components/
│   └── App/
│       ├── App.tsx      ← Verificar clases CSS aplicadas
│       └── App.module.css ← Revisar estilos del componente
└── index.html           ← Verificar estilos inline
```

## Contacto

Si hay dudas técnicas sobre la implementación, contactar al equipo del Flow Designer para pruebas de integración.

---
**Fecha:** Agosto 11, 2025  
**Versión:** 1.0  
**Responsable:** Equipo Flow Designer
