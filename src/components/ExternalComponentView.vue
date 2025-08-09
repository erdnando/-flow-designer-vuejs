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
      container.style.height = `${containerHeight.value}px`;
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
    const originalStyle = window.getComputedStyle;
    const availableHeight = containerHeight.value - 20;
    
    // Interceptar getComputedStyle para elementos dentro del componente
    Object.defineProperty(window, 'getComputedStyle', {
      value: function(element: Element, pseudoElement?: string | null) {
        const styles = originalStyle.call(this, element, pseudoElement);
        
        // Si el elemento está dentro de nuestro microfrontend
        if (finalMountPoint.contains(element)) {
          const proxy = new Proxy(styles, {
            get(target, property) {
              const value = target[property as keyof CSSStyleDeclaration];
              
              // Interceptar valores de altura que usen 100vh
              if ((property === 'height' || property === 'minHeight' || property === 'maxHeight') && 
                  typeof value === 'string' && value === '100vh') {
                console.log(`🚨 INTERCEPTADO: ${property} = 100vh cambiado a ${availableHeight}px`);
                return `${availableHeight}px`;
              }
              
              return value;
            }
          });
          return proxy as CSSStyleDeclaration;
        }
        
        return styles;
      },
      configurable: true
    });
    
    console.log(`🔒 INTERCEPTOR CSS aplicado para sobrescribir 100vh con ${availableHeight}px`);
    
    // HACK ADICIONAL: Para ine-validation-component, aplicar dimensiones después de montar
    if (customElementName === 'ine-validation-component') {
      setTimeout(() => {
        const mountedElement = document.querySelector('ine-validation-component') as HTMLElement;
        if (mountedElement) {
          // Forzar dimensiones estrictas con altura exacta
          const exactElementHeight = containerHeight.value - 60; // Más margen de seguridad
          mountedElement.style.height = `${exactElementHeight}px`;
          mountedElement.style.maxHeight = `${exactElementHeight}px`;
          mountedElement.style.minHeight = `${exactElementHeight}px`;
          mountedElement.style.display = 'flex';
          mountedElement.style.flexDirection = 'column';
          // Contención estricta
          mountedElement.style.position = 'relative';
          mountedElement.style.overflow = 'hidden';
          mountedElement.style.maxWidth = '100%';
          mountedElement.style.contain = 'strict';
          mountedElement.style.clipPath = 'inset(0)';
          
          console.log(`🔧 APLICADO: Altura exacta de ${exactElementHeight}px al elemento montado`);
          
          // NUEVO: Interceptar y corregir cualquier elemento que se desborde
          const observer = new MutationObserver(() => {
            const allChildren = mountedElement.querySelectorAll('*');
            allChildren.forEach((child: Element) => {
              const htmlChild = child as HTMLElement;
              const rect = htmlChild.getBoundingClientRect();
              const parentRect = mountedElement.getBoundingClientRect();
              
              // Si el elemento se extiende más allá del contenedor padre
              if (rect.bottom > parentRect.bottom + 5) { // 5px de tolerancia
                htmlChild.style.maxHeight = '100%';
                htmlChild.style.overflow = 'hidden';
                htmlChild.style.position = 'relative';
                console.log('🚨 CORREGIDO: Elemento desbordado hacia abajo:', htmlChild.tagName);
              }
              
              // NUEVO: Detectar y corregir uso de 100vh
              const computedStyle = getComputedStyle(htmlChild);
              if (computedStyle.height === '100vh' || 
                  computedStyle.minHeight === '100vh' ||
                  computedStyle.maxHeight === '100vh') {
                htmlChild.style.height = '100%';
                htmlChild.style.minHeight = '100%';
                htmlChild.style.maxHeight = '100%';
                console.log('🚨 CORREGIDO: Elemento usaba 100vh, cambiado a 100%:', htmlChild.tagName, htmlChild.className);
              }
              
              // También verificar estilos inline
              if (htmlChild.style.height === '100vh' || 
                  htmlChild.style.minHeight === '100vh') {
                htmlChild.style.height = '100%';
                htmlChild.style.minHeight = '100%';
                htmlChild.style.maxHeight = '100%';
                console.log('🚨 CORREGIDO: Estilo inline 100vh detectado y corregido:', htmlChild.tagName);
              }
            });
          });
          
          observer.observe(mountedElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
          });
          
          // También intentar forzar estilos en el contenido interno si es posible
          const shadowRoot = mountedElement.shadowRoot;
          if (shadowRoot) {
            const allDivs = shadowRoot.querySelectorAll('div');
            allDivs.forEach((div: HTMLElement) => {
              div.style.height = '100%';
              div.style.maxHeight = '100%';
              div.style.minHeight = 'inherit';
              div.style.position = 'relative';
              div.style.maxWidth = '100%';
              div.style.overflow = 'hidden';
              div.style.boxSizing = 'border-box';
              
              // NUEVO: Sobrescribir cualquier uso de 100vh en shadow DOM
              const computedStyle = getComputedStyle(div);
              if (computedStyle.height === '100vh' || computedStyle.minHeight === '100vh') {
                div.style.height = '100%';
                div.style.minHeight = '100%';
                console.log('🚨 CORREGIDO: Elemento en shadow DOM usaba 100vh, cambiado a 100%');
              }
            });
            
            // NUEVO: Inyectar CSS personalizado en el shadow DOM para sobrescribir 100vh
            const styleElement = document.createElement('style');
            styleElement.textContent = `
              * {
                height: var(--container-height, 100%) !important;
                max-height: 100% !important;
              }
              *[style*="100vh"] {
                height: 100% !important;
                min-height: 100% !important;
              }
              div, main, section, article {
                max-height: 100% !important;
              }
            `;
            shadowRoot.appendChild(styleElement);
            
            console.log('🔧 FORZADO: Estilos internos en shadow DOM con límites estrictos y CSS anti-100vh');
          }
        }
      }, 500); // Esperar medio segundo para que el componente se inicialice completamente
    }
    
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
  <div class="external-component-container" :style="{ height: `${containerHeight}px` }">
    <!-- Wrapper para scroll y control de altura -->
    <div style="overflow: auto; height: 100%; width: 100%; display: flex; flex-direction: column; box-sizing: border-box;">
      <!-- Siempre tener el punto de montaje disponible pero oculto según el estado -->
      <div 
        id="component-mount-point" 
        class="component-mount-point" 
        :style="{ 
          display: !loading && !error ? 'flex' : 'none',
          '--component-zoom': props.zoomLevel || 1.0
        }"
      >
        <!-- El componente web se montará aquí -->
      </div>
    </div>
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando componente externo...</p>
    </div>
    <div class="component-info" v-if="componentInfo">
      <span class="component-tag">{{ componentInfo.id }} v{{ componentInfo.version }}</span>
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

/* Aplicar zoom dinámico al contenido del componente externo */
.component-mount-point {
  flex: 1;
  min-height: 0; /* Permitir que se comprima */
  overflow: hidden; /* Sin scroll en el punto de montaje */
  width: 100%;
  height: 100%;
  position: relative;
  /* Aplicar zoom solo al contenido del componente */
  transform: scale(var(--component-zoom, 1));
  transform-origin: center center;
  transition: transform 0.2s ease-in-out;
  /* Centrar el contenido para que se vea completo */
  display: flex;
  justify-content: center;
  align-items: stretch; /* Cambiar a stretch para que use toda la altura */
  flex-direction: column;
  /* Remover padding para maximizar espacio disponible */
  /* NUEVO: Contención estricta del punto de montaje */
  contain: layout style; /* Contener layout y estilos */
  isolation: isolate; /* Aislar el contexto de apilamiento */
}

/* Dar dimensiones apropiadas al componente web */
.component-mount-point > * {
  width: 100% !important;   /* Usar todo el ancho disponible */
  height: 100% !important;  /* Usar toda la altura disponible */
  min-width: 350px;  /* Ancho mínimo para asegurar legibilidad */
  min-height: 450px; /* Altura mínima para asegurar contenido visible */
  max-width: 100% !important; /* NUEVO: Limitar el ancho máximo */
  max-height: 100% !important; /* NUEVO: Limitar la altura máxima */
  flex-shrink: 0; /* No permitir que se encoja */
  box-sizing: border-box; /* Incluir padding y border en las dimensiones */
  /* Forzar que el contenido interno también use toda la altura */
  display: flex !important;
  flex-direction: column !important;
  /* NUEVO: Evitar que el componente escape de su contenedor */
  position: relative !important; /* Forzar posición relativa */
  overflow: hidden !important; /* Evitar scroll y desbordamiento */
  contain: layout style size !important; /* Contención total */
}

/* Asegurar que el contenido interno del web component también se estire */
.component-mount-point > * > *,
.component-mount-point > * > * > * {
  flex: 1 !important;
  height: 100% !important;
  min-height: inherit !important;
}

/* Estilos específicos para web components comunes */
.component-mount-point landing-web-component,
.component-mount-point ine-validation-component,
.component-mount-point sms-verification-component {
  height: 100% !important;
  min-height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

/* NUEVO: Interceptar y sobrescribir cualquier uso de 100vh en el microfrontend */
.component-mount-point *[style*="100vh"],
.component-mount-point *[style*="height: 100vh"],
.component-mount-point *[style*="min-height: 100vh"] {
  height: 100% !important;
  min-height: 100% !important;
  max-height: 100% !important;
}

/* Forzar que elementos comunes NO usen 100vh */
.component-mount-point div,
.component-mount-point main,
.component-mount-point section,
.component-mount-point article,
.component-mount-point .container,
.component-mount-point .wrapper {
  max-height: 100% !important;
}

/* Estilos súper específicos para ine-validation-component que parece tener problemas */
.component-mount-point ine-validation-component {
  height: 100% !important; /* Cambiar de 100vh a 100% para respetar contenedor */
  min-height: 600px !important;
  max-height: 100% !important; /* Limitar altura máxima */
  width: 100% !important;
  max-width: 100% !important;
  position: relative !important;
  overflow: hidden !important;
  transform: none !important; /* Evitar transforms que puedan causar escape */
  contain: strict !important; /* Contención más estricta */
  clip-path: inset(0) !important; /* Forzar recorte visual */
  box-sizing: border-box !important;
}

/* NUEVA REGLA: Forzar altura fija cuando el componente intenta usar 100vh */
.component-mount-point ine-validation-component[style*="100vh"],
.component-mount-point ine-validation-component * [style*="100vh"] {
  height: calc(75vh - 100px) !important; /* Altura específica basada en el contenedor real */
  min-height: calc(75vh - 100px) !important;
  max-height: calc(75vh - 100px) !important;
}

/* SUPER HACK: Crear un contenedor wrapper para contener completamente el componente */
.component-mount-point {
  position: relative !important;
  overflow: hidden !important;
  clip-path: inset(0) !important; /* Forzar recorte visual */
  max-height: 100% !important; /* NUEVO: Evitar desbordamiento inferior */
  contain: strict !important; /* Contención más estricta */
}

/* NUEVO: Evitar que cualquier componente web escape de su contenedor */
.component-mount-point > *,
.component-mount-point > * *,
.component-mount-point > * * * {
  position: relative !important; /* Evitar position fixed/absolute que escape */
  z-index: auto !important; /* Evitar z-index extremos */
  transform: none !important; /* Evitar transforms que escapen */
}

/* NUEVO: Contener elementos que intenten usar posicionamiento absoluto */
.component-mount-point > * [style*="position: fixed"],
.component-mount-point > * [style*="position: absolute"] {
  position: relative !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  bottom: auto !important;
}

/* Forzar altura en elementos internos del ine-validation-component */
.component-mount-point ine-validation-component * {
  box-sizing: border-box !important;
}

.component-mount-point ine-validation-component > div,
.component-mount-point ine-validation-component .container,
.component-mount-point ine-validation-component .wrapper,
.component-mount-point ine-validation-component .main,
.component-mount-point ine-validation-component .content,
.component-mount-point ine-validation-component .app,
.component-mount-point ine-validation-component .component-root {
  height: 100% !important;
  min-height: 100% !important;
  flex: 1 !important;
}

/* Forzar que cualquier contenedor padre dentro del shadow DOM también use toda la altura */
.component-mount-point ine-validation-component::shadow-root,
.component-mount-point ine-validation-component::shadow {
  height: 100% !important;
  min-height: 100% !important;
}

/* Forzar altura completa en elementos internos comunes */
.component-mount-point [class*="container"],
.component-mount-point [class*="wrapper"],
.component-mount-point [class*="main"],
.component-mount-point [class*="content"] {
  height: 100% !important;
  min-height: 100% !important;
  flex: 1 !important;
}

/* Estilos globales para forzar altura completa en toda la cadena de contenedores */
.wizard-modal,
.wizard-main-content,
.wizard-content,
.wizard-step,
.step-content,
.component-container {
  min-height: 0 !important;
  height: auto !important;
  flex: 1 !important;
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

/* Responsive para pantallas pequeñas  height: 100%;*/
@media (max-width: 900px) {
  .external-component-container {
    /* height será calculada dinámicamente también en móviles */
    min-height: 300px !important;
  }
  
  .component-tag {
    font-size: 10px;
    padding: 2px 6px;
  }
}
  /* --- Dummy/Fallback styles (LIMPIO - usando inline styles) --- */
// ...existing code...
