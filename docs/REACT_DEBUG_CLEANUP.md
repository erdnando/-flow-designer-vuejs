# ⚠️ URGENTE: Elementos de Debug Visibles en Producción

## 🐛 **Problema Identificado**

Se detectaron elementos de debug que están apareciendo en la integración con Flow Designer:

### **1. 🔵 Debug Banner Superior**
- **Ubicación**: Esquina superior izquierda
- **Contenido**: "Mode: Flow Designer Config: ✅ View: presentation"
- **Causa**: Banner de debug que se muestra incluso en producción

### **2. 🔵 Botón "INICIAR →" Incorrecto** 
- **Ubicación**: Parte inferior de la app React  
- **Problema**: Aparece un botón CTA que no debería estar visible cuando se ejecuta dentro del iframe del Flow Designer
- **Causa Confirmada**: La app React no está detectando correctamente que está siendo ejecutada dentro de un iframe

---

## 🔧 **Soluciones Requeridas**

### **1. Eliminar Debug Banner**

**Archivo**: `App.js`

**CAMBIAR DE:**
```javascript
{process.env.NODE_ENV === 'development' && (
  <div className="debug-banner">
    Mode: {isInIframe ? 'Flow Designer' : 'Standalone'} | 
    Config: {config ? '✅' : '❌'} |
    Step: {config?.stepId || 'N/A'}
  </div>
)}
```

**A:**
```javascript
{/* DEBUG BANNER ELIMINADO - No mostrar en ningún entorno */}
{/* 
{process.env.NODE_ENV === 'development' && (
  <div className="debug-banner">
    Mode: {isInIframe ? 'Flow Designer' : 'Standalone'} | 
    Config: {config ? '✅' : '❌'} |
    Step: {config?.stepId || 'N/A'}
  </div>
)}
*/}
```

### **2. Verificar Detección de Iframe**

**CRÍTICO**: La app React debe detectar si está corriendo dentro de un iframe:

```javascript
// Al inicio de App.js
const isInIframe = window !== window.parent;

useEffect(() => {
  console.log('🔍 Iframe Detection:', {
    isInIframe: isInIframe,
    windowParent: window.parent !== window,
    frameElement: window.frameElement !== null
  });
}, []);
```

### **3. Verificar Botones de Navegación**

**Asegurar que SOLO se muestren los botones correctos:**

```javascript
{/* CORRECTO: Solo en modo iframe */}
{isInIframe && (
  <footer className="wizard-navigation">
    <button className="nav-button nav-button--secondary">
      ← Anterior
    </button>
    <button className="nav-button nav-button--primary">
      Siguiente →
    </button>
  </footer>
)}

{/* CORRECTO: Solo en modo standalone */}
{!isInIframe && (
  <footer className="standalone-footer">
    <button className="cta-button">
      ¡Solicítala ahora!
    </button>
  </footer>
)}
```

### **3. Eliminar CSS de Debug Banner**

**Archivo**: `App.css`

**ELIMINAR o COMENTAR:**
```css
/* DEBUG BANNER - ELIMINAR */
/*
.debug-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 12px;
  font-size: 11px;
  font-family: monospace;
  z-index: 9999;
  text-align: center;
}
*/
```

---

---

## 🔍 **Debugging Específico**

### **Confirmar origen del botón "INICIAR →"**

1. **Abrir DevTools** en el navegador cuando se vea el problema
2. **Inspeccionar elemento** del botón "INICIAR →"
3. **Verificar en Console**:
   ```javascript
   // En la consola del navegador:
   console.log('Iframe detected:', window !== window.parent);
   console.log('Frame element:', window.frameElement);
   ```

### **Test de Visibilidad Condicional**

**Agregar temporalmente al componente que muestra el botón CTA:**

```javascript
// Debugging temporal
useEffect(() => {
  console.log('🔍 Button Visibility Check:', {
    isInIframe: window !== window.parent,
    shouldShowCTA: !isInIframe, // Solo mostrar CTA en standalone
    shouldShowNavButtons: isInIframe // Solo mostrar nav en iframe
  });
}, []);

// En el render:
{console.log('🎨 Rendering buttons - iframe mode:', isInIframe) || null}
```

---

## 🧪 **Testing**

### **Checklist de Verificación**

- [ ] **No aparece debug banner** en localhost:3000
- [ ] **No aparece debug banner** cuando se carga en Flow Designer iframe  
- [ ] **Solo aparecen botones "Anterior/Siguiente"** en modo iframe
- [ ] **No aparecen botones extra o duplicados** 
- [ ] **La aplicación se ve limpia** sin elementos técnicos

### **URLs de Testing**

1. **Standalone**: `http://localhost:3000` 
   - ❌ NO debe mostrar debug banner
   - ✅ Debe mostrar botón CTA normal

2. **En Flow Designer**: `http://localhost:5173` → Ejecutar wizard
   - ❌ NO debe mostrar debug banner  
   - ✅ Debe mostrar solo "Anterior/Siguiente"

---

## 📞 **Contacto**

Si después de aplicar estos cambios aún aparecen elementos no deseados:

1. **Revisar console.log** para mensajes de debug
2. **Inspeccionar elemento** para identificar CSS classes
3. **Verificar NODE_ENV** en el entorno de desarrollo
4. **Comprobar que no hay otros archivos** inyectando elementos

---

## ⏰ **Prioridad: ALTA**

Estos elementos afectan la experiencia de usuario y dan una imagen no profesional. Deben ser removidos antes de cualquier demo o entrega.

---

## 📋 **Entrega Esperada**

**Resultado**: Iframe limpio que muestre SOLO:
- ✅ Contenido de la tarjeta Bradescard
- ✅ Botones "Anterior" y "Siguiente" (cuando esté en Flow Designer)
- ❌ Sin debug banner
- ❌ Sin botones extra o duplicados
