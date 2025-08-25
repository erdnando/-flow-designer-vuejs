# Flow Designer - Vue 3 + TypeScript + Vite

Un diseñador de flujos interactivo construido con Vue 3, TypeScript y Vue Flow.

## 🚀 Inicio Rápido

### **Desarrollo del Flow Designer (Vue)**
```bash
npm install
npm run dev
```

### **Desarrollo de Componentes Externos (React)**
Ver documentación completa: **[Especificación de Componentes React](EXTERNAL-REACT-COMPONENT-SPEC.md)**

```bash
# En directorio separado (ej: ../landing-component/)
# Seguir especificación para crear proyecto React independiente
npm install
npm run dev  # http://localhost:3001/demo.html
npm run build  # dist/landing-v1.0.0.js
```

## 🌟 Documentación Estratégica

### 🤖 Sistema Agéntico (NUEVO - Agosto 2025)
- **[🤖 Sistema Agéntico Dinámico Node.js](SISTEMA-AGENTICO-NODEJS.md)** - ⭐ **IMPLEMENTACIÓN COMPLETA**: Sistema CrewAI nativo que convierte automáticamente nodos del designer en agentes configurables
- **[🔧 Contexto Técnico para GitHub Copilot](CONTEXTO-GITHUB-COPILOT.md)** - ⭐ **CONTINUIDAD**: Decisiones técnicas y estado actual para futuras sesiones

### 🏗️ Arquitectura y Estrategia
- **[📋 Arquitectura de Componentes Externos](ARQUITECTURA-COMPONENTES-EXTERNOS.md)** - ⭐ **ESTRATEGIA PRINCIPAL**: Evolución hacia arquitectura modular con componentes React externos
- **[🔧 Decisiones Técnicas y Troubleshooting](DECISIONES-TECNICAS-TROUBLESHOOTING.md)** - ⭐ **ACERVO TÉCNICO**: Decisiones críticas, problemas conocidos y soluciones
- **[🛣️ Roadmap de Implementación](ROADMAP-IMPLEMENTACION.md)** - ⭐ **GUÍA DE DESARROLLO**: Plan detallado paso a paso
- **[🎯 Simulador del Wizard](WIZARD-SIMULATOR-SISTEMA.md)** - Sistema de ejecución de flujos paso a paso

## �📖 Documentación Técnica

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
