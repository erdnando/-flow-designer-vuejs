<template>
  <div class="external-component-container" :style="[deviceStyle, { overflow: 'hidden' }]">
      <!-- Punto de montaje sin wrappers adicionales -->
      <div 
        id="component-mount-point" 
        class="component-mount-point" 
        :style="{ 
          display: !loading && !error ? 'block' : 'none',
          '--component-zoom': props.zoomLevel || 1.0,
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          margin: 0,
          padding: 0,
        }"
      >
        <!-- El componente web se montará aquí -->
      </div>
    <!-- </div> -->
    <div v-if="loading" class="loading-container" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
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
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
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
  zoomLevel?: number;           // Nivel de zoom para el componente
  device?: {                    // Preset de dispositivo para simular viewport
    label: string;
    width: number;
    height: number;
  };
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
// Altura calculada del contenedor (puede ser override por deviceStyle)
const containerHeight = ref<number>(932);

// Computed para estilo del contenedor según props.device
const deviceStyle = computed(() => {
  if (props.device) {
    return { width: `${props.device.width}px`, height: `${props.device.height}px` };
  }
  // Si no hay preset de dispositivo, ocupar todo el contenedor
  console.log('setting default dimensions 100%...')
  return { width: '100%', height: '100%' };
});

// Computed para exponer availableHeight dinámicamente
const availableHeight = computed(() => {
  // Usar el mismo cálculo que en config.heightContext
  if (props.device?.height) return props.device.height;
  return containerHeight.value ? containerHeight.value + 100 : undefined;
});
// Variables de sesión para simular
const sessionId = `sim-${Date.now()}`;
const flowContext = {
  sessionId,
  currentStep: props.wizardStep?.componentData?.customTypeId,
  simulationMode: true
};

// Función para calcular la altura del contenedor
function calculateContainerHeight() {
  // Si se está usando un preset de dispositivo, no alterar la altura del contenedor
  if (props.device) {
    console.log('🎚️ Usando dispositivo preset, se omite ajuste de altura');
    return;
  }
  const container = document.querySelector('.landing-web-component') as HTMLElement;
  if (container && container.parentElement) {
    const parentHeight = container.parentElement.clientHeight;
    //const parentWidth = container.parentElement.clientWidth;
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
      // No aplicar estilo inline cuando se usa preset de dispositivo
      container.style.height = '';
    }
  }
  /* 
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
      // No aplicar estilo inline cuando se usa preset de dispositivo
      container.style.height = '';
    }
  } */
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
  }, 50); 
  // Pequeño delay para que el transform se aplique completamente

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

    // Configurar objeto config con dimensiones del dispositivo seleccionado
    const config = {
      theme: 'dark',
      showFooter: false,
      simulationMode: false,
      zoomLevel: props.zoomLevel || 1.0,
      // Pasar las dimensiones exactas del dispositivo seleccionado
      containerDimensions: {
        width: props.device?.width ? `${props.device.width}px` : '100%',
        height: props.device?.height ? `${props.device.height}px` : '100%',
        deviceWidth: props.device?.width || window.innerWidth,
        deviceHeight: props.device?.height || window.innerHeight,
        deviceLabel: props.device?.label || 'Default',
        containment: true,
        isModal: true,
        parentContainer: 'wizard-modal',
        // Información específica del viewport simulado
        viewport: {
          width: props.device?.width || window.innerWidth,
          height: props.device?.height || window.innerHeight,
          type: 'simulated',
          responsive: true
        }
      }
    };
    element.setAttribute('config', JSON.stringify(config));

    // FORZAR dimensiones directamente en el elemento custom
    if (props.device) {
      element.style.width = `${props.device.width}px`;
      element.style.height = `${props.device.height}px`;
      element.style.maxWidth = `${props.device.width}px`;
      element.style.maxHeight = `${props.device.height}px`;
      element.style.minWidth = `${props.device.width}px`;
      element.style.minHeight = `${props.device.height}px`;
      element.style.display = 'block';
      element.style.overflow = 'hidden';
      element.style.boxSizing = 'border-box';
      
      // AGREGAR CSS custom properties que el microfrontend puede leer
      element.style.setProperty('--simulator-width', `${props.device.width}px`);
      element.style.setProperty('--simulator-height', `${props.device.height}px`);
      element.style.setProperty('--container-width', `${props.device.width}px`);
      element.style.setProperty('--container-height', `${props.device.height}px`);
      
      console.log(`🎯 Dimensiones forzadas en elemento inicial: ${props.device.width}x${props.device.height}px`);
      
      // INTERCEPTAR y sobrescribir cualquier intento del microfrontend de cambiar su tamaño
      const originalSetProperty = element.style.setProperty;
      element.style.setProperty = function(property: string, value: string, priority?: string) {
        // Interceptar intentos de cambiar width/height
        if (property === 'width' && props.device) {
          console.log(`🚫 Interceptado intento de cambiar width a ${value}, manteniendo ${props.device.width}px`);
          return originalSetProperty.call(this, property, `${props.device.width}px`, priority);
        }
        if (property === 'height' && props.device) {
          console.log(`🚫 Interceptado intento de cambiar height a ${value}, manteniendo ${props.device.height}px`);
          return originalSetProperty.call(this, property, `${props.device.height}px`, priority);
        }
        return originalSetProperty.call(this, property, value, priority);
      };
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
    
  // Montar el microfrontend directamente sin contenedor intermedio
  finalMountPoint.appendChild(element);
    
    // FORZAR que el microfrontend detecte el resize y se redibuje
    setTimeout(() => {
      // Disparar evento resize para que el microfrontend recalcule su layout
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
      
      // Si el microfrontend tiene un método para forzar redraw
      if ('forceResize' in element && typeof (element as any).forceResize === 'function') {
        (element as any).forceResize();
      }
      
      // Disparar eventos de resize específicos al elemento
      element.dispatchEvent(new Event('resize'));
      
      console.log(`✅ Eventos de resize disparados para forzar recálculo del layout`);
    }, 100);
    
    console.log(`[DEBUG] Custom element montado en el DOM`, element);
    console.log(`✅ Componente montado exitosamente en #component-mount-point (con wrapper)`);
    
    // Verificar dimensiones aplicadas y contenido interno
    const computedStyle = window.getComputedStyle(element);
    console.log('🔍 Dimensiones del microfrontend después de montar:', {
      width: computedStyle.width,
      height: computedStyle.height,
      maxWidth: computedStyle.maxWidth,
      maxHeight: computedStyle.maxHeight,
      containmentWidth: computedStyle.getPropertyValue('--container-width'),
      containmentHeight: computedStyle.getPropertyValue('--container-height'),
      simulatorWidth: element.style.getPropertyValue('--simulator-width'),
      simulatorHeight: element.style.getPropertyValue('--simulator-height')
    });

    // Inspeccionar Shadow DOM si existe
    if (element.shadowRoot) {
      console.log('🔍 Shadow DOM encontrado, inspeccionando contenido interno...');
      const shadowChildren = element.shadowRoot.children;
      for (let i = 0; i < shadowChildren.length; i++) {
        const child = shadowChildren[i] as HTMLElement;
        const childStyle = window.getComputedStyle(child);
        console.log(`📦 Elemento interno ${i + 1}:`, {
          tagName: child.tagName,
          width: childStyle.width,
          height: childStyle.height,
          maxWidth: childStyle.maxWidth,
          maxHeight: childStyle.maxHeight,
          overflow: childStyle.overflow,
          position: childStyle.position
        });
      }
      
      // APLICAR ESCALADO EN SHADOW DOM: Preparar div principal para transform scale
      const mainDiv = element.shadowRoot.querySelector('div');
      if (mainDiv && props.device) {
        console.log('🎯 Preparando div principal del Shadow DOM para escalado...');
        
        // Solo aplicar estilos base para el escalado, el tamaño se maneja con CSS transform
        mainDiv.style.setProperty('transform-origin', 'top left', 'important');
        mainDiv.style.setProperty('overflow', 'hidden', 'important');
        mainDiv.style.setProperty('box-sizing', 'border-box', 'important');
        
        // Verificar estado después de preparación
        const updatedStyle = window.getComputedStyle(mainDiv);
        console.log('✅ Div principal preparado para escalado:', {
          width: updatedStyle.width,
          height: updatedStyle.height,
          transformOrigin: updatedStyle.transformOrigin,
          transform: updatedStyle.transform
        });
        
        // Calcular factor de escala - usar el dispositivo actual como límite máximo
        const actualDeviceWidth = props.device.width;
        const actualDeviceHeight = props.device.height;
        
        // Obtener dimensiones reales del contenido del microfrontend
        const realContentWidth = mainDiv ? parseFloat(window.getComputedStyle(mainDiv).width) : actualDeviceWidth;
        const realContentHeight = mainDiv ? parseFloat(window.getComputedStyle(mainDiv).height) : actualDeviceHeight;
        
        const scaleX = actualDeviceWidth / realContentWidth;
        const scaleY = actualDeviceHeight / realContentHeight;
        const scale = Math.min(scaleX, scaleY, 1.0); // Nunca escalar más grande que original
        
        console.log(`📏 Calculando escala ADAPTIVA: contenido ${realContentWidth}x${realContentHeight} → dispositivo ${actualDeviceWidth}x${actualDeviceHeight}`, {
          realContentWidth,
          realContentHeight,
          scaleX,
          scaleY, 
          finalScale: scale
        });

        // Agregar hoja de estilos RESPONSIVE dentro del Shadow DOM
        const forceStyle = document.createElement('style');
        forceStyle.setAttribute('data-force', 'true');
        forceStyle.textContent = `
          /* Contenedor principal: mantener tamaño original pero escalado */
          div:first-of-type {
            width: ${realContentWidth}px !important;
            height: ${realContentHeight}px !important;
            transform: scale(${scale}) !important;
            transform-origin: top left !important;
            overflow: visible !important;
            box-sizing: border-box !important;
          }
          
          /* El host debe limitar el contenido escalado */
          :host {
            width: ${actualDeviceWidth}px !important;
            height: ${actualDeviceHeight}px !important;
            overflow: hidden !important;
            display: block !important;
            position: relative !important;
          }
          
          /* Permitir que el contenido interno fluya naturalmente */
          * {
            box-sizing: border-box !important;
          }
          
          /* Elementos que podrían tener altura fija problemática */
          body, html, main, section, article, .container, .app {
            max-height: none !important;
            height: auto !important;
          }
        `;
        element.shadowRoot.insertBefore(forceStyle, element.shadowRoot.firstChild);
        console.log(`💪 Estilos de ESCALADO ADAPTIVO aplicados (escala: ${scale})`);
      } else {
        console.warn('⚠️ No se encontró div principal en Shadow DOM');
      }
    } else {
      console.log('❓ No se encontró shadow DOM en el microfrontend');
    }
    
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
  console.log('🔄 ExternalComponentView montado con props:', props, 'zoomLevel:', props.zoomLevel, 'device:', props.device);
  
  // Calcular altura inicial
  calculateContainerHeight();
  
  // Escuchar cambios de tamaño de ventana
  window.addEventListener('resize', calculateContainerHeight);
  
  // Observador para cambios en el tamaño del elemento padre
/*   const resizeObserver = new ResizeObserver(() => {
    calculateContainerHeight();
  }); */
  
  // Observar el elemento padre cuando esté disponible
  const checkParent = () => {
    const container = document.querySelector('.external-component-container') as HTMLElement;
    if (container?.parentElement) {
      //resizeObserver.observe(container.parentElement);
      //console.log('🔍 ResizeObserver configurado en elemento padre');
      
      // NUEVO: Observador de mutaciones para detectar si el componente intenta escaparse
      /* const mutationObserver = new MutationObserver(() => {
        const mountedComponents = container.querySelectorAll('ine-validation-component, landing-web-component, sms-verification-component');
        mountedComponents.forEach((component) => {
          const htmlComponent = component as HTMLElement;
          if (htmlComponent.style.position === 'fixed' || htmlComponent.style.position === 'absolute') {
            htmlComponent.style.position = 'relative';
            console.log('🚨 CORREGIDO: Componente intentó escapar usando position fixed/absolute');
          }
        });
      }); */
      
      /* mutationObserver.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      }); */
    } else {
      setTimeout(checkParent, 100);
    }
  };
  checkParent();
  
  // Ejecutar carga del componente inmediatamente
  loadExternalComponent();
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

// Observar cambios en el paso del wizard Y cambios de dispositivo
watch([() => props.wizardStep?.componentData, () => props.device], ([wizardData, device], [oldWizardData, oldDevice]) => {
  if (componentInstance.value) {
    // Si cambia el paso, actualizar flow-context
    if (wizardData !== oldWizardData) {
      componentInstance.value.setAttribute('flow-context', JSON.stringify({
        ...flowContext,
        currentStep: props.wizardStep?.componentData?.customTypeId
      }));
    }
    
    // Si cambia el dispositivo, actualizar config con nuevas dimensiones
    if (device !== oldDevice && device) {
      const updatedConfig = {
        theme: 'dark',
        showFooter: false,
        simulationMode: false,
        zoomLevel: props.zoomLevel || 1.0,
        containerDimensions: {
          width: `${device.width}px`,
          height: `${device.height}px`,
          deviceWidth: device.width,
          deviceHeight: device.height,
          deviceLabel: device.label,
          containment: true,
          isModal: true,
          parentContainer: 'wizard-modal',
          viewport: {
            width: device.width,
            height: device.height,
            type: 'simulated',
            responsive: true
          }
        }
      };
      componentInstance.value.setAttribute('config', JSON.stringify(updatedConfig));
      
      // FORZAR redimensionado directo del elemento con interceptor
      componentInstance.value.style.width = `${device.width}px`;
      componentInstance.value.style.height = `${device.height}px`;
      componentInstance.value.style.maxWidth = `${device.width}px`;
      componentInstance.value.style.maxHeight = `${device.height}px`;
      componentInstance.value.style.minWidth = `${device.width}px`;
      componentInstance.value.style.minHeight = `${device.height}px`;
      
      // ACTUALIZAR CSS custom properties
      componentInstance.value.style.setProperty('--simulator-width', `${device.width}px`);
      componentInstance.value.style.setProperty('--simulator-height', `${device.height}px`);
      componentInstance.value.style.setProperty('--container-width', `${device.width}px`);
      componentInstance.value.style.setProperty('--container-height', `${device.height}px`);
      
      // VIGILAR y corregir cualquier cambio no autorizado
      const checkDimensions = () => {
        if (componentInstance.value) {
          const currentWidth = componentInstance.value.style.width;
          const currentHeight = componentInstance.value.style.height;
          const expectedWidth = `${device.width}px`;
          const expectedHeight = `${device.height}px`;
          
          if (currentWidth !== expectedWidth) {
            console.log(`🔧 Corrigiendo width de ${currentWidth} a ${expectedWidth}`);
            componentInstance.value.style.width = expectedWidth;
          }
          if (currentHeight !== expectedHeight) {
            console.log(`🔧 Corrigiendo height de ${currentHeight} a ${expectedHeight}`);
            componentInstance.value.style.height = expectedHeight;
          }
        }
      };
      
      // Vigilar cada 100ms por cambios no autorizados
      const vigilance = setInterval(checkDimensions, 100);
      
      // Limpiar vigilancia después de 5 segundos
      setTimeout(() => clearInterval(vigilance), 5000);
      
      // REMOVER y RECARGAR el microfrontend para forzar recalculo completo
      const mountPoint = document.getElementById('component-mount-point');
      if (mountPoint && componentInstance.value) {
        // Guardar referencia y remover del DOM
        const element = componentInstance.value;
        mountPoint.removeChild(element);
        
        // Esperar un frame y volver a montarlo
        requestAnimationFrame(() => {
          // Aplicar nuevas dimensiones antes de remontar
          element.style.width = `${device.width}px`;
          element.style.height = `${device.height}px`;
          element.style.maxWidth = `${device.width}px`;
          element.style.maxHeight = `${device.height}px`;
          
          // Remontar el elemento
          mountPoint.appendChild(element);
          
          // FORZAR DIMENSIONES EN SHADOW DOM después del remontaje
          if (element.shadowRoot) {
            const mainDiv = element.shadowRoot.querySelector('div');
            if (mainDiv) {
              console.log('🎯 Preparando Shadow DOM para escalado después de remontaje...');
              
              // Solo preparar estilos base para el escalado
              mainDiv.style.setProperty('transform-origin', 'top left', 'important');
              mainDiv.style.setProperty('overflow', 'hidden', 'important');
              mainDiv.style.setProperty('box-sizing', 'border-box', 'important');
              
              // Calcular escala ADAPTIVA basada en contenido real vs dispositivo nuevo
              const actualDeviceWidth = device.width;
              const actualDeviceHeight = device.height;
              
              // Obtener dimensiones reales del contenido
              const realContentWidth = mainDiv ? parseFloat(window.getComputedStyle(mainDiv).width) : actualDeviceWidth;
              const realContentHeight = mainDiv ? parseFloat(window.getComputedStyle(mainDiv).height) : actualDeviceHeight;
              
              const scaleX = actualDeviceWidth / realContentWidth;
              const scaleY = actualDeviceHeight / realContentHeight;
              const scale = Math.min(scaleX, scaleY, 1.0);
              
              console.log(`📏 Recalculando escala ADAPTIVA para remontaje: contenido ${realContentWidth}x${realContentHeight} → dispositivo ${actualDeviceWidth}x${actualDeviceHeight}`, {
                realContentWidth,
                realContentHeight,
                scaleX,
                scaleY, 
                finalScale: scale
              });
              
              // Re-inyectar estilos de escalado adaptivo para el nuevo dispositivo
              const existingForceStyle = element.shadowRoot.querySelector('style[data-force="true"]');
              if (existingForceStyle) {
                existingForceStyle.remove();
              }
              
              const forceStyle = document.createElement('style');
              forceStyle.setAttribute('data-force', 'true');
              forceStyle.textContent = `
                /* Contenedor principal: mantener tamaño real pero escalado */
                div:first-of-type {
                  width: ${realContentWidth}px !important;
                  height: ${realContentHeight}px !important;
                  transform: scale(${scale}) !important;
                  transform-origin: top left !important;
                  overflow: visible !important;
                  box-sizing: border-box !important;
                }
                
                /* Host limita el área visible */
                :host {
                  width: ${actualDeviceWidth}px !important;
                  height: ${actualDeviceHeight}px !important;
                  overflow: hidden !important;
                  display: block !important;
                  position: relative !important;
                }
                
                /* Permitir flujo natural del contenido */
                * {
                  box-sizing: border-box !important;
                }
                
                /* Elementos que podrían causar problemas de altura */
                body, html, main, section, article, .container, .app {
                  max-height: none !important;
                  height: auto !important;
                }
              `;
              element.shadowRoot.insertBefore(forceStyle, element.shadowRoot.firstChild);
              console.log(`💪 Estilos de escalado ADAPTIVO re-aplicados para remontaje (escala: ${scale})`);
            }
          }
          
          // Disparar eventos después del remontaje
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            element.dispatchEvent(new Event('resize'));
            
            // Intentar métodos específicos del microfrontend
            if ('forceResize' in element && typeof (element as any).forceResize === 'function') {
              (element as any).forceResize();
            }
            
            if ('requestUpdate' in element && typeof (element as any).requestUpdate === 'function') {
              (element as any).requestUpdate();
            }
            
            console.log('🔄 Microfrontend remontado con nuevas dimensiones');
          }, 50);
        });
      }
      
      console.log('🔄 Configuración Y dimensiones actualizadas para dispositivo:', device.label, updatedConfig);
      console.log('🎯 Elemento será remontado con dimensiones:', `${device.width}x${device.height}px`);
    }
  }
}, { deep: true });
</script>

<style scoped>
/* Contenedor principal sin espacios ni scroll */
.external-component-container {
  container-type: inline-size !important;
  container-name: viewport !important;
  display: block !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
}

/* Mount point que ocupa todo el espacio disponible */
.component-mount-point {
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}

/* Asegurar que el microfrontend ocupe todo el contenedor */
.component-mount-point > * {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  box-sizing: border-box !important;
  display: block !important;
  overflow: hidden !important;
}

/* Estilos específicos para el custom element landing-web-component */
landing-web-component {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

/* Forzar que los elementos internos del microfrontend se adapten */
landing-web-component * {
  box-sizing: border-box !important;
}

/* Forzar media queries a usar el ancho del contenedor */
@container viewport (max-width: 430px) {
  landing-web-component {
    font-size: 14px !important;
  }
}

@container viewport (min-width: 431px) {
  landing-web-component {
    font-size: 16px !important;
  }
}
</style>

<style>
.component-mount-point {
   display: block !important;
   --component-zoom: 1;
   
}
.external-component-container {
  container-type: inline-size !important;
  container-name: viewport !important;
  /* opcional: overflow, box-sizing, width fija en modo prueba */
  display: block !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
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
</style>

