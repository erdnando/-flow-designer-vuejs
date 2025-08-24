<template>
  <div class="component-agent-container">
    <!-- Input Panel (Left) -->
    <div class="input-panel">
      <div class="panel-header">
        <h3>📥 Parámetros de Entrada</h3>
        <span class="agent-name">{{ agent?.name }}</span>
      </div>
      
      <div class="panel-content">
        <div v-if="agent?.inputs && agent.inputs.length > 0" class="inputs-section">
          <div v-for="input in agent.inputs" :key="input.id" class="input-group">
            <label :for="input.id" class="input-label">
              {{ input.name }}
              <span v-if="input.required" class="required">*</span>
            </label>
            
            <input
              v-if="input.type === 'text'"
              :id="input.id"
              v-model="inputValues[input.id]"
              type="text"
              :placeholder="input.description"
              class="input-field"
            />
            
            <input
              v-else-if="input.type === 'number'"
              :id="input.id"
              v-model="inputValues[input.id]"
              type="number"
              :placeholder="input.description"
              class="input-field"
            />
            
            <select
              v-else-if="input.type === 'select'"
              :id="input.id"
              v-model="inputValues[input.id]"
              class="input-field"
            >
              <option value="">Seleccionar...</option>
              <!-- Options would be defined in input.options -->
            </select>
            
            <textarea
              v-else-if="input.type === 'object'"
              :id="input.id"
              v-model="inputValues[input.id]"
              :placeholder="input.description"
              class="input-field textarea-field"
              rows="3"
            ></textarea>
            
            <p class="input-description">{{ input.description }}</p>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <p>No hay parámetros de entrada configurados</p>
        </div>
        
        <!-- Agent Info -->
        <div class="agent-info">
          <h4>🤖 Información del Agente</h4>
          <p><strong>Especialización:</strong> {{ agent?.specialization }}</p>
          <p><strong>Objetivo:</strong> {{ agent?.objective }}</p>
          <div class="agent-stats">
            <span class="stat">{{ agent?.tasks?.length || 0 }} tareas</span>
            <span class="stat">{{ agent?.tools?.length || 0 }} herramientas</span>
            <span class="stat">{{ agent?.actions?.length || 0 }} acciones</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main Viewer (Center) -->
    <div class="main-viewer">
      <div class="viewer-header">
        <h3>🖥️ Vista del ComponentAgent</h3>
        <div class="viewer-controls">
          <button @click="refreshAgent" class="btn-control" title="Refrescar">
            🔄
          </button>
          <button @click="toggleFullscreen" class="btn-control" title="Pantalla completa">
            ⛶
          </button>
        </div>
      </div>
      
      <div class="viewer-content" ref="viewerContent">
        <!-- Agent HTML View -->
        <div v-if="agent?.htmlView" v-html="agent.htmlView" class="agent-html-view"></div>
        
        <!-- Empty state -->
        <div v-else class="empty-viewer">
          <div class="empty-icon">🤖</div>
          <h3>ComponentAgent No Configurado</h3>
          <p>Para este paso "{{ stepName }}" no hay un ComponentAgent configurado.</p>
          
          <div class="setup-instructions">
            <h4>📋 Instrucciones:</h4>
            <ol>
              <li>Define los parámetros de entrada necesarios</li>
              <li>Configura las herramientas y APIs requeridas</li>
              <li>Diseña la vista HTML del componente</li>
              <li>Establece las acciones de los botones</li>
              <li>Define los parámetros de salida esperados</li>
            </ol>
          </div>
          
          <button @click="createAgent" class="btn-create-agent">
            ✨ Crear ComponentAgent
          </button>
        </div>
      </div>
    </div>
    
    <!-- Output Panel (Right) -->
    <div class="output-panel">
      <div class="panel-header">
        <h3>📤 Parámetros de Salida</h3>
        <span class="status" :class="executionStatus">{{ executionStatus }}</span>
      </div>
      
      <div class="panel-content">
        <div v-if="agent?.outputs && agent.outputs.length > 0" class="outputs-section">
          <div v-for="output in agent.outputs" :key="output.id" class="output-group">
            <label class="output-label">{{ output.name }}</label>
            
            <div class="output-value">
              <span v-if="outputValues[output.id] !== undefined" class="value">
                {{ formatOutputValue(outputValues[output.id], output.type) }}
              </span>
              <span v-else class="no-value">Sin valor</span>
            </div>
            
            <p class="output-description">{{ output.description }}</p>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <p>No hay parámetros de salida configurados</p>
        </div>
        
        <!-- Execution Log -->
        <div class="execution-log">
          <h4>📋 Log de Ejecución</h4>
          <div class="log-entries">
            <div v-for="entry in executionLog" :key="entry.id" class="log-entry" :class="entry.type">
              <span class="log-time">{{ formatTime(entry.timestamp) }}</span>
              <span class="log-message">{{ entry.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { ComponentAgent } from '../types/ComponentAgentTypes'
import { LANDING_COMPONENT_AGENT } from '../services/ComponentAgentRegistry'

// Props
interface Props {
  wizardStep?: any
  stepName?: string
  device?: any
  zoomLevel?: number
}

const props = withDefaults(defineProps<Props>(), {
  stepName: 'Unknown Step'
})

// Emits
const emit = defineEmits<{
  next: []
  previous: []
  ready: []
  error: [string]
}>()

// Reactive state
const agent = ref<ComponentAgent | null>(null)
const inputValues = ref<Record<string, any>>({})
const outputValues = ref<Record<string, any>>({})
const executionStatus = ref<'idle' | 'running' | 'completed' | 'error'>('idle')
const executionLog = ref<Array<{id: string, timestamp: Date, type: 'info' | 'error' | 'success', message: string}>>([])
const viewerContent = ref<HTMLElement>()

// Load ComponentAgent for current step
onMounted(async () => {
  await loadComponentAgent()
  logExecution('info', `ComponentAgent cargado para paso: ${props.stepName}`)
})

async function loadComponentAgent() {
  // For now, use hardcoded landing agent
  // Later this will be dynamic based on stepName
  if (props.stepName.toLowerCase().includes('landing')) {
    agent.value = LANDING_COMPONENT_AGENT
    
    // Initialize input values with defaults
    agent.value.inputs.forEach(input => {
      inputValues.value[input.id] = input.defaultValue
    })
    
    // Initialize output values
    agent.value.outputs.forEach(output => {
      outputValues.value[output.id] = output.value || null
    })
    
    emit('ready')
  }
}

async function refreshAgent() {
  logExecution('info', 'Refrescando ComponentAgent...')
  await loadComponentAgent()
}

function toggleFullscreen() {
  // TODO: Implement fullscreen toggle
  logExecution('info', 'Modo pantalla completa no implementado aún')
}

function createAgent() {
  logExecution('info', 'Iniciando creación de ComponentAgent...')
  // TODO: Open agent creation wizard
}

function formatOutputValue(value: any, type: string): string {
  if (value === null || value === undefined) return 'No definido'
  
  switch (type) {
    case 'object':
      return JSON.stringify(value, null, 2)
    case 'boolean':
      return value ? 'Sí' : 'No'
    default:
      return String(value)
  }
}

function formatTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString()
}

function logExecution(type: 'info' | 'error' | 'success', message: string) {
  executionLog.value.push({
    id: Date.now().toString(),
    timestamp: new Date(),
    type,
    message
  })
  
  // Keep only last 10 entries
  if (executionLog.value.length > 10) {
    executionLog.value = executionLog.value.slice(-10)
  }
}

// Watch for input changes
watch(inputValues, () => {
  if (agent.value) {
    logExecution('info', 'Parámetros de entrada actualizados')
  }
}, { deep: true })
</script>

<style scoped>
.component-agent-container {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  height: 100vh;
  background: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.input-panel, .output-panel {
  background: white;
  border-right: 1px solid #e1e5e9;
  display: flex;
  flex-direction: column;
}

.output-panel {
  border-right: none;
  border-left: 1px solid #e1e5e9;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
  background: #fafbfc;
}

.panel-header h3 {
  margin: 0 0 4px 0;
  font-size: 1.1em;
  color: #2c3e50;
}

.agent-name {
  font-size: 0.9em;
  color: #7f8c8d;
  font-weight: normal;
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}

.status.idle { background: #ecf0f1; color: #7f8c8d; }
.status.running { background: #f39c12; color: white; }
.status.completed { background: #27ae60; color: white; }
.status.error { background: #e74c3c; color: white; }

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.input-group, .output-group {
  margin-bottom: 20px;
}

.input-label, .output-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9em;
}

.required {
  color: #e74c3c;
}

.input-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 0.9em;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.textarea-field {
  resize: vertical;
}

.input-description, .output-description {
  margin: 4px 0 0 0;
  font-size: 0.8em;
  color: #7f8c8d;
  line-height: 1.3;
}

.output-value {
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85em;
}

.value {
  color: #27ae60;
}

.no-value {
  color: #7f8c8d;
  font-style: italic;
}

.main-viewer {
  display: flex;
  flex-direction: column;
  background: white;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
  background: #fafbfc;
}

.viewer-header h3 {
  margin: 0;
  color: #2c3e50;
}

.viewer-controls {
  display: flex;
  gap: 8px;
}

.btn-control {
  background: #ecf0f1;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-control:hover {
  background: #bdc3c7;
}

.viewer-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.agent-html-view {
  height: 100%;
}

.empty-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 16px;
}

.empty-viewer h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.setup-instructions {
  margin: 24px 0;
  text-align: left;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.setup-instructions h4 {
  margin-top: 0;
  color: #2c3e50;
}

.setup-instructions ol {
  margin: 12px 0;
  padding-left: 20px;
}

.setup-instructions li {
  margin-bottom: 8px;
  color: #5a6c7d;
}

.btn-create-agent {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-create-agent:hover {
  transform: translateY(-1px);
}

.agent-info {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.agent-info h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.agent-info p {
  margin: 8px 0;
  font-size: 0.9em;
  color: #5a6c7d;
}

.agent-stats {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.stat {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}

.execution-log {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.execution-log h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 0.95em;
}

.log-entries {
  max-height: 150px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  font-size: 0.8em;
  border-bottom: 1px solid #ecf0f1;
}

.log-entry.info .log-message { color: #3498db; }
.log-entry.success .log-message { color: #27ae60; }
.log-entry.error .log-message { color: #e74c3c; }

.log-time {
  color: #7f8c8d;
  min-width: 60px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.empty-state {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  margin: 20px 0;
}
</style>
