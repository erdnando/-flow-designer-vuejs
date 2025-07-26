# Flow Designer - Vue 3 + TypeScript + Vite

Un diseñador de flujos interactivo construido con Vue 3, TypeScript y Vue Flow.

## 🚀 Inicio Rápido

```bash
npm install
npm run dev
```

## 📖 Documentación

### Sistemas Principales
- **[Sistema de Conexiones](CONEXIONES-SISTEMA.md)** - Implementación completa de selección, animación y gestión de conexiones
- **[Sistema de Eliminación](DELETION-SYSTEM-AND-DIALOGS.md)** - Sistema completo de eliminación de nodos y conexiones con diálogos
- **[Sistema de Eliminación de Conexiones](EDGE-DELETION-SYSTEM.md)** - Implementación detallada del sistema de eliminación de edges
- **[Sistema de Validación](validation-rules-system.md)** - Reglas y validaciones para flujos
- **[Sistema de Notificaciones](notifications-system.md)** - Manejo de notificaciones y feedback al usuario
- **[Web Components](WEB_COMPONENT_IMPLEMENTATION.md)** - Implementación como componente web

### Patrones y Soluciones Técnicas
- **[Global Click Listener Pattern](GLOBAL-CLICK-LISTENER-PATTERN.md)** - ⭐ Patrón para superar interceptación de eventos en Vue Flow
- **[Lecciones Aprendidas - Homologación Nodos](LECCIONES-APRENDIDAS-HOMOLOGACION-NODOS.md)** - Experiencias en desarrollo

### Guías de Desarrollo
- **[Mejoras de Notificaciones](MEJORAS-NOTIFICACIONES.md)** - Mejoras implementadas en el sistema de notificaciones
- **[Fix Handler Validation](FIX-HANDLER-VALIDATION.md)** - Correcciones en validaciones de handlers
- **[Limpieza de Notificaciones](LIMPIEZA-NOTIFICACIONES.md)** - Optimizaciones del sistema

### Tests y Demos
- **[Test Validation](test-validation.md)** - Casos de prueba del sistema de validación
- **[Test Circular Connections](test-circular-connections.md)** - Pruebas de conexiones circulares
- **[Test Handler Connections](test-handler-connections.md)** - Pruebas de conexiones de handlers
- **[Demo Handler Validation](demo-handler-validation.md)** - Demostración de validaciones

## 🏗️ Arquitectura

El proyecto está basado en Vue 3 con composición API y utiliza:
- **Vue Flow** para el sistema de flujos
- **Element Plus** para componentes UI
- **Pinia** para gestión de estado
- **TypeScript** para tipado estático

## 🔧 Tecnologías

- Vue 3
- TypeScript
- Vite
- Vue Flow
- Element Plus
- Pinia
