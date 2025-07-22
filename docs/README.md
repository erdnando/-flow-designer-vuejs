# Documentación del Flow Designer

Bienvenido a la documentación técnica del Flow Designer. Aquí encontrarás información detallada sobre los sistemas y componentes principales de la aplicación.

## 📚 Documentos Disponibles

### 1. [Sistema de Reglas de Validación](./validation-rules-system.md)
**Descripción:** Documentación completa del sistema de reglas para nodos, conexiones y flujos.

**Contenido incluye:**
- Arquitectura del sistema de validación
- Tipos de validación (nodos, conexiones, flujo)
- Cómo crear y agregar nuevas reglas
- Integración con el sistema de alertas
- Ejemplos prácticos de implementación
- Mejores prácticas y patrones recomendados

**Ideal para:** Desarrolladores que quieran agregar nuevas reglas de negocio o entender cómo funciona el sistema de validación.

---

### 2. [Sistema de Notificaciones y Alertas](./notifications-system.md)
**Descripción:** Guía completa del sistema de notificaciones visuales y cómo utilizarlo desde otros módulos.

**Contenido incluye:**
- API completa del composable `useNotifications`
- Tipos de notificaciones disponibles
- Cómo usar desde otros componentes y módulos
- Configuración y personalización avanzada
- Ejemplos de integración con otros sistemas
- Patrones de uso recomendados

**Ideal para:** Desarrolladores que necesiten mostrar feedback visual al usuario desde cualquier parte de la aplicación.

---

## 🚀 Inicio Rápido

### Para Reglas de Validación:
```typescript
// Crear nueva regla
const miRegla: ValidationRule = {
    id: 'mi-regla-personalizada',
    name: 'Mi Regla',
    description: 'Descripción de la regla',
    category: 'node',
    enabled: true,
    validate: (nodes) => {
        // Tu lógica aquí
        return { isValid: true, ruleId: 'mi-regla-personalizada', severity: 'info' };
    }
};
```

### Para Notificaciones:
```typescript
import { useNotifications } from '@/composables/useNotifications'

const { showSuccess, showDanger, showWarning } = useNotifications()

// Uso básico
showSuccess('Operación completada')

// Con acciones personalizadas
showWarning('¿Confirmar acción?', {
    actions: [
        { label: 'Confirmar', action: () => confirm(), style: 'primary' },
        { label: 'Cancelar', action: () => {}, style: 'secondary' }
    ]
})
```

---

## 🔧 Arquitectura General

```
src/
├── composables/
│   └── useNotifications.ts          # Sistema de notificaciones global
├── utils/
│   └── nodeValidationRules.ts       # Reglas de validación escalables
├── components/
│   ├── NotificationContainer.vue    # Componente visual de notificaciones
│   └── FlowCanvas.vue              # Integración de ambos sistemas
└── docs/
    ├── validation-rules-system.md   # Este documento
    ├── notifications-system.md      # Sistema de alertas
    └── README.md                   # Este índice
```

---

## 🤝 Contribución

### Agregar Nueva Regla de Validación:
1. Leer [validation-rules-system.md](./validation-rules-system.md)
2. Crear la regla siguiendo la interfaz `ValidationRule`
3. Agregarla al array `validationRules`
4. Probar con casos de uso reales

### Extender Sistema de Notificaciones:
1. Leer [notifications-system.md](./notifications-system.md)
2. Usar el composable `useNotifications` en tu componente
3. Seguir las mejores prácticas documentadas
4. Considerar accesibilidad y experiencia de usuario

---

## 📋 Estado Actual

### ✅ Implementado:
- Sistema de reglas escalable con TypeScript
- Validaciones para nodos START y END únicos
- Sistema de notificaciones completo con 5 tipos
- Integración automática entre validaciones y alertas
- Componente visual moderno con animaciones
- API completa para uso desde otros módulos

### 🚧 En Desarrollo:
- Reglas de validación para conexiones
- Validaciones de flujo completo
- Editor visual de reglas
- Métricas y reportes de validación

### 🔮 Futuras Funcionalidades:
- Reglas dinámicas basadas en configuración
- Notificaciones con progreso
- Sistema de tours y guías contextuales
- Validaciones asíncronas
- Integración con sistema de ayuda

---

## 📞 Soporte

Para preguntas sobre la implementación o sugerencias de mejoras:

1. **Reglas de Validación:** Revisar ejemplos en `validation-rules-system.md`
2. **Notificaciones:** Consultar API completa en `notifications-system.md`
3. **Integración:** Ver ejemplos prácticos en ambos documentos
4. **Extensibilidad:** Seguir los patrones establecidos y mejores prácticas

---

**Última actualización:** Julio 2025  
**Versión de la documentación:** 1.0
