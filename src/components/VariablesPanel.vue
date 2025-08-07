<template>
  <div class="variables-panel">
    <!-- Header del panel -->
    <div class="panel-header">
      <div class="panel-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="panel-icon">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>Variables</span>
        <span class="variables-count">{{ totalVariablesCount }}</span>
      </div>
      <div class="panel-controls">
        <button 
          @click="toggleSort" 
          class="sort-btn" 
          :class="{ active: sortAlphabetically }"
          title="Ordenar alfabéticamente"
        >
          🔤
        </button>
      </div>
    </div>

    <!-- Contenido del panel -->
    <div class="panel-content">
      <div class="variables-container">
        <div 
          v-for="variable in sortedVariables" 
          :key="variable.key"
          class="variable-item"
          :class="{ 'current-step': variable.isCurrentStep }"
        >
          <div class="variable-content">
            <div class="variable-name">{{ variable.name }}</div>
            <div class="variable-value">{{ formatValue(variable.value) }}</div>
          </div>
        </div>
        
        <div v-if="sortedVariables.length === 0" class="no-variables">
          Sin variables capturadas aún
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  outputData: Record<string, any>
  timeParameters: Record<string, string>
  sessionData: Record<string, any>
  currentStep: number
  totalSteps: number
  currentStepTitle: string
  currentStepData?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  outputData: () => ({}),
  timeParameters: () => ({}),
  sessionData: () => ({}),
  currentStepData: () => ({})
})

// Estado del ordenamiento
const sortAlphabetically = ref(false)

const toggleSort = () => {
  sortAlphabetically.value = !sortAlphabetically.value
}

// Función para formatear valores
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'object') {
    return JSON.stringify(value).length > 50 
      ? JSON.stringify(value, null, 2).substring(0, 50) + '...'
      : JSON.stringify(value, null, 2)
  }
  return String(value)
}

// Generar lista de todas las variables de forma plana
const allVariables = computed(() => {
  const variables: Array<{
    key: string
    name: string
    value: any
    step: number
    stepId: string
    isCurrentStep: boolean
  }> = []

  // Agregar variables de sesión
  if (props.sessionData) {
    Object.entries(props.sessionData).forEach(([key, value]) => {
      variables.push({
        key: `session-${key}`,
        name: key,
        value: value,
        step: 0,
        stepId: 'session',
        isCurrentStep: false
      })
    })
  }

  // Agregar variables de tiempo
  if (props.timeParameters) {
    Object.entries(props.timeParameters).forEach(([key, value]) => {
      variables.push({
        key: `time-${key}`,
        name: key,
        value: value,
        step: 0,
        stepId: 'time',
        isCurrentStep: false
      })
    })
  }

  // Agregar variables de cada paso
  if (props.outputData) {
    Object.entries(props.outputData).forEach(([stepId, stepData]) => {
      const stepNumber = parseInt(stepId.replace('step-', '')) || 0
      const isCurrentStep = stepNumber === props.currentStep

      if (stepData.outputParameters) {
        Object.entries(stepData.outputParameters).forEach(([key, value]) => {
          variables.push({
            key: `${stepId}-${key}`,
            name: key,
            value: value,
            step: stepNumber,
            stepId: stepId,
            isCurrentStep: isCurrentStep
          })
        })
      }
    })
  }

  return variables
})

// Variables ordenadas según la preferencia
const sortedVariables = computed(() => {
  if (!sortAlphabetically.value) {
    return allVariables.value
  }

  return [...allVariables.value].sort((a, b) => 
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  )
})

// Contador total de variables
const totalVariablesCount = computed(() => {
  return allVariables.value.length
})
</script>

<style scoped>
.variables-panel {
  width: 280px; /* Reducir ligeramente el ancho del panel */
  height: 100%;
  background: #1a1a1a;
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px; /* Mismo padding que wizard-header */
  background: linear-gradient(135deg, #333 0%, #2a2a2a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0; /* Evitar que se comprima */
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  overflow: hidden;
}

.panel-icon {
  color: #00d4aa;
  flex-shrink: 0;
}

.variables-count {
  background: #00d4aa;
  color: #000;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
}

.panel-controls {
  display: flex;
  gap: 4px;
}

.sort-btn {
  background: transparent;
  border: 1px solid #444;
  color: #ccc;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  background: #333;
  border-color: #555;
}

.sort-btn.active {
  background: #00d4aa;
  color: #000;
  border-color: #00d4aa;
}

.panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.variables-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.variable-item {
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 6px;
  transition: all 0.2s ease;
}

.variable-item:hover {
  background: #333;
  border-color: #444;
}

.variable-item.current-step {
  border-color: #00d4aa;
  background: #0f2a26;
}

.variable-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.variable-name {
  font-weight: 500;
  color: #00d4aa;
  font-size: 12px;
  flex-shrink: 0;
}

.variable-value {
  color: #fff;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  line-height: 1.4;
  text-align: right;
  flex: 1;
  min-width: 0;
}

.no-variables {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
  font-size: 12px;
}

/* Scrollbar personalizado */
.variables-container::-webkit-scrollbar {
  width: 6px;
}

.variables-container::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.variables-container::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.variables-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
