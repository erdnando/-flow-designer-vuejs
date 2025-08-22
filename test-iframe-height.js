// 🧪 Script de Testing para Verificar Altura Completa del Iframe
// Ejecutar en la consola del navegador cuando el wizard esté abierto

function testIframeHeight() {
    console.log('🔍 TESTING IFRAME HEIGHT CONFIGURATION');
    console.log('=====================================');
    
    // Buscar el iframe
    const iframe = document.querySelector('.microfrontend-iframe');
    const container = document.querySelector('.iframe-container');
    const mainContainer = document.querySelector('.iframe-microfrontend-container');
    
    if (!iframe) {
        console.error('❌ No se encontró iframe');
        return;
    }
    
    // Obtener dimensiones actuales
    const iframeRect = iframe.getBoundingClientRect();
    const containerRect = container?.getBoundingClientRect();
    const mainContainerRect = mainContainer?.getBoundingClientRect();
    
    console.log('📐 DIMENSIONES ACTUALES:');
    console.log('------------------------');
    console.log('Iframe:', {
        width: Math.round(iframeRect.width),
        height: Math.round(iframeRect.height),
        visible: iframeRect.height > 0
    });
    
    if (containerRect) {
        console.log('Container:', {
            width: Math.round(containerRect.width),
            height: Math.round(containerRect.height),
        });
    }
    
    if (mainContainerRect) {
        console.log('Main Container:', {
            width: Math.round(mainContainerRect.width),
            height: Math.round(mainContainerRect.height),
        });
    }
    
    // Verificar estilos CSS
    const iframeStyles = window.getComputedStyle(iframe);
    const containerStyles = container ? window.getComputedStyle(container) : null;
    
    console.log('🎨 ESTILOS CSS:');
    console.log('---------------');
    console.log('Iframe overflow:', iframeStyles.overflow);
    console.log('Iframe height:', iframeStyles.height);
    console.log('Iframe min-height:', iframeStyles.minHeight);
    
    if (containerStyles) {
        console.log('Container overflow:', containerStyles.overflow);
        console.log('Container height:', containerStyles.height);
    }
    
    // Verificar si hay scroll
    const hasVerticalScroll = iframe.scrollHeight > iframe.clientHeight;
    const hasHorizontalScroll = iframe.scrollWidth > iframe.clientWidth;
    
    console.log('📊 ANÁLISIS DE SCROLL:');
    console.log('----------------------');
    console.log('Scroll vertical:', hasVerticalScroll ? '❌ Sí (contenido más alto)' : '✅ No');
    console.log('Scroll horizontal:', hasHorizontalScroll ? '❌ Sí (contenido más ancho)' : '✅ No');
    
    if (hasVerticalScroll) {
        const scrollableHeight = iframe.scrollHeight - iframe.clientHeight;
        console.log(`⚠️ Contenido cortado: ~${scrollableHeight}px no visibles`);
        console.log('💡 Sugerencia: Aumentar altura del device en defaultDevice');
    }
    
    // Verificar viewport
    const viewportHeight = window.innerHeight;
    const iframeTopOffset = iframeRect.top;
    const availableSpace = viewportHeight - iframeTopOffset - 50; // 50px margen
    
    console.log('🖼️ ANÁLISIS DE VIEWPORT:');
    console.log('------------------------');
    console.log('Altura viewport:', viewportHeight);
    console.log('Iframe top offset:', Math.round(iframeTopOffset));
    console.log('Espacio disponible:', Math.round(availableSpace));
    console.log('Iframe cabe completo:', iframeRect.height <= availableSpace ? '✅ Sí' : '❌ No');
    
    // Recomendaciones
    console.log('');
    console.log('🎯 RECOMENDACIONES:');
    console.log('-------------------');
    
    if (iframeRect.height < 1200) {
        console.log('📏 Altura actual parece pequeña, verificar defaultDevice.height');
    }
    
    if (hasVerticalScroll) {
        console.log('⬆️ Aumentar altura en FlowCanvas.vue defaultDevice');
    }
    
    if (iframeRect.height > availableSpace) {
        console.log('📱 Considerar hacer el diseño más compacto o usar scroll');
    }
    
    if (!hasVerticalScroll && iframeRect.height <= availableSpace) {
        console.log('✅ Configuración ÓPTIMA - iframe se ve completo sin scroll');
    }
}

// Ejecutar el test
testIframeHeight();

// Función para monitorear cambios
function monitorIframe() {
    console.log('🔄 Monitoreando cambios en iframe...');
    const observer = new ResizeObserver(() => {
        console.log('📐 Iframe redimensionado, ejecutando test...');
        setTimeout(testIframeHeight, 100);
    });
    
    const iframe = document.querySelector('.microfrontend-iframe');
    if (iframe) {
        observer.observe(iframe);
        console.log('👁️ Monitor activado');
    }
    
    return observer;
}

console.log(`
📋 INSTRUCCIONES:
1. Ejecutar testIframeHeight() para análisis inicial
2. Ejecutar monitorIframe() para monitoreo continuo  
3. Revisar logs para optimizar configuración
4. Ajustar defaultDevice.height según recomendaciones
`);
