<template>
  <div class="component-agent-container">
    <!-- Dynamic Software Component Configuration -->
    <div v-if="crewAgents.length > 0" class="crew-agents-grid">
      <div v-for="agent in crewAgents" :key="agent.id" class="agent-config-panel">
        <!-- Component Header -->
        <div class="agent-header">
          <h3>🔧 {{ agent.componentName }}</h3>
          <span class="step-indicator">Paso {{ (agent.position ?? 0) + 1 }}</span>
        </div>
        
        <!-- Component Configuration Tabs -->
        <div class="agent-tabs">
          <button 
            v-for="tab in componentTabs" 
            :key="tab.id"
            @click="activeAgentTab[agent.id] = tab.id"
            :class="['tab-button', { active: activeAgentTab[agent.id] === tab.id }]"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Basic Configuration -->
          <div v-if="activeAgentTab[agent.id] === 'config'" class="config-section">
            <div class="form-group">
              <label>Nombre del Componente:</label>
              <input 
                v-model="agent.componentName" 
                @input="updateAgent(agent.id, { componentName: agent.componentName })"
                type="text" 
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Propósito:</label>
              <textarea 
                v-model="agent.purpose"
                @input="updateAgent(agent.id, { purpose: agent.purpose })"
                class="form-textarea"
                rows="2"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Descripción:</label>
              <textarea 
                v-model="agent.description"
                @input="updateAgent(agent.id, { description: agent.description })"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Versión:</label>
              <input 
                v-model="agent.version" 
                @input="updateAgent(agent.id, { version: agent.version })"
                type="text" 
                class="form-input"
                placeholder="1.0.0"
              />
            </div>
          </div>

          <!-- Capabilities Configuration -->
          <div v-if="activeAgentTab[agent.id] === 'capabilities'" class="capabilities-section">
            <div class="section-header">
              <h4>Capacidades del Componente</h4>
              <button @click="addCapability(agent.id)" class="add-button">+ Agregar Capacidad</button>
            </div>
            
            <div v-if="agent.capabilities && agent.capabilities.length > 0" class="capabilities-list">
              <div v-for="(capability, index) in agent.capabilities" :key="capability.id" class="capability-item">
                <div class="capability-header">
                  <input 
                    v-model="capability.name" 
                    placeholder="Nombre de la capacidad"
                    class="form-input"
                  />
                  <label class="checkbox-label">
                    <input 
                      v-model="capability.enabled" 
                      type="checkbox"
                    />
                    Habilitada
                  </label>
                  <button @click="removeCapability(agent.id, index)" class="remove-button">×</button>
                </div>
                <textarea 
                  v-model="capability.description"
                  placeholder="Descripción de la capacidad"
                  class="form-textarea"
                  rows="2"
                ></textarea>
              </div>
            </div>
          </div>
          
          <!-- Tasks Configuration -->
          <div v-if="activeAgentTab[agent.id] === 'tasks'" class="tasks-section">
            <div class="section-header">
              <h4>Tareas del Componente</h4>
              <button @click="addTask(agent.id)" class="add-button">+ Agregar Tarea</button>
            </div>
            
            <div v-if="agent.tasks && agent.tasks.length > 0" class="tasks-list">
              <div v-for="(task, index) in agent.tasks" :key="task.id" class="task-item">
                <div class="task-header">
                  <input 
                    v-model="task.name" 
                    placeholder="Nombre de la tarea"
                    class="form-input"
                  />
                  <button @click="removeTask(agent.id, index)" class="remove-button">×</button>
                </div>
                
                <textarea 
                  v-model="task.description"
                  placeholder="Descripción de la tarea"
                  class="form-textarea"
                  rows="2"
                ></textarea>

                <div class="form-group">
                  <label>Algoritmo:</label>
                  <input 
                    v-model="task.algorithm" 
                    placeholder="Nombre del algoritmo"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label>Resultado Esperado:</label>
                  <textarea 
                    v-model="task.expected_output"
                    placeholder="Descripción del resultado esperado"
                    class="form-textarea"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Tools Configuration -->
          <div v-if="activeAgentTab[agent.id] === 'tools'" class="tools-section">
            <div class="section-header">
              <h4>Herramientas del Componente</h4>
              <button @click="addTool(agent.id)" class="add-button">+ Agregar Herramienta</button>
            </div>
            
            <div v-if="agent.tools && agent.tools.length > 0" class="tools-list">
              <div v-for="(tool, index) in agent.tools" :key="tool.id" class="tool-item">
                <div class="tool-header">
                  <input 
                    v-model="tool.name" 
                    placeholder="Nombre de la herramienta"
                    class="form-input"
                  />
                  <select v-model="tool.type" class="form-select">
                    <option value="validation">Validación</option>
                    <option value="transformation">Transformación</option>
                    <option value="api">API</option>
                    <option value="database">Base de Datos</option>
                    <option value="utility">Utilidad</option>
                  </select>
                  <button @click="removeTool(agent.id, index)" class="remove-button">×</button>
                </div>
                
                <textarea 
                  v-model="tool.description"
                  placeholder="Descripción de la herramienta"
                  class="form-textarea"
                  rows="2"
                ></textarea>

                <div class="form-group">
                  <label>Función:</label>
                  <input 
                    v-model="tool.function_name" 
                    placeholder="nombreDeLaFuncion"
                    class="form-input"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Actions Configuration -->
          <div v-if="activeAgentTab[agent.id] === 'actions'" class="actions-section">
            <div class="section-header">
              <h4>Acciones del Componente</h4>
              <button @click="addAction(agent.id)" class="add-button">+ Agregar Acción</button>
            </div>
            
            <div v-if="agent.actions && agent.actions.length > 0" class="actions-list">
              <div v-for="(action, index) in agent.actions" :key="action.id" class="action-item">
                <div class="action-header">
                  <input 
                    v-model="action.name" 
                    placeholder="Nombre de la acción"
                    class="form-input"
                  />
                  <select v-model="action.type" class="form-select">
                    <option value="submit">Enviar</option>
                    <option value="validate">Validar</option>
                    <option value="process">Procesar</option>
                    <option value="navigate">Navegar</option>
                  </select>
                  <button @click="removeAction(agent.id, index)" class="remove-button">×</button>
                </div>
                
                <textarea 
                  v-model="action.description"
                  placeholder="Descripción de la acción"
                  class="form-textarea"
                  rows="2"
                ></textarea>

                <div class="form-row">
                  <div class="form-group">
                    <label>Disparador:</label>
                    <input 
                      v-model="action.trigger" 
                      placeholder=".btn-submit"
                      class="form-input"
                    />
                  </div>
                  <div class="form-group">
                    <label>Manejador:</label>
                    <input 
                      v-model="action.handler" 
                      placeholder="handleSubmit"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- I/O Configuration -->
          <div v-if="activeAgentTab[agent.id] === 'io'" class="io-section">
            <div class="io-subsection">
              <div class="section-header">
                <h4>Entradas (Inputs)</h4>
                <button @click="addInput(agent.id)" class="add-button">+ Agregar Entrada</button>
              </div>
              
              <div v-if="agent.inputs && agent.inputs.length > 0" class="io-list">
                <div v-for="(input, index) in agent.inputs" :key="input.id" class="io-item">
                  <div class="io-header">
                    <input 
                      v-model="input.name" 
                      placeholder="Nombre del parámetro"
                      class="form-input"
                    />
                    <select v-model="input.type" class="form-select">
                      <option value="string">Texto</option>
                      <option value="number">Número</option>
                      <option value="boolean">Booleano</option>
                      <option value="object">Objeto</option>
                      <option value="array">Arreglo</option>
                    </select>
                    <label class="checkbox-label">
                      <input v-model="input.required" type="checkbox" />
                      Requerido
                    </label>
                    <button @click="removeInput(agent.id, index)" class="remove-button">×</button>
                  </div>
                  <textarea 
                    v-model="input.description"
                    placeholder="Descripción del parámetro de entrada"
                    class="form-textarea"
                    rows="1"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="io-subsection">
              <div class="section-header">
                <h4>Salidas (Outputs)</h4>
                <button @click="addOutput(agent.id)" class="add-button">+ Agregar Salida</button>
              </div>
              
              <div v-if="agent.outputs && agent.outputs.length > 0" class="io-list">
                <div v-for="(output, index) in agent.outputs" :key="output.id" class="io-item">
                  <div class="io-header">
                    <input 
                      v-model="output.name" 
                      placeholder="Nombre del parámetro"
                      class="form-input"
                    />
                    <select v-model="output.type" class="form-select">
                      <option value="string">Texto</option>
                      <option value="number">Número</option>
                      <option value="boolean">Booleano</option>
                      <option value="object">Objeto</option>
                      <option value="array">Arreglo</option>
                    </select>
                    <button @click="removeOutput(agent.id, index)" class="remove-button">×</button>
                  </div>
                  <textarea 
                    v-model="output.description"
                    placeholder="Descripción del parámetro de salida"
                    class="form-textarea"
                    rows="1"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Dependencies Configuration -->
          <div v-if="activeAgentTab[agent.id] === 'dependencies'" class="dependencies-section">
            <div class="section-header">
              <h4>Dependencias del Componente</h4>
              <button @click="addDependency(agent.id)" class="add-button">+ Agregar Dependencia</button>
            </div>
            
            <div v-if="agent.dependencies && agent.dependencies.length > 0" class="dependencies-list">
              <div v-for="(_, index) in agent.dependencies" :key="index" class="dependency-item">
                <input 
                  v-model="agent.dependencies[index]" 
                  placeholder="nombre-del-paquete"
                  class="form-input"
                />
                <button @click="removeDependency(agent.id, index)" class="remove-button">×</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <h3>🔧 No hay componentes de software configurados</h3>
        <p>Agrega nodos al diseñador de flujo para crear componentes de software automáticamente.</p>
      </div>
    </div>

    <!-- Code Generation Section -->
    <div class="code-generation-section">
      <div class="generation-header">
        <h3>💻 Generación de Código</h3>
        <div class="generation-buttons">
          <button @click="generateJavaScript" class="generate-button js">JavaScript</button>
          <button @click="generateTypeScript" class="generate-button ts">TypeScript</button>
          <button @click="generateJSON" class="generate-button json">JSON</button>
          <button @click="generatePackageJson" class="generate-button pkg">package.json</button>
        </div>
      </div>

      <!-- Code Display -->
      <div v-if="generatedCode" class="code-display">
        <div class="code-header">
          <span>{{ codeLanguage }}</span>
          <button @click="copyCode" class="copy-button">📋 Copiar</button>
        </div>
        <pre><code :class="codeLanguage">{{ generatedCode }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAgentStore } from '../../stores/agentStore'
import type { SoftwareAgent, ComponentCapability, ComponentInput, ComponentOutput } from '../../stores/agentStore'

interface Props {
  agents?: SoftwareAgent[]
}

const props = withDefaults(defineProps<Props>(), {
  agents: () => []
})

// Store
const agentStore = useAgentStore()

// State
const activeAgentTab = reactive<Record<string, string>>({})
const generatedCode = ref('')
const codeLanguage = ref('')

// Computed
const crewAgents = computed(() => {
  return props.agents && props.agents.length > 0 ? props.agents : agentStore.sortedAgents
})

// Component tabs configuration
const componentTabs = [
  { id: 'config', label: 'Configuración' },
  { id: 'capabilities', label: 'Capacidades' },
  { id: 'tasks', label: 'Tareas' },
  { id: 'tools', label: 'Herramientas' },
  { id: 'actions', label: 'Acciones' },
  { id: 'io', label: 'I/O' },
  { id: 'dependencies', label: 'Dependencias' }
]

// Methods
function updateAgent(agentId: string, updates: Partial<SoftwareAgent>) {
  agentStore.updateAgent(agentId, updates)
}

function addCapability(agentId: string) {
  const agent = agentStore.agents.find(a => a.id === agentId)
  if (agent) {
    const newCapability: ComponentCapability = {
      id: `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'nueva-capacidad',
      description: 'Descripción de la nueva capacidad',
      enabled: true
    }
    agent.capabilities.push(newCapability)
    agentStore.persistToStorage()
  }
}

function removeCapability(agentId: string, index: number) {
  const agent = agentStore.agents.find(a => a.id === agentId)
  if (agent) {
    agent.capabilities.splice(index, 1)
    agentStore.persistToStorage()
  }
}

function addTask(agentId: string) {
  agentStore.addTaskToAgent(agentId, {
    name: 'Nueva Tarea',
    description: 'Descripción de la tarea',
    algorithm: 'nuevoAlgoritmo',
    expected_output: 'Resultado esperado de la tarea'
  })
}

function removeTask(agentId: string, index: number) {
  const agent = agentStore.agents.find(a => a.id === agentId)
  if (agent) {
    agent.tasks.splice(index, 1)
    agentStore.persistToStorage()
  }
}

function addTool(agentId: string) {
  agentStore.addToolToAgent(agentId, {
    name: 'Nueva Herramienta',
    type: 'utility',
    description: 'Descripción de la herramienta',
    function_name: 'nueva_herramienta',
    parameters: {}
  })
}

function removeTool(agentId: string, index: number) {
  const agent = agentStore.agents.find(a => a.id === agentId)
  if (agent) {
    agent.tools.splice(index, 1)
    agentStore.persistToStorage()
  }
}

function addAction(agentId: string) {
  agentStore.addActionToAgent(agentId, {
    name: 'Nueva Acción',
    type: 'submit',
    description: 'Descripción de la acción',
    trigger: '.btn-action',
    handler: 'handleAction',
    validation_rules: ['required']
  })
}

function removeAction(agentId: string, index: number) {
  const agent = agentStore.agents.find(a => a.id === agentId)
  if (agent) {
    agent.actions.splice(index, 1)
    agentStore.persistToStorage()
  }
}

function addInput(agentId: string) {
  const agent = agentStore.agents.find(a => a.id === agentId)
  if (agent) {
    const newInput: ComponentInput = {
      id: `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'nuevoParametro',
      type: 'string',
      description: 'Descripción del nuevo parámetro',
      required: false
    }
    agent.inputs.push(newInput)
    agentStore.persistToStorage()
  }
}

function removeInput(agentId: string, index: number) {
  const agent = agentStore.agents.find(a => a.id === agentId)
  if (agent) {
    agent.inputs.splice(index, 1)
    agentStore.persistToStorage()
  }
}

function addOutput(agentId: string) {
  const agent = agentStore.agents.find(a => a.id === agentId)
  if (agent) {
    const newOutput: ComponentOutput = {
      id: `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'nuevoResultado',
      type: 'string',
      description: 'Descripción del nuevo resultado'
    }
    agent.outputs.push(newOutput)
    agentStore.persistToStorage()
  }
}

function removeOutput(agentId: string, index: number) {
  const agent = agentStore.agents.find(a => a.id === agentId)
  if (agent) {
    agent.outputs.splice(index, 1)
    agentStore.persistToStorage()
  }
}

function addDependency(agentId: string) {
  const agent = agentStore.agents.find(a => a.id === agentId)
  if (agent) {
    agent.dependencies.push('nueva-dependencia')
    agentStore.persistToStorage()
  }
}

function removeDependency(agentId: string, index: number) {
  const agent = agentStore.agents.find(a => a.id === agentId)
  if (agent) {
    agent.dependencies.splice(index, 1)
    agentStore.persistToStorage()
  }
}

// Code Generation Methods
function generateJavaScript() {
  generatedCode.value = agentStore.generateJavaScriptCode()
  codeLanguage.value = 'javascript'
}

function generateTypeScript() {
  generatedCode.value = agentStore.generateTypeScriptComponentCode()
  codeLanguage.value = 'typescript'
}

function generateJSON() {
  generatedCode.value = agentStore.generateJSONCode()
  codeLanguage.value = 'json'
}

function generatePackageJson() {
  generatedCode.value = agentStore.generatePackageJson()
  codeLanguage.value = 'json'
}

function copyCode() {
  navigator.clipboard.writeText(generatedCode.value)
    .then(() => {
      // Could add a toast notification here
      console.log('Código copiado al portapapeles')
    })
    .catch(err => {
      console.error('Error al copiar:', err)
    })
}

// Initialize tabs for each agent
onMounted(() => {
  crewAgents.value.forEach(agent => {
    if (!activeAgentTab[agent.id]) {
      activeAgentTab[agent.id] = 'config'
    }
  })
})

// Import computed
import { computed } from 'vue'
</script>

<style scoped>
.component-agent-container {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.crew-agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.agent-config-panel {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e6ed;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.agent-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agent-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.step-indicator {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.agent-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e6ed;
  overflow-x: auto;
}

.tab-button {
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab-button:hover {
  background: #e9ecef;
  color: #495057;
}

.tab-button.active {
  background: white;
  color: #667eea;
  border-bottom: 2px solid #667eea;
}

.tab-content {
  padding: 20px;
  min-height: 300px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  font-size: 13px;
  color: #495057;
}

.form-input, .form-textarea, .form-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 13px;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e6ed;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.add-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button:hover {
  background: #218838;
}

.remove-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-button:hover {
  background: #c82333;
}

.capabilities-list, .tasks-list, .tools-list, .actions-list, .io-list, .dependencies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.capability-item, .task-item, .tool-item, .action-item, .io-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e0e6ed;
}

.capability-header, .task-header, .tool-header, .action-header, .io-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.capability-header input, .task-header input, .tool-header input, .action-header input, .io-header input {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.dependency-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dependency-item input {
  flex: 1;
}

.io-subsection {
  margin-bottom: 24px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: white;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
  margin-bottom: 40px;
}

.empty-content {
  text-align: center;
  color: #6c757d;
}

.empty-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.empty-content p {
  margin: 0;
  font-size: 14px;
}

.code-generation-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e6ed;
  overflow: hidden;
}

.generation-header {
  padding: 20px;
  border-bottom: 1px solid #e0e6ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.generation-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.generation-buttons {
  display: flex;
  gap: 8px;
}

.generate-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-button.js {
  background: #f7df1e;
  color: #000;
}

.generate-button.ts {
  background: #3178c6;
  color: white;
}

.generate-button.json {
  background: #ff6b6b;
  color: white;
}

.generate-button.pkg {
  background: #51cf66;
  color: white;
}

.generate-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.code-display {
  max-height: 500px;
  overflow: auto;
}

.code-header {
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e6ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copy-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.copy-button:hover {
  background: #5a6268;
}

.code-display pre {
  margin: 0;
  padding: 20px;
  background: #f8f9fa;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #495057;
  overflow-x: auto;
}
</style>
