<template>
  <div class="simple-external-component-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando componente...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h3>Error al cargar componente</h3>
      <p>{{ error }}</p>
      <button @click="retryLoad">Reintentar</button>
    </div>

    <!-- Component Mount Point - siempre presente para que la ref funcione -->
    <div
      ref="mountPoint"
      id="simple-component-mount-point"
      class="component-mount-area"
      :style="containerStyle"
      :class="{ 'is-hidden': loading || error }"
    >
      <!-- El microfrontend se montará aquí -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { getExternalComponentService } from '../services/components'

// Referencias del template
const mountPoint = ref<HTMLElement | null>(null)

// Definir tipos localmente por simplicidad
interface WizardStep {
  id: string
  nodeId: string
  title: string
  type: 'view' | 'process' | 'condition'
  component: string
  description?: string
  customTypeId?: string
  data?: any
  nodeData?: any
  componentData?: {
    customTypeId?: string
    componentVersion?: string
  }
}

// Props
interface Props {
  wizardStep: WizardStep
  device?: {
    label: string
    width: number
    height: number
  }
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  ready: [event: Event]
  error: [error: string]
  output: [data: any]
}>()

// Reactive State
const loading = ref(false)
const error = ref<string | null>(null)
const componentInstance = ref<HTMLElement | null>(null)

// Computed Properties
const containerStyle = computed(() => {
  if (!props.device) return {}
  
  return {
    width: `${props.device.width}px`,
    height: `${props.device.height}px`,
    maxWidth: `${props.device.width}px`,
    maxHeight: `${props.device.height}px`,
    overflow: 'hidden',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff'
  }
})

// Methods
function getCustomTypeId(): string | null {
  return props.wizardStep.customTypeId || 
         props.wizardStep.componentData?.customTypeId ||
         props.wizardStep.nodeData?.customTypeId || 
         null
}

const loadComponent = async () => {
  const customTypeId = getCustomTypeId()
  
  if (!customTypeId) {
    error.value = 'customTypeId no definido en wizardStep'
    console.error('❌ Error al cargar componente:', error.value)
    return
  }

  try {
    loading.value = true
    error.value = null
    
    console.log('🚀 SimpleExternalComponentView: Iniciando carga de componente:', customTypeId)
    console.log('🔍 WizardStep completo:', props.wizardStep)

    // Obtener servicio
    const externalService = getExternalComponentService()

    // Obtener configuración del componente
    const componentConfig = externalService.getAllConfigs().find(config => config.id === customTypeId)
    if (!componentConfig) {
      throw new Error(`Componente ${customTypeId} no está registrado`)
    }

    // Cargar el componente
    await externalService.loadComponent(componentConfig)

    // Esperar al siguiente tick para asegurar que el DOM esté listo
    await nextTick()
    
    // Crear y montar el elemento
    await createAndMountElement(customTypeId)
    
    console.log('✅ Componente cargado exitosamente')
    
  } catch (err) {
    console.error(' ❌ Error cargando componente:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

async function createAndMountElement(customTypeId: string) {
  const componentId = customTypeId
  const customElementName = `${componentId}-web-component`
  
  console.log(`📦 Creando elemento: ${customElementName}`)

  // Verificar que el custom element esté registrado
  if (!customElements.get(customElementName)) {
    throw new Error(`Custom element '${customElementName}' no está registrado`)
  }

  // Crear el elemento
  const element = document.createElement(customElementName) as HTMLElement
  
  // Configurar atributos básicos
  const sessionId = `sim-${Date.now()}`
  const userId = `user-${Date.now()}`
  
  element.setAttribute('session-id', sessionId)
  element.setAttribute('user-id', userId)
  
  // Configurar config básico
  const config = {
    theme: 'dark',
    showFooter: false,
    simulationMode: true,
    deviceWidth: props.device?.width || 430,
    deviceHeight: props.device?.height || 932
  }
  
  element.setAttribute('config', JSON.stringify(config))
  
  // Configurar flow-context
  const flowContext = {
    sessionId,
    currentStep: 1,
    simulationMode: true,
    componentId,
    componentVersion: '1.0.0'
  }
  
  element.setAttribute('flow-context', JSON.stringify(flowContext))

  // Event Listeners
  element.addEventListener('component-ready', handleComponentReady)
  element.addEventListener('output-data', handleOutputData)
  element.addEventListener('next-step', handleNextStep)
  
  // Montar en el DOM
  if (!mountPoint.value) {
    throw new Error('Mount point no encontrado')
  }
  
  // Limpiar contenido previo
  mountPoint.value.innerHTML = ''
  
  // Montar nuevo elemento
  mountPoint.value.appendChild(element)
  
  // Guardar referencia
  componentInstance.value = element
  
  console.log('✅ Componente montado exitosamente')
}

// Event Handlers
function handleComponentReady(event: Event) {
  console.log('🎉 Componente listo:', event)
  emit('ready', event)
}

function handleOutputData(event: any) {
  console.log('📤 Output data:', event.detail)
  emit('output', event.detail)
}

function handleNextStep(event: any) {
  console.log('➡️ Next step solicitado:', event.detail)
  emit('output', event.detail)
}

function retryLoad() {
  loadComponent()
}

function cleanup() {
  if (componentInstance.value) {
    const element = componentInstance.value
    
    // Remover event listeners
    element.removeEventListener('component-ready', handleComponentReady)
    element.removeEventListener('output-data', handleOutputData)
    element.removeEventListener('next-step', handleNextStep)
    
    // Remover del DOM
    element.remove()
    componentInstance.value = null
  }
}

// Watchers
watch(
  () => props.wizardStep,
  () => {
    const customTypeId = getCustomTypeId()
    console.log('🔄 WizardStep cambió, recargando componente:', customTypeId)
    cleanup()
    loadComponent()
  }
)

watch(
  () => props.device,
  (newDevice) => {
    console.log('📱 Device cambió:', newDevice?.label)
    // Solo recargar si el componente ya está montado
    if (componentInstance.value) {
      cleanup()
      loadComponent()
    }
  }
)

// Lifecycle
onMounted(() => {
  console.log('🔧 SimpleExternalComponentView montado')
  loadComponent()
})

onUnmounted(() => {
  console.log('🔧 SimpleExternalComponentView desmontado')
  cleanup()
})
</script>

<style scoped>
.simple-external-component-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  color: #666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  color: #dc3545;
  text-align: center;
}

.error-state h3 {
  margin: 0;
  font-size: 18px;
}

.error-state p {
  margin: 0;
  font-size: 14px;
}

.error-state button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.error-state button:hover {
  background: #0056b3;
}

.component-mount-area {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.component-mount-area.is-hidden {
  display: none;
}
</style>
