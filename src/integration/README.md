# 🔗 Integration Bridge - Equipo Puente

## 📋 Responsabilidades del Equipo

Este equipo es responsable de:
- ✅ **Bridge Pattern** - Comunicación Flow Designer ↔ Sistema Agéntico
- ✅ **Data Adapters** - Transformación de datos entre sistemas
- ✅ **Message Bus** - Sistema de mensajería
- ✅ **State Sync** - Sincronización de estado compartido
- ✅ **APIs Integration** - Interfaces públicas entre equipos

## 🚫 Restricciones

**NO tocar estos directorios:**
- ❌ `src/flow-designer/` (solo lectura para entender interfaces)
- ❌ `src/agentic-system/` (solo lectura para entender interfaces)

## ✅ Archivos que SÍ pueden modificar

- ✅ Todo dentro de `src/integration/`
- ✅ Interfaces públicas de ambos sistemas (con coordinación)
- ✅ `docs/integration/` (su documentación)

## 🔄 Protocolo de Comunicación

```typescript
// Flujo típico
FlowDesigner → DesignerAgenticBridge → AgenticOrchestrator
                                    ← ComponentResponse ← AgenticSystem
```

## 📚 Documentación

- `docs/integration/BRIDGE.md` - Arquitectura del bridge
- `docs/integration/PROTOCOLS.md` - Protocolos de comunicación

## ⚠️ Coordinación Crítica

**REQUIERE coordinación con ambos equipos:**
- 🔄 Cambios en interfaces públicas
- 🔄 Nuevos tipos compartidos
- 🔄 Modificaciones en protocolos

## 📞 Contacto

- **Lead**: Arquitecto Integration Bridge
- **Coordination**: Leads de Flow Designer + Sistema Agéntico
- **Deploy**: Afecta ambos sistemas
