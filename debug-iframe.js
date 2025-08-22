// Script de debugging para verificar elementos en el iframe
// Ejecutar este script en la consola del navegador cuando el wizard esté abierto

function debugIframeContent() {
    console.log('🔍 DEBUGGING IFRAME CONTENT');
    console.log('================================');
    
    // Buscar el iframe del microfrontend
    const iframe = document.querySelector('.microfrontend-iframe');
    
    if (!iframe) {
        console.error('❌ No se encontró iframe del microfrontend');
        return;
    }
    
    console.log('✅ Iframe encontrado:', iframe.src);
    
    try {
        // Intentar acceder al contenido del iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        if (!iframeDoc) {
            console.warn('⚠️ No se puede acceder al contenido del iframe (CORS)');
            return;
        }
        
        // Buscar elementos específicos
        const buttons = iframeDoc.querySelectorAll('button');
        const iniciarButtons = Array.from(buttons).filter(btn => 
            btn.textContent.includes('INICIAR') || 
            btn.textContent.includes('iniciar') ||
            btn.textContent.includes('Iniciar')
        );
        
        console.log('🔍 Total botones encontrados:', buttons.length);
        console.log('🎯 Botones con "INICIAR":', iniciarButtons.length);
        
        iniciarButtons.forEach((btn, index) => {
            console.log(`🔵 Botón ${index + 1}:`, {
                text: btn.textContent,
                class: btn.className,
                id: btn.id,
                style: btn.getAttribute('style'),
                hidden: btn.hidden,
                display: window.getComputedStyle(btn).display
            });
        });
        
        // Buscar debug banners
        const debugElements = iframeDoc.querySelectorAll('[class*="debug"], [class*="banner"], [id*="debug"]');
        console.log('🐛 Elementos debug encontrados:', debugElements.length);
        
        debugElements.forEach((el, index) => {
            console.log(`🐛 Debug ${index + 1}:`, {
                tag: el.tagName,
                class: el.className,
                id: el.id,
                text: el.textContent?.substring(0, 50) + '...'
            });
        });
        
    } catch (error) {
        console.error('❌ Error accediendo al iframe:', error.message);
        console.log('💡 Esto es normal si el iframe tiene origen diferente (CORS)');
        
        // Información alternativa
        console.log('📊 Información disponible del iframe:');
        console.log('- Src:', iframe.src);
        console.log('- Width:', iframe.style.width || iframe.width);
        console.log('- Height:', iframe.style.height || iframe.height);
        console.log('- Display:', window.getComputedStyle(iframe).display);
    }
    
    // Verificar si hay overlays o elementos de Vue que puedan interferir
    const overlays = document.querySelectorAll('.iframe-overlay, .wizard-footer, [class*="wizard"]');
    console.log('🎭 Elementos Vue cerca del iframe:', overlays.length);
    
    overlays.forEach((overlay, index) => {
        if (overlay.textContent.includes('INICIAR') || overlay.textContent.includes('iniciar')) {
            console.log(`🎯 ENCONTRADO en Vue elemento ${index + 1}:`, {
                class: overlay.className,
                text: overlay.textContent.substring(0, 100)
            });
        }
    });
}

// Ejecutar el debugging
debugIframeContent();

// Instrucciones
console.log(`
📋 INSTRUCCIONES:
1. Copia y pega este script en la consola del navegador
2. Ejecuta el wizard y ve al paso que muestra el iframe
3. Ejecuta el script: debugIframeContent()
4. Revisa los logs para identificar el origen del botón INICIAR
`);
