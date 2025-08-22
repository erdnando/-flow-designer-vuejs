// 🚀 Solución Extrema: Auto-Altura Dinámica
// Si 1400px aún no funciona, usar este enfoque

function implementDynamicHeight() {
    console.log('🚀 IMPLEMENTANDO ALTURA DINÁMICA EXTREMA');
    console.log('=======================================');
    
    const iframe = document.querySelector('.microfrontend-iframe');
    const container = document.querySelector('.iframe-container');
    
    if (!iframe || !container) {
        console.error('❌ No se encontraron elementos iframe');
        return;
    }
    
    // Función para medir y ajustar
    function measureAndAdjust() {
        const viewportHeight = window.innerHeight;
        const maxAllowedHeight = Math.floor(viewportHeight * 0.8); // 80% del viewport
        
        // Si el iframe tiene scroll, intentar expandir hasta el máximo permitido
        if (iframe.scrollHeight > iframe.clientHeight) {
            const neededHeight = Math.min(iframe.scrollHeight, maxAllowedHeight);
            
            console.log(`📐 Ajustando a altura dinámica: ${neededHeight}px`);
            
            // Aplicar nueva altura
            iframe.style.height = `${neededHeight}px`;
            container.style.height = `${neededHeight}px`;
            
            // Actualizar el defaultDevice programáticamente si es posible
            console.log(`💻 Código sugerido para hacer permanente:`);
            console.log(`const defaultDevice = { width: 430, height: ${neededHeight} };`);
            
            return neededHeight;
        }
        
        console.log('✅ Altura actual es suficiente');
        return iframe.clientHeight;
    }
    
    // Ejecutar inmediatamente
    const finalHeight = measureAndAdjust();
    
    // Monitorear cambios de viewport
    window.addEventListener('resize', () => {
        console.log('📱 Viewport cambió, reajustando...');
        measureAndAdjust();
    });
    
    // Observer para cambios en el contenido del iframe
    const resizeObserver = new ResizeObserver(() => {
        console.log('🔄 Contenido del iframe cambió, reajustando...');
        setTimeout(measureAndAdjust, 100);
    });
    
    resizeObserver.observe(iframe);
    
    return finalHeight;
}

// Auto-ejecutar si detectamos problemas de scroll
function autoDetectAndFix() {
    setTimeout(() => {
        const iframe = document.querySelector('.microfrontend-iframe');
        if (iframe && iframe.scrollHeight > iframe.clientHeight) {
            console.log('🔧 DETECTADO PROBLEMA DE SCROLL - Ejecutando solución extrema');
            implementDynamicHeight();
        }
    }, 3000); // Esperar 3 segundos después de cargar
}

// Iniciar detección automática
autoDetectAndFix();

console.log(`
🚀 SOLUCIÓN EXTREMA ACTIVADA:
=============================
- Detectará automáticamente si hay scroll después de 3 segundos
- Ajustará la altura dinámicamente hasta 80% del viewport
- Monitoreará cambios de tamaño y contenido
- Proporcionará código para hacer permanente el cambio

Si quieres ejecutar manualmente: implementDynamicHeight()
`);
