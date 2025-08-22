// 🎯 Script de Ajuste Fino - Altura Optimizada
// Usar este script para validar si 1050px es suficiente o necesita ajuste

function validateOptimizedHeight() {
    console.log('🎯 VALIDANDO ALTURA OPTIMIZADA (1050px)');
    console.log('=======================================');
    
    const iframe = document.querySelector('.microfrontend-iframe');
    const container = document.querySelector('.iframe-container');
    
    if (!iframe) {
        console.error('❌ No se encontró iframe');
        return;
    }
    
    // Dimensiones actuales
    const iframeRect = iframe.getBoundingClientRect();
    const hasScroll = iframe.scrollHeight > iframe.clientHeight;
    const scrollAmount = hasScroll ? iframe.scrollHeight - iframe.clientHeight : 0;
    
    console.log('📐 DIMENSIONES ACTUALES:');
    console.log(`- Iframe visible: ${Math.round(iframeRect.width)} x ${Math.round(iframeRect.height)}`);
    console.log(`- Contenido total: ${iframe.scrollWidth} x ${iframe.scrollHeight}`);
    console.log(`- ¿Necesita scroll?: ${hasScroll ? '❌ Sí' : '✅ No'}`);
    
    if (hasScroll) {
        console.log(`- Contenido oculto: ${scrollAmount}px`);
        
        // Calcular nueva altura sugerida
        const currentHeight = Math.round(iframeRect.height);
        const suggestedHeight = currentHeight + scrollAmount + 10; // +10px buffer
        
        console.log('');
        console.log('💡 SUGERENCIA DE AJUSTE:');
        console.log(`- Altura actual: ${currentHeight}px`);
        console.log(`- Altura sugerida: ${suggestedHeight}px`);
        console.log(`- Incremento necesario: +${scrollAmount + 10}px`);
        
        // Código para actualizar
        console.log('');
        console.log('💻 CÓDIGO A ACTUALIZAR:');
        console.log('=======================');
        console.log(`
// En FlowCanvas.vue
const defaultDevice = {
    label: 'Responsive',
    width: 430,
    height: ${suggestedHeight}  // Ajustado para contenido completo
};
        `);
        
        console.log(`
// Footer text
<span>Responsive Design (430x${suggestedHeight})</span>
        `);
        
        console.log(`
// En IframeMicrofrontendView.vue - actualizar valores por defecto
const deviceHeight = props.device?.height || ${suggestedHeight}
        `);
        
    } else {
        console.log('');
        console.log('✅ CONFIGURACIÓN ÓPTIMA');
        console.log('- No se necesita scroll');
        console.log('- Todo el contenido es visible');
        console.log('- Altura de 1050px es perfecta');
    }
    
    // Verificar espacio en viewport
    const viewportHeight = window.innerHeight;
    const iframeTop = iframeRect.top;
    const availableSpace = viewportHeight - iframeTop - 100; // 100px margen
    
    console.log('');
    console.log('🖼️ ANÁLISIS DE VIEWPORT:');
    console.log(`- Altura viewport: ${viewportHeight}px`);
    console.log(`- Espacio disponible: ${Math.round(availableSpace)}px`);
    console.log(`- Iframe cabe: ${iframeRect.height <= availableSpace ? '✅ Sí' : '⚠️ Requiere scroll de página'}`);
    
    // Resultado final
    console.log('');
    console.log('📊 RESULTADO FINAL:');
    console.log('===================');
    
    if (!hasScroll && iframeRect.height <= availableSpace) {
        console.log('🎉 PERFECTO - Configuración óptima');
        console.log('- Sin scroll interno');
        console.log('- Cabe en viewport');
        console.log('- Experiencia de usuario excelente');
    } else if (!hasScroll) {
        console.log('✅ BUENO - Sin scroll interno pero puede requerir scroll de página');
    } else if (iframeRect.height <= availableSpace) {
        console.log('⚠️ MEJORABLE - Cabe en viewport pero necesita scroll interno');
    } else {
        console.log('❌ REQUIERE AJUSTE - Necesita scroll interno y de página');
    }
}

// Ejecutar validación automáticamente
setTimeout(validateOptimizedHeight, 1000);

console.log(`
📋 INSTRUCCIONES:
1. Ejecutar el wizard y ir al paso del iframe
2. Esperar 1 segundo para validación automática
3. O ejecutar manualmente: validateOptimizedHeight()
4. Seguir las sugerencias si las hay
`);
