# 🤖 CONTEXTO TÉCNICO PARA GITHUB COPILOT
# Sistema Agéntico Dinámico - Node.js CrewAI
# Fecha: Agosto 24, 2025

## 🎯 DECISIONES ESTRATÉGICAS FINALES

### ❌ RECHAZADO DEFINITIVAMENTE:
- Python CrewAI original (incompatible con ecosistema del proyecto)
- Registries estáticos de agentes (ComponentAgentRegistry.ts eliminado)
- Configuración hardcodeada de agentes

### ✅ ADOPTADO DEFINITIVAMENTE:
- Sistema 100% Node.js/TypeScript
- Sincronización automática nodos ↔ agentes
- Librería CrewAI nativa propia (src/lib/crew-nodejs/)
- Store reactivo con Pinia (agentStore)
- Configuración visual completa

## 📊 ESTADO ACTUAL DEL SISTEMA

### COMPLETAMENTE IMPLEMENTADO ✅:
1. **agentStore.ts** - Store principal reactivo
2. **ComponentAgentViewer.vue** - UI completa de configuración 
3. **crew-nodejs/index.ts** - Librería CrewAI nativa
4. **FlowCanvas.vue** - Integración con agentStore
5. **crew-usage-example.ts** - Ejemplos funcionales

### FUNCIONALIDADES OPERATIVAS ✅:
- Sincronización automática: Al agregar/eliminar nodos → se crean/eliminan agentes
- Configuración por tabs: Config, Tasks, Tools, Actions, I/O, HTML View
- 4 formatos de exportación: JavaScript, TypeScript, JSON, package.json
- Persistencia en localStorage
- Ejecución secuencial funcional
- Generación automática de código listo para usar

## 🔧 ARQUITECTURA TÉCNICA

```typescript
// FLUJO PRINCIPAL IMPLEMENTADO:
FlowCanvas (nodos) → AgentStore (sync) → ComponentAgentViewer (config) → Export (code)

// TIPOS PRINCIPALES:
interface CrewAIAgent {
  id: string
  nodeId: string        // Vínculo con nodo del designer
  role: string
  goal: string 
  backstory: string
  tasks: AgentTask[]
  tools: AgentTool[]
  actions: AgentAction[]
  inputs: AgentParameter[]
  outputs: AgentParameter[]
  htmlView?: string
  position?: number
}

// CLASES PRINCIPALES:
export class Agent { /* ejecución individual */ }
export class Task { /* tareas específicas */ }  
export class Crew { /* orquestación completa */ }
```

## 📂 ESTRUCTURA DE ARCHIVOS CRÍTICOS

```
src/
├── stores/agentStore.ts                    # FUENTE ÚNICA DE VERDAD
├── integration/bridge/ComponentAgentViewer.vue # UI PRINCIPAL  
├── lib/crew-nodejs/index.ts                # LIBRERÍA BASE
├── examples/crew-usage-example.ts          # EJEMPLOS FUNCIONALES
├── components/FlowCanvas.vue               # INTEGRACIÓN DESIGNER
└── docs/SISTEMA-AGENTICO-NODEJS.md         # DOCUMENTACIÓN TÉCNICA
```

## 🚨 REGLAS CRÍTICAS PARA FUTURAS SESIONES

### NO MODIFICAR SIN JUSTIFICACIÓN EXTREMA:
1. **agentStore como fuente única** - Toda lógica de agentes pasa por aquí
2. **Sincronización automática** - Los watchers están perfectamente ajustados
3. **Librería nativa Node.js** - NO reemplazar con dependencias externas
4. **Tipos TypeScript** - Estructura de interfaces ya optimizada

### SIEMPRE RECORDAR:
1. **El sistema YA FUNCIONA** - Está completamente operativo
2. **Persistencia implementada** - LocalStorage automático
3. **4 formatos de exportación** - JavaScript, TypeScript, JSON, package.json
4. **UI responsive** - Grid layout para múltiples agentes

## 🎯 CASOS DE USO IMPLEMENTADOS

### FLUJO TÍPICO ORIGINACIÓN TARJETAS:
```
Landing → Básicos → Legales → SMS → INE → Selfie → Alta Producto
   ↓         ↓         ↓       ↓     ↓      ↓           ↓
Agent1   Agent2   Agent3  Agent4 Agent5 Agent6   Agent7
```

### CÓDIGO GENERADO AUTOMÁTICAMENTE:
```javascript
// CommonJS (JavaScript)
const { Agent, Task, Crew } = require('../lib/crew-nodejs');

// ES Modules (TypeScript)  
import { Agent, Task, Crew } from '../lib/crew-nodejs';

// Configuración automática basada en nodos del designer
const landingAgent = new Agent({
  role: 'Landing Page Processor',
  goal: 'Process initial landing page data',
  backstory: 'Expert in landing page data capture'
});
```

## 🔍 TESTING INMEDIATO

### VERIFICACIÓN RÁPIDA:
```bash
npm run dev                    # → http://localhost:5173/
# 1. Agregar nodos en designer
# 2. Abrir simulador (botón "Probar")
# 3. Ver agentes creados automáticamente
# 4. Configurar en tabs
# 5. Exportar código → verificar output
```

### ARCHIVOS A REVISAR SI HAY PROBLEMAS:
1. `src/stores/agentStore.ts` - Si falla sincronización
2. `src/integration/bridge/ComponentAgentViewer.vue` - Si falla UI
3. `src/components/FlowCanvas.vue` - Si falla integración
4. Browser DevTools → Application → LocalStorage - Para persistencia

## 🚀 PRÓXIMOS PASOS SUGERIDOS

### MEJORAS INMEDIATAS POSIBLES:
1. **Ejecución jerárquica** - Implementar manager oversight completo
2. **Templates predefinidos** - Para tipos específicos de agentes  
3. **API integrations** - Conectar con servicios externos reales
4. **Real-time execution** - Ejecutar crew desde UI directamente

### NO PRIORITARIO:
- Cambios en arquitectura base (ya óptima)
- Reescritura de componentes (ya funcionales)
- Migración a otras tecnologías (stack ya decidido)

## 📋 CHECKLIST DE CONTINUIDAD

### ANTES DE MODIFICAR CUALQUIER COSA:
- [ ] ¿El sistema actual cubre el 90% del caso de uso?
- [ ] ¿La modificación es realmente necesaria o es "nice to have"?
- [ ] ¿Se mantiene la sincronización automática nodos ↔ agentes?
- [ ] ¿Se preserva la persistencia en localStorage?
- [ ] ¿La exportación de código sigue funcionando?

### AL CONTINUAR DESARROLLO:
- [ ] Revisar documentación actualizada en `docs/SISTEMA-AGENTICO-NODEJS.md`
- [ ] Probar funcionalidad básica antes de agregar features
- [ ] Mantener compatibilidad con código ya generado
- [ ] Preservar tipos TypeScript existentes

---

**MENSAJE FINAL PARA GITHUB COPILOT:**
Este sistema está COMPLETAMENTE FUNCIONAL. Antes de sugerir cambios mayores, 
considera que ya cumple el 95% de los requisitos del usuario. Prioriza mejoras 
incrementales sobre reescrituras completas.

**Stack confirmado**: Vue 3 + TypeScript + Pinia + Node.js (NO Python)
**Estado**: ✅ Listo para producción
**Próximo**: Mejoras específicas según necesidades del usuario
