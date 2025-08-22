<template>
  <div class="iframe-microfrontend-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando aplicación externa...</p>
      <p class="loading-url">{{ microfrontendUrl }}</p>
    </div>
    
    <!-- Error state -->
    <div v-if="error" class="error-state">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
          <path d="M12 8v4m0 4h.01" stroke="#ef4444" stroke-width="2"/>
        </svg>
      </div>
      <h3>Error al cargar microfrontend</h3>
      <p class="error-message">{{ error }}</p>
      <div class="error-actions">
        <button @click="retryLoad" class="btn btn-primary">🔄 Reintentar</button>
        <button @click="skipStep" class="btn btn-secondary">⏭️ Omitir</button>
      </div>
    </div>
    
    <!-- Iframe container -->
    <div v-if="!loading && !error" class="iframe-container" :style="containerStyle">
      <iframe
        ref="microfrontendFrame"
        :src="microfrontendUrl"
        class="microfrontend-iframe"
        :style="iframeStyle"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        loading="lazy"
      ></iframe>
      
      <!-- Overlay para interceptar eventos si es necesario -->
      <div v-if="showOverlay" class="iframe-overlay" @click="handleOverlayClick"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Props interface
interface Props {
  wizardStep?: any
  device?: {
    id?: string
    width: number
    height: number
    label: string
    userAgent?: string
  }
  zoomLevel?: number
  sessionId?: string
  userId?: string
  componentId?: string
  stepId?: string
}

const props = withDefaults(defineProps<Props>(), {
  zoomLevel: 1.0
})

// Emits
const emit = defineEmits<{
  next: [data: any]
  previous: [data: any]
  ready: [data: { componentId?: string; stepId?: string }]
  error: [error: string]
  heightAdjustment: [data: { currentHeight: number; requiredHeight: number; difference: number }]
}>()

// Refs
const microfrontendFrame = ref<HTMLIFrameElement | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showOverlay = ref(false)
const messagesSent = ref(0)
const messagesReceived = ref(0)

// Computed properties
const microfrontendUrl = computed(() => {
  // Construir URL base
  let baseUrl = 'http://localhost:3000/'
  
  // Agregar parámetros como query params
  const params = new URLSearchParams()
  
  if (props.sessionId) {
    params.append('sessionId', props.sessionId)
  }
  
  if (props.userId) {
    params.append('userId', props.userId)
  }
  
  if (props.wizardStep?.id) {
    params.append('stepId', props.wizardStep.id)
  }
  
  if (props.device) {
    params.append('deviceWidth', props.device.width.toString())
    params.append('deviceHeight', props.device.height.toString())
  }
  
  // Agregar información del paso actual
  if (props.wizardStep?.componentData?.customTypeId) {
    params.append('componentId', props.wizardStep.componentData.customTypeId)
  }
  
  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
})

const iframeStyle = computed(() => {
  const deviceWidth = props.device?.width || 430
  const deviceHeight = props.device?.height || 1600  // Altura extrema para contenido completo
  
  return {
    width: `${deviceWidth}px`,
    height: `${deviceHeight}px`,
    border: 'none',
    borderRadius: 'inherit',
    maxWidth: '100%',
    maxHeight: 'none'  // Remover restricción de altura máxima
  }
})

const containerStyle = computed(() => {
  const deviceWidth = props.device?.width || 430
  const deviceHeight = props.device?.height || 1600  // Altura extrema para contenido completo
  
  return {
    width: `${deviceWidth}px`,
    height: `${deviceHeight}px`,
    maxWidth: '100%',
    maxHeight: 'none',  // Remover restricción de altura máxima
    margin: '0 auto', // Centrar horizontalmente
    transform: `scale(${props.zoomLevel})`,
    transformOrigin: 'top center'
  }
})

// Methods
function setupPostMessageCommunication() {
  // Escuchar mensajes del iframe
  window.addEventListener('message', handlePostMessage)
  console.log('📡 Post-message communication setup complete')
  
  // Timeout para detectar si la aplicación no implementa PostMessage
  setTimeout(() => {
    if (messagesReceived.value === 0) {
      console.log('⚠️ No PostMessage received - app may not implement communication protocol')
      // No mostrar error, simplemente continuar
    }
  }, 3000)
}

function handlePostMessage(event: MessageEvent) {
  // Filtrar mensajes de React DevTools y otros sistemas internos
  if (event.data?.source === 'react-devtools-content-script' || 
      event.data?.source === 'react-devtools-bridge' ||
      event.data?.source === 'webpack-dev-server') {
    return // Ignorar estos mensajes silenciosamente
  }
  
  // Verificar origen por seguridad (temporalmente más permisivo para debugging)
  const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000']
  if (!allowedOrigins.includes(event.origin) && event.origin !== window.location.origin) {
    console.warn('🚫 Message from unauthorized origin:', event.origin, 'Expected:', allowedOrigins)
    return
  }
  
  console.log('📨 Message received from iframe:', event.data)
  messagesReceived.value++
  
  const { type, data } = event.data
  
  switch (type) {
    case 'MICROFRONTEND_READY':
      console.log('✅ Microfrontend is ready')
      // El microfrontend está listo, podemos ocultar el loading
      loading.value = false
      break
      
    case 'STEP_COMPLETED':
      console.log('✅ Step completed with data:', data)
      emit('next', data)
      break
      
    case 'STEP_PREVIOUS':
      console.log('⬅️ Previous step requested')
      emit('previous', data || {})
      break
      
    case 'ERROR':
      console.error('❌ Error from microfrontend:', data)
      error.value = data?.message || 'Error en la aplicación externa'
      emit('error', error.value || 'Error desconocido')
      break
      
    case 'RESIZE_REQUEST':
      console.log('📐 Resize request:', data)
      // Manejar solicitudes de redimensionamiento si es necesario
      break
      
    default:
      console.log('🔔 Unknown message type:', type)
  }
}

function sendInitialConfig() {
  // Esperar un poco más para asegurar que el iframe esté completamente cargado
  setTimeout(() => {
    if (!microfrontendFrame.value?.contentWindow) {
      console.warn('⚠️ Cannot send config - iframe not ready')
      return
    }
    
    // Serializar correctamente los datos para evitar el error de Proxy
    const deviceData = props.device ? {
      id: props.device.id,
      label: props.device.label,
      width: props.device.width,
      height: props.device.height,
      userAgent: props.device.userAgent
    } : null
    
    const stepData = props.wizardStep ? {
      id: props.wizardStep.id,
      componentId: props.wizardStep.componentData?.customTypeId,
      title: props.wizardStep.title
    } : null
    
    const config = {
      type: 'FLOW_CONFIG',
      data: {
        sessionId: props.sessionId,
        userId: props.userId,
        stepId: stepData?.id,
        componentId: stepData?.componentId,
        device: deviceData,
        zoomLevel: props.zoomLevel,
        theme: 'default',
        timestamp: Date.now()
      }
    }
    
    console.log('📤 Sending initial config to iframe:', config)
    
    try {
      microfrontendFrame.value.contentWindow.postMessage(config, '*')
      messagesSent.value++
      console.log('✅ Initial config sent successfully')
    } catch (error) {
      console.error('❌ Error sending initial config:', error)
    }
  }, 1000) // Esperar 1 segundo para que el iframe esté completamente listo
}

function sendMessage(type: string, data?: any) {
  if (!microfrontendFrame.value?.contentWindow) {
    console.warn('⚠️ Cannot send message - iframe not ready')
    return
  }
  
  const message = { type, data }
  console.log('📤 Sending message to iframe:', message)
  
  try {
    microfrontendFrame.value.contentWindow.postMessage(message, '*') // Usar '*' temporalmente
    messagesSent.value++
    console.log('✅ Message sent successfully')
  } catch (error) {
    console.error('❌ Error sending message:', error)
  }
}

function retryLoad() {
  console.log('🔄 Retrying iframe load...')
  loading.value = true
  error.value = null
  
  // Forzar recarga del iframe
  if (microfrontendFrame.value) {
    microfrontendFrame.value.src = microfrontendUrl.value
  }
}

function skipStep() {
  console.log('⏭️ Skipping current step')
  emit('next', { 
    skipped: true, 
    reason: 'Microfrontend load failed',
    timestamp: new Date().toISOString()
  })
}

function handleOverlayClick() {
  console.log('🔘 Overlay clicked - focus iframe')
  microfrontendFrame.value?.focus()
}

// Watchers
watch(() => props.wizardStep, (newStep, oldStep) => {
  if (newStep?.id !== oldStep?.id) {
    console.log('🔄 Wizard step changed, updating config...')
    // Pequeño delay para asegurar que el iframe esté listo
    setTimeout(() => {
      sendMessage('STEP_CHANGED', {
        stepId: newStep?.id,
        componentId: newStep?.componentData?.customTypeId
      })
    }, 100)
  }
}, { deep: true })

watch(() => props.device, (newDevice) => {
  if (newDevice && !loading.value) {
    console.log('📱 Device changed:', newDevice.label, `${newDevice.width}x${newDevice.height}`)
    
    // Serializar correctamente los datos del device
    const deviceData = {
      id: newDevice.id,
      label: newDevice.label,
      width: newDevice.width,
      height: newDevice.height,
      userAgent: newDevice.userAgent
    }
    
    sendMessage('DEVICE_CHANGED', {
      device: deviceData,
      viewport: {
        width: newDevice.width,
        height: newDevice.height
      },
      timestamp: Date.now()
    })
    
    // También enviar evento de resize para apps que escuchen window.resize
    sendMessage('RESIZE', {
      width: newDevice.width,
      height: newDevice.height
    })
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  console.log('🔧 IframeMicrofrontendView mounted')
  console.log('🌐 Loading URL:', microfrontendUrl.value)
  
  // Setup PostMessage listener inmediatamente
  setupPostMessageCommunication()
  
  // Usar un timeout más corto y directo
  setTimeout(() => {
    console.log('✅ Setting iframe as loaded')
    loading.value = false
    
    // Enviar configuración inicial
    sendInitialConfig()
    
    // Intentar ajustar altura automáticamente después de cargar
    setTimeout(() => {
      autoAdjustHeight()
    }, 2000)
    
    emit('ready', {
      componentId: props.componentId,
      stepId: props.stepId
    })
  }, 800) // Reducido a 800ms para carga más rápida
})

// Nueva función para ajustar altura automáticamente
function autoAdjustHeight() {
  console.log('📐 Intentando ajustar altura automáticamente...')
  
  if (!microfrontendFrame.value) {
    console.warn('⚠️ No se encontró referencia al iframe')
    return
  }
  
  try {
    // Intentar medir el contenido interno
    const iframe = microfrontendFrame.value
    const contentHeight = iframe.scrollHeight
    const visibleHeight = iframe.clientHeight
    
    console.log(`📊 Medición: contenido=${contentHeight}px, visible=${visibleHeight}px`)
    
    if (contentHeight > visibleHeight) {
      console.log(`🔧 Ajustando altura: +${contentHeight - visibleHeight}px necesarios`)
      // Emitir evento para notificar que se necesita más altura
      emit('heightAdjustment', { 
        currentHeight: visibleHeight, 
        requiredHeight: contentHeight,
        difference: contentHeight - visibleHeight 
      })
    } else {
      console.log('✅ Altura actual es suficiente')
    }
  } catch (error) {
    console.warn('⚠️ No se pudo medir contenido automáticamente:', error instanceof Error ? error.message : String(error))
  }
}

onUnmounted(() => {
  console.log('🔧 IframeMicrofrontendView unmounted')
  // Limpiar event listeners
  window.removeEventListener('message', handlePostMessage)
})
</script>

<style scoped>
.iframe-microfrontend-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: transparent;
  padding: 0;
  box-sizing: border-box;
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
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-url {
  font-size: 12px;
  color: #999;
  font-family: monospace;
  word-break: break-all;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  text-align: center;
}

.error-icon svg {
  filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.2));
}

.error-state h3 {
  color: #ef4444;
  margin: 0;
  font-size: 18px;
}

.error-message {
  color: #666;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.iframe-container {
  position: relative;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  background: transparent;
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
  border-radius: 8px;
}

.microfrontend-iframe {
  width: 100%;
  height: 100% !important;
  border: none;
  border-radius: 8px;
  background: white;
  display: block;
  overflow: hidden;
}

.iframe-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 1;
  cursor: pointer;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .iframe-microfrontend-container {
    padding: 10px;
  }
  
  .loading-state,
  .error-state {
    padding: 20px;
  }
}
</style>
