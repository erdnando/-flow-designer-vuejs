# 🎨 Flow Designer - Equipo Canvas y Nodos

## 📋 Responsabilidades del Equipo

Este equipo es responsable de:
- ✅ **FlowCanvas.vue** - Canvas principal con nodos y edges
- ✅ **Sistema de Nodos** - CustomNode, CustomEdge, NodePanel
- ✅ **Wizard System** - Sistema de wizard existente (SIN modificar la integración agéntica)
- ✅ **UI/UX** - Interfaz de usuario del designer
- ✅ **Stores** - Gestión de estado del flow (flowStore, nodeTypes, etc.)

## 🚫 Restricciones

**NO tocar estos directorios:**
- ❌ `src/agentic-system/` 
- ❌ `src/integration/` (solo lectura para entender interfaces)

## ✅ Archivos que SÍ pueden modificar

- ✅ Todo dentro de `src/flow-designer/`
- ✅ `src/components/` (componentes UI compartidos)
- ✅ `src/views/` (vistas existentes)
- ✅ `docs/flow-designer/` (su documentación)

## 📚 Documentación

- `docs/flow-designer/API.md` - APIs y interfaces del canvas
- `docs/flow-designer/COMPONENTES.md` - Guía de componentes
- `docs/flow-designer/ROADMAP.md` - Roadmap del equipo

## 🔗 Comunicación con Otros Equipos

Para integración con sistema agéntico, usar:
```typescript
// Ejemplo de solicitud al bridge
import { DesignerAgenticBridge } from '@/integration/bridge/DesignerAgenticBridge'
```

## 📞 Contacto

- **Lead**: Equipo Flow Designer
- **Review**: Arquitecto del puente de integración
- **Deploy**: Independiente del sistema agéntico
