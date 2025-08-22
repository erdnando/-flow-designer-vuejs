// 📏 Script para medir el contenido real de la aplicación React
// Ejecutar en la consola cuando esté abierto el iframe

function measureReactAppContent() {
    console.log('📏 MIDIENDO CONTENIDO REAL DE LA APP REACT');
    console.log('==========================================');
    
    const iframe = document.querySelector('.microfrontend-iframe');
    
    if (!iframe) {
        console.error('❌ No se encontró iframe');
        return null;
    }
    
    try {
        // Intentar acceder al contenido del iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        if (!iframeDoc) {
            console.warn('⚠️ No se puede acceder al contenido del iframe (CORS)');
            console.log('💡 Midiendo desde el contenedor Vue...');
            
            // Medición desde el iframe element
            return {
                iframeWidth: iframe.scrollWidth,
                iframeHeight: iframe.scrollHeight,
                visibleWidth: iframe.clientWidth,
                visibleHeight: iframe.clientHeight,
                needsScroll: iframe.scrollHeight > iframe.clientHeight,
                extraHeight: Math.max(0, iframe.scrollHeight - iframe.clientHeight)
            };
        }
        
        // Si podemos acceder al contenido
        const body = iframeDoc.body;
        const html = iframeDoc.documentElement;
        
        const measurements = {
            // Dimensiones del contenido
            contentWidth: Math.max(body.scrollWidth, html.scrollWidth),
            contentHeight: Math.max(body.scrollHeight, html.scrollHeight),
            
            // Dimensiones visibles actuales
            visibleWidth: iframe.clientWidth,
            visibleHeight: iframe.clientHeight,
            
            // Cálculos
            needsScroll: Math.max(body.scrollHeight, html.scrollHeight) > iframe.clientHeight,
            extraHeight: Math.max(0, Math.max(body.scrollHeight, html.scrollHeight) - iframe.clientHeight),
            
            // Recomendaciones
            recommendedHeight: Math.max(body.scrollHeight, html.scrollHeight) + 20, // +20px padding
            currentAspectRatio: iframe.clientWidth / iframe.clientHeight
        };
        
        console.log('📊 MEDICIONES:', measurements);
        
        // Cálculo optimizado manteniendo proporciones móviles
        const maxReasonableHeight = 1200; // Máximo razonable
        const minHeight = 800; // Mínimo funcional
        
        let optimizedHeight = Math.min(measurements.recommendedHeight, maxReasonableHeight);
        optimizedHeight = Math.max(optimizedHeight, minHeight);
        
        console.log('🎯 RECOMENDACIÓN OPTIMIZADA:');
        console.log('-----------------------------');
        console.log(`Altura actual: ${iframe.clientHeight}px`);
        console.log(`Contenido real: ${measurements.contentHeight}px`);
        console.log(`Altura recomendada: ${optimizedHeight}px`);
        console.log(`Diferencia: ${optimizedHeight - iframe.clientHeight}px`);
        
        if (measurements.needsScroll) {
            console.log(`⚠️ Scroll necesario: ${measurements.extraHeight}px oculto`);
        } else {
            console.log('✅ Todo el contenido es visible');
        }
        
        return {
            ...measurements,
            optimizedHeight,
            suggestion: optimizedHeight !== iframe.clientHeight ? 
                `Cambiar defaultDevice.height a ${optimizedHeight}` : 
                'Altura actual es óptima'
        };
        
    } catch (error) {
        console.error('❌ Error midiendo contenido:', error);
        return null;
    }
}

// Función para generar el código exacto a cambiar
function generateCodeSuggestion(measurements) {
    if (!measurements || !measurements.optimizedHeight) return;
    
    console.log('');
    console.log('💻 CÓDIGO A ACTUALIZAR:');
    console.log('=======================');
    
    console.log(`
// En FlowCanvas.vue - defaultDevice
const defaultDevice = {
    label: 'Responsive',
    width: 430,
    height: ${measurements.optimizedHeight}  // Optimizado para contenido completo
};
    `);
    
    console.log(`
// Footer text update
<span>Responsive Design (430x${measurements.optimizedHeight})</span>
    `);
}

// Ejecutar medición
const result = measureReactAppContent();
if (result) {
    generateCodeSuggestion(result);
}
