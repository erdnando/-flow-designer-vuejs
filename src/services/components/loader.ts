import type { ComponentConfig } from './types';
import { ComponentCache } from './cache';

/**
 * Servicio para cargar scripts de Web Components
 */
export class ScriptLoader {
  private static componentCache = new ComponentCache();
  
  /**
   * Carga el script de un componente (método de instancia)
   * @param config - Configuración del componente
   * @returns Promise que se resuelve cuando el componente está listo
   */
  async loadScript(config: ComponentConfig): Promise<void> {
    return ScriptLoader.loadWebComponentScript(config);
  }
  
  /**
   * Carga el script de un Web Component
   * @param config - Configuración del componente
   * @returns Promise que se resuelve cuando el componente está listo
   */
  static async loadWebComponentScript(config: ComponentConfig): Promise<void> {
    const tagName = config.metadata.tagName;
    
    // Verificar si ya está cargado en caché
    if (this.componentCache.isComponentLoaded(tagName)) {
      console.log(`🎯 Component already loaded: ${tagName}`);
      return;
    }

    // Verificar si el custom element ya está definido en el DOM
    if (customElements.get(tagName)) {
      this.componentCache.markComponentAsLoaded(tagName);
      console.log(`🎯 Custom element already registered: ${tagName}`);
      return;
    }

    return this.loadScript(config.cdnUrl, tagName);
  }

  /**
   * Carga un script y espera a que el custom element se registre
   * @param scriptUrl - URL del script a cargar
   * @param tagName - Nombre del tag esperado
   * @returns Promise que se resuelve cuando el elemento está registrado
   */
  private static async loadScript(scriptUrl: string, tagName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`📦 Loading script: ${scriptUrl}`);
      
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      
      // Timeout para evitar esperas infinitas
      const timeout = setTimeout(() => {
        this.cleanupScript(script);
        reject(new Error(`Timeout loading script: ${scriptUrl}`));
      }, 30000); // 30 segundos
      
      script.onload = () => {
        clearTimeout(timeout);
        
        // Esperar a que el custom element se registre
        this.waitForCustomElement(tagName)
          .then(() => {
            this.componentCache.markComponentAsLoaded(tagName);
            console.log(`✅ Custom element registered: ${tagName}`);
            resolve();
          })
          .catch((error) => {
            this.cleanupScript(script);
            reject(error);
          });
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        this.cleanupScript(script);
        reject(new Error(`Failed to load script: ${scriptUrl}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Espera a que un custom element se registre
   * @param tagName - Nombre del tag a esperar
   * @param maxWaitTime - Tiempo máximo de espera en ms
   * @returns Promise que se resuelve cuando el elemento está registrado
   */
  private static async waitForCustomElement(tagName: string, maxWaitTime: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkRegistration = () => {
        if (customElements.get(tagName)) {
          resolve();
          return;
        }
        
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= maxWaitTime) {
          reject(new Error(`Timeout waiting for custom element registration: ${tagName}`));
          return;
        }
        
        // Retry después de un breve delay
        setTimeout(checkRegistration, 100);
      };
      
      checkRegistration();
    });
  }

  /**
   * Limpia un script del DOM
   * @param script - Elemento script a limpiar
   */
  private static cleanupScript(script: HTMLScriptElement): void {
    try {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    } catch (error) {
      console.warn('Warning: Could not cleanup script element', error);
    }
  }

  /**
   * Carga un script con fallback
   * @param config - Configuración del componente
   * @returns Promise que se resuelve cuando el componente está listo
   */
  static async loadWithFallback(config: ComponentConfig): Promise<void> {
    const tagName = config.metadata.tagName;
    
    try {
      await this.loadWebComponentScript(config);
      console.log(`✅ Script loaded successfully: ${config.id}`);
    } catch (primaryError) {
      console.warn(`⚠️ Primary script failed for ${config.id}:`, primaryError);
      
      if (config.fallbackUrl) {
        console.log(`🔄 Trying fallback for ${config.id}...`);
        
        try {
          await this.loadScript(config.fallbackUrl, tagName);
          this.componentCache.markComponentAsLoaded(tagName);
          console.log(`✅ Fallback script loaded successfully: ${config.id}`);
        } catch (fallbackError) {
          console.error(`❌ Fallback script also failed for ${config.id}:`, fallbackError);
          throw new Error(`Both primary and fallback scripts failed for ${config.id}`);
        }
      } else {
        throw primaryError;
      }
    }
  }

  /**
   * Verifica si un script ya está cargado en el DOM
   * @param scriptUrl - URL del script
   * @returns true si el script ya está cargado
   */
  static isScriptLoaded(scriptUrl: string): boolean {
    const scripts = document.querySelectorAll('script[src]');
    return Array.from(scripts).some((script: any) => script.src === scriptUrl);
  }

  /**
   * Precarga múltiples scripts en paralelo
   * @param configs - Array de configuraciones de componentes
   * @returns Promise que se resuelve cuando todos los scripts están cargados
   */
  static async preloadScripts(configs: ComponentConfig[]): Promise<void> {
    console.log(`📦 Preloading ${configs.length} component scripts...`);
    
    const loadPromises = configs.map(async (config) => {
      try {
        await this.loadWithFallback(config);
        return { id: config.id, success: true };
      } catch (error) {
        console.error(`❌ Failed to preload ${config.id}:`, error);
        return { id: config.id, success: false, error };
      }
    });
    
    const results = await Promise.all(loadPromises);
    const successCount = results.filter(r => r.success).length;
    
    console.log(`📊 Preload summary: ${successCount}/${configs.length} scripts loaded successfully`);
    
    // Log failed preloads
    results
      .filter(r => !r.success)
      .forEach(r => console.warn(`⚠️ Preload failed for ${r.id}`));
  }
}
