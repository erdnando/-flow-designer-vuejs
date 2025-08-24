# 🤖 Sistema Agéntico - Equipo IA y ComponentAgents

## 📋 Responsabilidades del Equipo

Este equipo es responsable de:
- ✅ **ComponentAgents** - Agentes especializados bancarios
- ✅ **LLM Integration** - Conexión con Ollama (192.168.0.19:11434)
- ✅ **Orchestrator** - Sistema de coordinación de agentes
- ✅ **Tools** - Herramientas especializadas bancarias
- ✅ **Model Selection** - Selección inteligente de modelos LLM

## 🚫 Restricciones

**NO tocar estos directorios:**
- ❌ `src/flow-designer/`
- ❌ `src/integration/` (solo lectura para entender interfaces)

## ✅ Archivos que SÍ pueden modificar

- ✅ Todo dentro de `src/agentic-system/`
- ✅ `docs/agentic-system/` (su documentación)

## 🧠 Modelos LLM Disponibles

Según benchmarking validado:
```yaml
lightning: "llama3.2:3b (4.8s)"
development: "deepseek-coder:6.7b (30.5s)" 
advanced: "codestral:latest (62s)"
premium: "mixtral:latest (89.5s)"
ultra: "llama4:16x17b (265.5s)"
research: "deepseek-r1:8b (17.9min)"
```

## 📚 Documentación

- `docs/agentic-system/AGENTS.md` - Guía de ComponentAgents
- `docs/agentic-system/ARQUITECTURA.md` - Arquitectura del sistema
- `docs/agentic-system/CONFIGURACION.md` - Configuración de modelos

## 🔗 Comunicación con Otros Equipos

Para integración con Flow Designer, implementar interfaces:
```typescript
// Ejemplo de respuesta al bridge
export interface ComponentGenerationResponse {
  success: boolean
  component?: Vue.Component
  metadata?: ComponentMetadata
}
```

## 📞 Contacto

- **Lead**: Equipo Sistema Agéntico
- **Review**: Arquitecto del puente de integración
- **Deploy**: Independiente del flow designer
