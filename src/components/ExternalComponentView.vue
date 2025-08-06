<template>
  <div class="external-component-container">
    <!-- Siempre tener el punto de montaje disponible pero oculto según el estado -->
    <div 
      id="component-mount-point" 
      class="component-wrapper" 
      :style="{ 
        display: !loading && !error ? 'flex' : 'none',
        '--component-zoom': zoomLevel || 0.85
      }"
    >
      <!-- El componente web se montará aquí -->
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando componente externo...</p>
    </div>
    
    <div v-if="error" class="error-container">
      <h3>⚠️ Error al cargar el componente</h3>
      <p>{{ error }}</p>
    </div>
    
    <div class="component-info" v-if="componentInfo">
      <span class="component-tag">{{ componentInfo.id }} v{{ componentInfo.version }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { ExternalComponentLoader } from '../services/ExternalComponentLoader';
import { MockComponentRegistry } from '../services/MockComponentRegistry';

// Props
const props = defineProps<{
  wizardStep: {
    componentData?: {
      customTypeId?: string;
      componentVersion?: string;
    };
  };
  zoomLevel?: number; // Nivel de zoom para el componente
}>();

// Emits
const emit = defineEmits(['next', 'previous', 'ready', 'error']);

// Variables reactivas
const loading = ref(true);
const error = ref<string | null>(null);
const componentInfo = ref<any>(null);
const componentInstance = ref<any>(null);
const outputData = ref<any>({}); // Almacenar datos de salida del componente

// Variables de sesión para simular
const sessionId = `sim-${Date.now()}`;
const flowContext = {
  sessionId,
  currentStep: props.wizardStep?.componentData?.customTypeId,
  simulationMode: true
};

// Función para cargar el componente externo
async function loadExternalComponent() {
  if (!props.wizardStep?.componentData?.customTypeId) {
    error.value = 'ID de componente no especificado';
    loading.value = false;
    emit('error', 'ID de componente no especificado');
    return;
  }
  
  const customTypeId = props.wizardStep.componentData.customTypeId;
  const version = props.wizardStep.componentData.componentVersion || '1.0.0';
  
  try {
    console.log(`🔄 Cargando componente externo: ${customTypeId} v${version}`);
    
    // Verificar todos los componentes disponibles en ambos registros
    console.log('Componentes disponibles en MockComponentRegistry:', 
                MockComponentRegistry.getAllComponents().map(c => c.id));
    console.log('Componentes registrados en ExternalComponentLoader:', 
                ExternalComponentLoader.getRegisteredComponentIds());
    console.log(`¿Está registrado '${customTypeId}' en ExternalComponentLoader?:`,
                ExternalComponentLoader.isRegistered(customTypeId));
    
    // Obtener configuración del componente
    const componentConfig = MockComponentRegistry.getComponent(customTypeId);
    if (!componentConfig) {
      throw new Error(`Componente no encontrado en el registro: ${customTypeId}`);
    }
    
    // Guardar info del componente
    componentInfo.value = {
      id: componentConfig.id,
      name: componentConfig.name,
      version: componentConfig.version,
      tagName: componentConfig.metadata.tagName
    };
    
    // Limpiar cualquier contenido previo
    const mountPoint = document.getElementById('component-mount-point');
    if (!mountPoint) {
      console.error('❌ Punto de montaje component-mount-point no encontrado en el DOM');
      throw new Error('Punto de montaje no disponible para el componente');
    }
    
    // Limpiar el punto de montaje antes de añadir un nuevo componente
    mountPoint.innerHTML = '';
    console.log('✅ Punto de montaje encontrado y limpiado');
    
    // Cargar el componente web sin depender de refs
    await ExternalComponentLoader.loadComponent(customTypeId, version)
      .catch(async (err) => {
        console.warn(`Error al cargar componente con loader, intentando registro manual:`, err);
        // Registrar si no está registrado
        if (!ExternalComponentLoader.isRegistered(customTypeId)) {
          ExternalComponentLoader.registerComponent(componentConfig);
          return ExternalComponentLoader.loadComponent(customTypeId, version);
        }
        throw err;
      })
      .catch(async (err) => {
        console.warn(`Error después del registro manual, cargando script directamente:`, err);
        // Intentar cargar el script directamente como último recurso
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = componentConfig.cdnUrl;
          script.async = true;
          script.onload = () => {
            console.log(`✅ Script cargado manualmente: ${componentConfig.cdnUrl}`);
            resolve();
          };
          script.onerror = (e) => reject(new Error(`Error al cargar script: ${e}`));
          document.head.appendChild(script);
        });
      });
      
    // Montar el componente usando el DOM API directamente
    console.log(`🔄 Montando componente: ${componentConfig.metadata.tagName}`);
    
    // Verificar que el elemento custom esté definido
    const customElementName = componentConfig.metadata.tagName;
    console.log(`🔍 Verificando custom element: ${customElementName}`);
    console.log(`🔍 customElements.get('${customElementName}'):`, customElements.get(customElementName));
    console.log(`🔍 Lista de todos los custom elements definidos:`, 
                Object.getOwnPropertyNames(window).filter(name => name.includes('Element')));
    
    if (!customElements.get(customElementName)) {
      console.warn(`⚠️ Custom element '${customElementName}' no está registrado en customElements`);
      // Esperar un poco y reintentar
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`🔍 Segundo intento - customElements.get('${customElementName}'):`, customElements.get(customElementName));
      if (!customElements.get(customElementName)) {
        throw new Error(`Custom element '${customElementName}' no está disponible después del delay`);
      }
    }
    
    console.log(`✅ Custom element '${customElementName}' está registrado`);
    
    // Crear elemento con manejo de errores
    let element;
    try {
      console.log(`🔄 Intentando crear elemento: ${customElementName}`);
      element = document.createElement(customElementName);
      console.log(`✅ Elemento '${customElementName}' creado exitosamente`);
      console.log(`📊 Tipo de elemento creado:`, typeof element, element.constructor.name);
    } catch (createError: any) {
      console.error(`❌ Error al crear elemento '${customElementName}':`, createError);
      throw new Error(`Error al crear el elemento: ${createError.message || createError}`);
    }
    
    componentInstance.value = element;
    
    // Configurar atributos de entrada
    element.setAttribute('session-id', sessionId);
    element.setAttribute('user-id', `user-${sessionId.split('-')[1]}`); // Generar user-id basado en session
    
    // Configurar objeto config
    const config = {
      theme: 'dark',
      showFooter: true,
      simulationMode: true,
      zoomLevel: props.zoomLevel || 0.85
    };
    element.setAttribute('config', JSON.stringify(config));
    
    // Configurar flow-context expandido
    const expandedFlowContext = {
      ...flowContext,
      currentStep: 1,
      totalSteps: 4,
      componentId: props.wizardStep?.componentData?.customTypeId,
      componentVersion: props.wizardStep?.componentData?.componentVersion || '1.0.0'
    };
    element.setAttribute('flow-context', JSON.stringify(expandedFlowContext));
    
    console.log('🔧 Atributos configurados:');
    console.log('  - session-id:', sessionId);
    console.log('  - user-id:', `user-${sessionId.split('-')[1]}`);
    console.log('  - config:', JSON.stringify(config, null, 2));
    console.log('  - flow-context:', JSON.stringify(expandedFlowContext, null, 2));
    
    // Añadir eventos
    element.addEventListener('component-ready', handleComponentReady);
    element.addEventListener('output-data', handleOutputData);
    element.addEventListener('request-navigation', handleNavigation);
    element.addEventListener('node-error', handleComponentError);
    console.log(`🎧 Event listeners configurados para el componente`);
    
    // Obtener punto de montaje actualizado
    const finalMountPoint = document.getElementById('component-mount-point');
    if (!finalMountPoint) {
      throw new Error('Punto de montaje no disponible después de la preparación');
    }
    
    // Montar componente
    finalMountPoint.appendChild(element);
    console.log(`✅ Componente montado exitosamente en #component-mount-point`);
    
    loading.value = false;
  } catch (err: any) {
    console.error('Error al cargar componente externo:', err);
    error.value = err?.message || 'Error al cargar componente';
    loading.value = false;
    emit('error', error.value);
  }
}

// Handlers de eventos
function handleComponentReady(event: Event) {
  console.log('🎉 Componente externo listo:', event);
  console.log('📋 Detalles del evento component-ready:', (event as CustomEvent).detail);
  emit('ready', event);
}

function handleOutputData(event: any) {
  console.log('📤 Datos de salida del componente:', event.detail);
  
  // Almacenar datos de salida
  outputData.value = { ...outputData.value, ...event.detail };
  
  // Extraer parámetros específicos si están presentes
  const { horaInicio, horaFin, ...otherData } = event.detail || {};
  
  if (horaInicio) {
    console.log('⏰ Hora de inicio capturada:', horaInicio);
  }
  
  if (horaFin) {
    console.log('⏰ Hora de fin capturada:', horaFin);
  }
  
  if (Object.keys(otherData).length > 0) {
    console.log('📋 Otros datos capturados:', otherData);
  }
  
  // Crear objeto estructurado con todos los datos
  const structuredData = {
    sessionId,
    componentId: props.wizardStep?.componentData?.customTypeId,
    timestamp: new Date().toISOString(),
    outputParameters: {
      horaInicio,
      horaFin,
      ...otherData
    },
    allData: event.detail
  };
  
  console.log('🔄 Avanzando al siguiente paso con datos estructurados:', structuredData);
  emit('next', structuredData);
}

function handleNavigation(event: any) {
  console.log('🧭 Solicitud de navegación:', event.detail);
  if (event.detail?.direction === 'previous') {
    console.log('⬅️ Navegando hacia atrás');
    emit('previous');
  }
}

function handleComponentError(event: any) {
  console.error('🚨 Error en componente externo:', event.detail);
  error.value = event.detail?.message || 'Error en el componente';
  emit('error', error.value);
}

// Función para obtener los datos de salida capturados
function getOutputData() {
  return outputData.value;
}

// Función para obtener parámetros específicos
function getOutputParameter(key: string) {
  return outputData.value[key];
}

// Función para limpiar los datos de salida
function clearOutputData() {
  outputData.value = {};
}

// Exponer funciones para uso externo
defineExpose({
  getOutputData,
  getOutputParameter,
  clearOutputData,
  componentInstance
});

// Lifecycle hooks
onMounted(() => {
  console.log('🔄 ExternalComponentView montado, inicializando carga del componente');
  setTimeout(() => {
    // Ejecutar con un pequeño delay para asegurar que el DOM está completamente renderizado
    loadExternalComponent();
  }, 100); // Un pequeño delay para asegurar que el DOM está listo
});

onBeforeUnmount(() => {
  // Limpiar el componente y los eventos
  if (componentInstance.value) {
    componentInstance.value.removeEventListener('component-ready', handleComponentReady);
    componentInstance.value.removeEventListener('output-data', handleOutputData);
    componentInstance.value.removeEventListener('request-navigation', handleNavigation);
    componentInstance.value.removeEventListener('node-error', handleComponentError);
    
    // Limpiar del DOM si está montado
    const mountPoint = document.getElementById('component-mount-point');
    if (mountPoint?.contains(componentInstance.value)) {
      mountPoint.removeChild(componentInstance.value);
    }
  }
});

// Observar cambios en el paso del wizard
watch(() => props.wizardStep?.componentData, () => {
  if (componentInstance.value) {
    // Si cambia el paso y ya tenemos un componente instanciado, actualizarlo
    componentInstance.value.setAttribute('flow-context', JSON.stringify({
      ...flowContext,
      currentStep: props.wizardStep?.componentData?.customTypeId
    }));
  }
}, { deep: true });
</script>

<style scoped>
.external-component-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%; /* Usar todo el espacio disponible */
  min-height: 0; /* Permitir que se comprima */
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background: #1e1e1e;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #fff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4caf50;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
  padding: 20px;
}

.component-wrapper {
  flex: 1;
  min-height: 0; /* Permitir que se comprima */
  overflow: hidden; /* Evitar scrollbars */
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Aplicar zoom dinámico al contenido del componente externo */
.component-wrapper #component-mount-point {
  width: 100%;
  height: 100%;
  transform: scale(var(--component-zoom, 0.85));
  transform-origin: top left;
  overflow: hidden;
  transition: transform 0.3s ease; /* Transición suave para el zoom */
}

/* Ajustar el contenedor para compensar el zoom dinámico */
.component-wrapper #component-mount-point > * {
  width: calc(100% / var(--component-zoom, 0.85));
  height: calc(100% / var(--component-zoom, 0.85));
}

.component-info {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
}

.component-tag {
  background-color: #333;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Responsive para pantallas pequeñas */
@media (max-width: 900px) {
  .external-component-container {
    height: 100%;
    min-height: 300px;
  }
  
  .component-tag {
    font-size: 10px;
    padding: 2px 6px;
  }
}
</style>
