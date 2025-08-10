// ...existing code...

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { getExternalComponentService } from '../services/components';
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

// Instancia del servicio de componentes externos
const componentService = getExternalComponentService();

// Handler para el botón de soporte en el fallback
function handleSupportClick() {
  console.log('[DummySupport] Botón de soporte presionado. Aquí se podría abrir un diálogo de soporte.');
}

// Handler para el botón de refresh en el fallback
function handleRefreshClick() {
  console.log('[DummyRefresh] Botón de refresh presionado. Reintentando cargar componente...');
  
  // Limpiar caché del ExternalComponentService completamente
  const componentService = getExternalComponentService();
  componentService.unloadAllComponents();
  console.log('[DummyRefresh] Caché de ExternalComponentService limpiado');
  
  // Limpiar cualquier custom element anterior del DOM
  const mountPoint = document.getElementById('component-mount-point');
  if (mountPoint) {
    mountPoint.innerHTML = '';
    console.log('[DummyRefresh] Punto de montaje limpiado');
  }
  
  // Resetear estados
  error.value = null;
  loading.value = true;
  componentInfo.value = null;
  componentInstance.value = null;
  
  console.log('[DummyRefresh] Estados reseteados, iniciando carga fresca del componente...');
  
  // Intentar cargar nuevamente después de un pequeño delay
  setTimeout(() => {
    loadExternalComponent();
  }, 500);
}

// Variables reactivas
const loading = ref(true);
const error = ref<string | null>(null);
const componentInfo = ref<any>(null);
const componentInstance = ref<any>(null);
const outputData = ref<any>({}); // Almacenar datos de salida del componente
const containerHeight = ref<number>(600); // Altura calculada del contenedor
// const showDummyView = ref(false); // Eliminar dummy/fallback

// Variables de sesión para simular
const sessionId = `sim-${Date.now()}`;
const flowContext = {
  sessionId,
  currentStep: props.wizardStep?.componentData?.customTypeId,
  simulationMode: true
};

// Función para calcular la altura del contenedor
function calculateContainerHeight() {
  const container = document.querySelector('.external-component-container') as HTMLElement;
  if (container && container.parentElement) {
    const parentHeight = container.parentElement.clientHeight;
    const containerStyles = getComputedStyle(container);
    const marginTop = parseInt(containerStyles.marginTop) || 0;
    const marginBottom = parseInt(containerStyles.marginBottom) || 0;
    const borderTop = parseInt(containerStyles.borderTopWidth) || 0;
    const borderBottom = parseInt(containerStyles.borderBottomWidth) || 0;

    // Obtener el nivel de zoom actual
    const zoomLevel = props.zoomLevel || 1.0;
    // Ajustar el alto del contenedor para que el contenido escalado siempre ocupe el área máxima
    const scaledHeight = (parentHeight - marginTop - marginBottom - borderTop - borderBottom - 5) / zoomLevel;
    containerHeight.value = Math.max(scaledHeight, 550);
    console.log('🔍 Altura calculada (ajustada por zoom):', containerHeight.value, 'px (padre:', parentHeight, 'px, zoom:', zoomLevel, ')');

    // Aplicar la altura inmediatamente al contenedor
    if (container) {
      container.style.height = `${containerHeight.value }px`;
    }
  }
}

// Watch para cambios en el zoomLevel
watch(() => props.zoomLevel, (newZoomLevel) => {
  console.log('🔍 ZoomLevel cambió a:', newZoomLevel);
  // Actualizar la variable CSS directamente en el elemento
  const mountPoint = document.getElementById('component-mount-point');
  if (mountPoint) {
    const zoomValue = String(newZoomLevel || 1.0);
    mountPoint.style.setProperty('--component-zoom', zoomValue);
    console.log('✅ Variable CSS --component-zoom actualizada a:', zoomValue);
    console.log('🔍 Transform actual del elemento:', getComputedStyle(mountPoint).transform);
  } else {
    console.warn('⚠️ No se encontró el elemento component-mount-point');
  }
  
  // Recalcular altura del contenedor cuando cambie el zoom
  setTimeout(() => {
    calculateContainerHeight();
  }, 50); // Pequeño delay para que el transform se aplique completamente
}, { immediate: true });

// Función para cargar el componente externo
async function loadExternalComponent() {
  if (!props.wizardStep?.componentData?.customTypeId) {
    error.value = 'ID de componente no especificado';
    loading.value = false;
    emit('error', 'ID de componente no especificado');
    console.error('[LOG] customTypeId no especificado en wizardStep:', props.wizardStep);
    return;
  }

  const customTypeId = props.wizardStep.componentData.customTypeId;
  const version = props.wizardStep.componentData.componentVersion || '1.0.0';

  try {
    console.log(`🔄 Cargando componente externo: ${customTypeId} v${version}`);
    console.log('[LOG] wizardStep:', props.wizardStep);
    // Verificar todos los componentes disponibles en ambos registros
    const allMock = MockComponentRegistry.getAllComponents();
    const allMockIds = allMock.map(c => c.id);
    console.log('[LOG] Componentes disponibles en MockComponentRegistry:', allMockIds);
    const allRegistered = componentService.getAllConfigs().map(c => c.id);
    console.log('[LOG] Componentes registrados en ExternalComponentService:', allRegistered);
    const isRegistered = componentService.isComponentLoaded(customTypeId);
    console.log(`[LOG] ¿Está registrado '${customTypeId}' en ExternalComponentService?:`, isRegistered);

    // Obtener configuración del componente
    const componentConfig = MockComponentRegistry.getComponent(customTypeId);
    if (!componentConfig) {
      console.warn(`[LOG] No se encontró el componente '${customTypeId}' en MockComponentRegistry.`);
      loading.value = false;
      error.value = `El microfrontend '${customTypeId}' no está disponible.`;
      emit('error', error.value);
      return;
    }
    console.log('[LOG] Configuración del componente encontrada:', componentConfig);

    // Guardar info del componente
    componentInfo.value = {
      id: componentConfig.id,
      name: componentConfig.name,
      version: componentConfig.version,
      tagName: componentConfig.metadata.tagName
    };

    // Limpiar cualquier contenido previo y remover elementos custom anteriores
    const mountPoint = document.getElementById('component-mount-point');
    if (!mountPoint) {
      console.error('[LOG] ❌ Punto de montaje component-mount-point no encontrado en el DOM');
      throw new Error('Punto de montaje no disponible para el componente');
    }

    // Limpiar el punto de montaje antes de añadir un nuevo componente
    mountPoint.innerHTML = '';
    
    // NUEVO: También remover cualquier instancia previa del custom element del documento
    const existingElements = document.querySelectorAll(componentConfig.metadata.tagName);
    existingElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
        console.log(`[LOG] 🧹 Elemento custom previo removido: ${componentConfig.metadata.tagName}`);
      }
    });
    
    console.log('[LOG] ✅ Punto de montaje encontrado y limpiado completamente');

        // Cargar el componente web usando el nuevo servicio
    try {
      await componentService.loadComponent(componentConfig);
      console.log(`[LOG] ✅ Componente cargado exitosamente: ${customTypeId}`);
    } catch (loadError: any) {
      console.warn(`[LOG] Error al cargar componente:`, loadError);
      // Intentar cargar el script directamente como último recurso
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = componentConfig.cdnUrl;
        script.async = true;
        script.onload = () => {
          console.log(`[LOG] ✅ Script cargado manualmente: ${componentConfig.cdnUrl}`);
          resolve();
        };
        script.onerror = (e) => {
          console.error(`[LOG] ❌ Error al cargar script:`, e);
          reject(new Error(`Error al cargar script: ${e}`));
        };
        document.head.appendChild(script);
      });
    }

    // Montar el componente usando el DOM API directamente
    console.log(`[LOG] 🔄 Montando componente: ${componentConfig.metadata.tagName}`);

    // Verificar que el elemento custom esté definido
    const customElementName = componentConfig.metadata.tagName;
    let customElementObj = customElements.get(customElementName);
    console.log(`[LOG] 🔍 Verificando custom element: ${customElementName}`);
    console.log(`[LOG] customElements.get('${customElementName}'):`, customElementObj);
    console.log(`[LOG] Lista de todos los custom elements definidos:`, Object.getOwnPropertyNames(window).filter(name => name.includes('Element')));

    if (!customElementObj) {
      console.warn(`[LOG] ⚠️ Custom element '${customElementName}' no está registrado en customElements. Realizando health check adicional...`);
      
      // NUEVO: Realizar health check adicional antes de esperar
      try {
        const healthCheckResponse = await fetch(componentConfig.healthcheck.url, {
          method: 'GET',
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        console.log(`[LOG] 🏥 Health check response status: ${healthCheckResponse.status}`);
        
        if (healthCheckResponse.status !== 200) {
          console.warn(`[LOG] ❌ Health check falló: ${healthCheckResponse.status}`);
          loading.value = false;
          error.value = `El microfrontend '${customTypeId}' no está disponible. Servidor responde: ${healthCheckResponse.status}`;
          emit('error', error.value);
          return;
        }
        
        console.log(`[LOG] ✅ Health check exitoso, esperando registro del custom element...`);
      } catch (healthError) {
        console.warn(`[LOG] ❌ Error en health check:`, healthError);
        loading.value = false;
        error.value = `El microfrontend '${customTypeId}' no está disponible. No se puede conectar al servidor.`;
        emit('error', error.value);
        return;
      }
      
      // Esperar con múltiples intentos
      let retryCount = 0;
      const maxRetries = 10; // 5 segundos máximo
      
      while (!customElementObj && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500));
        customElementObj = customElements.get(customElementName);
        retryCount++;
        console.log(`[LOG] Intento ${retryCount}/${maxRetries} - customElements.get('${customElementName}'):`, customElementObj);
      }
      
      if (!customElementObj) {
        console.warn(`[LOG] ❌ Custom element '${customElementName}' no se registró después de ${maxRetries} intentos.`);
        loading.value = false;
        error.value = `El microfrontend '${customElementName}' no está disponible para este paso.`;
        emit('error', error.value);
        return;
      }
    }

    console.log(`[LOG] ✅ Custom element '${customElementName}' está registrado después de verificaciones`);

    // Crear elemento con manejo de errores
    let element;
    try {
      console.log(`[LOG] 🔄 Intentando crear elemento: ${customElementName}`);
      element = document.createElement(customElementName);
      console.log(`[LOG] ✅ Elemento '${customElementName}' creado exitosamente`);
      console.log(`[LOG] 📊 Tipo de elemento creado:`, typeof element, element.constructor.name);
    } catch (createError: any) {
      console.error(`[LOG] ❌ Error al crear elemento '${customElementName}':`, createError);
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
      simulationMode: false, // Cambiar a false para que se vea igual que el acceso directo
      zoomLevel: props.zoomLevel || 1.0,
      // Agregar información de dimensiones para que el componente se ajuste
      containerDimensions: {
        width: '100%',
        height: '100%',
        minHeight: '600px', // Aumentar altura mínima
        maxWidth: '100%',   // NUEVO: Limitar ancho máximo
        maxHeight: '100%',  // NUEVO: Limitar altura máxima
        forceFullHeight: true,
        containment: true,  // NUEVO: Indicar al componente que debe contenerse
        isModal: true,      // NUEVO: Indicar que está dentro de un modal
        parentContainer: 'wizard-modal', // NUEVO: Identificar el contenedor padre
        // NUEVO: Información específica sobre el contexto de altura
        heightContext: {
          useContainerHeight: true,  // NO usar 100vh
          respectParentDimensions: true,
          availableHeight: `${containerHeight.value}px`,
          viewportUsage: 'container-relative' // No viewport-relative
        }
      }
    };
    element.setAttribute('config', JSON.stringify(config));

    // HACK ESPECÍFICO para ine-validation-component: forzar altura via CSS inline
    if (customElementName === 'ine-validation-component') {
      // SOLUCIÓN RADICAL: Calcular altura exacta del contenedor disponible
      const availableHeight = containerHeight.value - 20; // 20px de margen de seguridad
      
      element.style.height = `${availableHeight}px`; // Altura específica en pixels, no porcentaje
      element.style.minHeight = `${availableHeight}px`;
      element.style.maxHeight = `${availableHeight}px`; // Altura exacta, sin flexibilidad
      element.style.display = 'flex';
      element.style.flexDirection = 'column';
      // NUEVO: Contención adicional más agresiva
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.style.maxWidth = '100%';
      element.style.width = '100%';
      element.style.contain = 'strict';
      element.style.clipPath = 'inset(0)'; // Forzar recorte visual
      
      // NUEVO: Forzar que NO use viewport height con valores específicos
      element.style.setProperty('--viewport-height', `${availableHeight}px`);
      element.style.setProperty('--container-height', `${availableHeight}px`);
      element.style.setProperty('--max-height', `${availableHeight}px`);
      
      // NUEVO: Interceptar todas las variables CSS comunes que podrían usar 100vh
      element.style.setProperty('--vh', `${availableHeight/100}px`); // 1vh = altura/100
      element.style.setProperty('--full-height', `${availableHeight}px`);
      element.style.setProperty('--window-height', `${availableHeight}px`);
      
      console.log(`[LOG] 🔧 APLICADO: Estilos específicos para ine-validation-component con altura FIJA: ${availableHeight}px`);
    }

    // Configurar flow-context expandido
    const expandedFlowContext = {
      ...flowContext,
      currentStep: 1,
      totalSteps: 4,
      componentId: props.wizardStep?.componentData?.customTypeId,
      componentVersion: props.wizardStep?.componentData?.componentVersion || '1.0.0'
    };
    element.setAttribute('flow-context', JSON.stringify(expandedFlowContext));

    console.log('[LOG] 🔧 Atributos configurados:');
    console.log('  - session-id:', sessionId);
    console.log('  - user-id:', `user-${sessionId.split('-')[1]}`);
    console.log('  - config:', JSON.stringify(config, null, 2));
    console.log('  - flow-context:', JSON.stringify(expandedFlowContext, null, 2));

    // DEBUG: Log antes de agregar listeners
    console.log('[LOG] [DEBUG] Agregando event listeners al custom element', element);
    element.addEventListener('component-ready', handleComponentReady);
    element.addEventListener('output-data', handleOutputData);
    element.addEventListener('next-step', handleNextStep);
    element.addEventListener('request-navigation', handleNavigation);
    element.addEventListener('node-error', handleComponentError);
    // DEBUG: Log después de agregar listeners
    console.log('[LOG] [DEBUG] Event listeners agregados. Montando el custom element...');
// Handler para evento next-step (emitido por microfrontends)
function handleNextStep(event: any) {
  console.log('➡️ Evento next-step recibido:', event.detail);
  if (event) {
    console.log('🟢 [DEBUG] handleNextStep: Event recibido correctamente.');
    if (event.detail) {
      console.log('🟢 [DEBUG] handleNextStep: event.detail =', event.detail);
    } else {
      console.warn('🟡 [DEBUG] handleNextStep: event.detail está vacío');
    }
  } else {
    console.error('🔴 [DEBUG] handleNextStep: Event es undefined/null');
  }
  // Reutilizar la lógica de handleOutputData para estructurar y emitir los datos
  handleOutputData(event);
}
    console.log(`🎧 Event listeners configurados para el componente`);
    
    // Obtener punto de montaje actualizado
    const finalMountPoint = document.getElementById('component-mount-point');
    if (!finalMountPoint) {
      throw new Error('Punto de montaje no disponible después de la preparación');
    }
    
    // Montar el componente directamente, sin wrappers
    // Crear un wrapper con overflow auto y height 100%
    const wrapper = document.createElement('div');
    wrapper.style.overflow = 'auto';
    wrapper.style.height = '100%';
    wrapper.style.width = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.boxSizing = 'border-box';
    wrapper.appendChild(element);
    finalMountPoint.appendChild(wrapper);
    console.log(`[DEBUG] Custom element montado en el DOM dentro de wrapper`, element);
    console.log(`✅ Componente montado exitosamente en #component-mount-point (con wrapper)`);
    
    // INTERCEPTOR GLOBAL: Sobrescribir cualquier CSS que use 100vh
    //const originalStyle = window.getComputedStyle;
    const availableHeight = containerHeight.value - 0;
    
    // Interceptar getComputedStyle para elementos dentro del componente
   
    
    console.log(`🔒 INTERCEPTOR CSS aplicado para sobrescribir 100vh con ${availableHeight}px`);
    
   
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
  console.log('🟢 [DEBUG] handleOutputData: Iniciado con event:', event);
  if (event && event.detail) {
    console.log('🟢 [DEBUG] handleOutputData: event.detail =', event.detail);
  } else {
    console.warn('🟡 [DEBUG] handleOutputData: event o event.detail está vacío');
  }
  
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
  console.log('🟢 [DEBUG] handleOutputData: Emitiendo "next" con structuredData:', structuredData);
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
  
  // Calcular altura inicial
  setTimeout(() => {
    calculateContainerHeight();
  }, 50);
  
  // Escuchar cambios de tamaño de ventana
  window.addEventListener('resize', calculateContainerHeight);
  
  // Observador para cambios en el tamaño del elemento padre
  const resizeObserver = new ResizeObserver(() => {
    calculateContainerHeight();
  });
  
  // Observar el elemento padre cuando esté disponible
  const checkParent = () => {
    const container = document.querySelector('.external-component-container') as HTMLElement;
    if (container?.parentElement) {
      resizeObserver.observe(container.parentElement);
      console.log('🔍 ResizeObserver configurado en elemento padre');
      
      // NUEVO: Observador de mutaciones para detectar si el componente intenta escaparse
      const mutationObserver = new MutationObserver(() => {
        const mountedComponents = container.querySelectorAll('ine-validation-component, landing-web-component, sms-verification-component');
        mountedComponents.forEach((component) => {
          const htmlComponent = component as HTMLElement;
          if (htmlComponent.style.position === 'fixed' || htmlComponent.style.position === 'absolute') {
            htmlComponent.style.position = 'relative';
            console.log('🚨 CORREGIDO: Componente intentó escapar usando position fixed/absolute');
          }
        });
      });
      
      mutationObserver.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
    } else {
      setTimeout(checkParent, 100);
    }
  };
  checkParent();
  
  setTimeout(() => {
    // Ejecutar con un pequeño delay para asegurar que el DOM está completamente renderizado
    loadExternalComponent();
  }, 100); // Un pequeño delay para asegurar que el DOM está listo
});

onBeforeUnmount(() => {
  // Limpiar event listener de resize
  window.removeEventListener('resize', calculateContainerHeight);
  
  // Desconectar el ResizeObserver
  const container = document.querySelector('.external-component-container') as HTMLElement;
  if (container?.parentElement) {
    // El ResizeObserver se desconecta automáticamente cuando el componente se desmonta
    console.log('🔍 Limpiando ResizeObserver');
  }
  
  // Limpiar el componente y los eventos
  if (componentInstance.value) {
    componentInstance.value.removeEventListener('component-ready', handleComponentReady);
    componentInstance.value.removeEventListener('output-data', handleOutputData);
    componentInstance.value.removeEventListener('request-navigation', handleNavigation);
    componentInstance.value.removeEventListener('node-error', handleComponentError);
    // Limpiar del DOM si está montado, solo si tiene parentNode
    if (componentInstance.value.parentNode) {
      componentInstance.value.parentNode.removeChild(componentInstance.value);
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

<template>
  <!-- <div class="external-component-container" :style="{ height: '100% !important;'}"> -->
    <div class="external-component-container" :style="{ height: `${containerHeight+0}px`, overflowY: 'auto', width: '50%' }">
      <div class="external-component-header">
      </div>
    <!-- Wrapper para scroll y control de altura -->
    <div style="overflow-y: auto;width: auto; 
    display: flex; flex-direction: column; box-sizing: border-box;
    border-radius: 8px !important;background-color: ghostwhite;padding-top: 8px !important; margin: 8px !important;
    border-width: thin;border-style: solid;padding-bottom: 20px; ">
      <!-- Siempre tener el punto de montaje disponible pero oculto según el estado -->
      <div 
        id="component-mount-point" 
        class="component-mount-point" 
        :style="{ 
          display: !loading && !error ? 'flex' : 'none',
          '--component-zoom': props.zoomLevel || 1.0,
        }"
      >
        <!-- El componente web se montará aquí -->
      </div>
    </div>
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando componente externo...</p>
    </div>
 
  </div>
  <div v-if="error" 
       style="position: fixed !important; 
              top: 250px !important; 
              left: 43% !important; 
              transform: translateX(-50%) !important; 
              width: 85% !important; 
              max-width: 550px !important; 
              background: rgba(40,40,40,0.96) !important; 
              color: #fff !important; 
              border: 1px solid #444 !important; 
              border-radius: 8px !important; 
              padding: 20px 28px !important; 
              box-sizing: border-box !important; 
              z-index: 9999 !important; 
              pointer-events: auto !important; 
              text-align: left !important; 
              display: block !important; 
              box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;">
    <div style="font-size: 2.5rem !important; margin-bottom: 12px !important; display: block !important; opacity: 0.8 !important;">⚠️</div>
    <h3 style="color: #fff !important; margin: 0 0 12px 0 !important; font-size: 1.2rem !important; font-weight: 500 !important;">Componente no disponible</h3>
    <p style="margin-bottom: 16px !important; color: #ccc !important; font-size: 0.9rem !important; line-height: 1.4 !important;">
      El microfrontend <strong style="color: #ffeb3b !important;">'{{ props.wizardStep?.componentData?.customTypeId || 'desconocido' }}'</strong> requerido para este paso no está disponible temporalmente.<br>
      <span style="color:#ffa8a8 !important;">Intente más tarde o contacte al soporte técnico.</span>
    </p>
    <div style="display: flex !important; gap: 12px !important; align-items: center !important;">
      <button @click="handleRefreshClick"
              style="margin-top: 16px !important;
                     padding: 8px 12px !important;
                     background: #4caf50 !important;
                     color: #fff !important;
                     border: none !important;
                     border-radius: 6px !important;
                     font-size: 0.9rem !important;
                     font-weight: 500 !important;
                     cursor: pointer !important;
                     box-shadow: 0 2px 6px rgba(76, 175, 80, 0.2) !important;
                     transition: background 0.2s, box-shadow 0.2s !important;
                     outline: none !important;
                     box-sizing: border-box !important;
                     z-index: 10000 !important;
                     display: flex !important;
                     align-items: center !important;
                     gap: 6px !important;"
              @mouseover="($event.target as HTMLElement).style.background='#388e3c'"
              @mouseout="($event.target as HTMLElement).style.background='#4caf50'">
        <span style="font-size: 1rem !important;">🔄</span>
        Reintentar
      </button>
      <button @click="handleSupportClick"
              style="margin-top: 16px !important;
                     padding: 8px 20px !important;
                     background: #ff1744 !important;
                     color: #fff !important;
                     border: none !important;
                     border-radius: 6px !important;
                     font-size: 0.9rem !important;
                     font-weight: 500 !important;
                     cursor: pointer !important;
                     box-shadow: 0 2px 6px rgba(255, 23, 68, 0.2) !important;
                     transition: background 0.2s, box-shadow 0.2s !important;
                     outline: none !important;
                     box-sizing: border-box !important;
                     z-index: 10000 !important;"
              @mouseover="($event.target as HTMLElement).style.background='#d50000'"
              @mouseout="($event.target as HTMLElement).style.background='#ff1744'">
        Reportar problema
      </button>
    </div>
  </div>
</template>



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

