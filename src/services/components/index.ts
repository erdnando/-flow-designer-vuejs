import { ComponentCache } from './cache';
import { ComponentRegistry } from './registry';
import { HealthCheckService } from './healthcheck';
import { ScriptLoader } from './loader';
import { VueWrapperFactory } from './vueWrapper';
import { ErrorHandlerService } from './errorHandler';
import type { ComponentConfig, ComponentHealthStatus } from './types';

/**
 * Servicio principal para manejo de componentes externos
 * Reemplaza la funcionalidad de ExternalComponentLoader.ts
 */
export class ExternalComponentService {
  private cache: ComponentCache;
  private registry: ComponentRegistry;
  private healthCheck: HealthCheckService;
  private scriptLoader: ScriptLoader;
  private vueWrappers: Map<string, any>;
  
  constructor() {
    this.cache = new ComponentCache();
    this.registry = new ComponentRegistry();
    this.healthCheck = new HealthCheckService();
    this.scriptLoader = new ScriptLoader();
    this.vueWrappers = new Map();
    
    console.log('🚀 ExternalComponentService initialized');
  }

  /**
   * Carga un componente externo
   * @param config - Configuración del componente
   * @returns Promise del componente Vue
   */
  async loadComponent(config: ComponentConfig): Promise<any> {
    try {
      console.log(`📦 Loading external component: ${config.id}`);
      
      // Verificar caché
      const cachedPromise = this.cache.get(config.id);
      if (cachedPromise) {
        console.log(`💾 Using cached component: ${config.id}`);
        return await cachedPromise;
      }
      
      // Crear promesa de carga
      const loadPromise = this.performLoad(config);
      this.cache.set(config.id, loadPromise);
      
      return await loadPromise;
      
    } catch (error) {
      console.error(`❌ Failed to load component ${config.id}:`, error);
      this.cache.delete(config.id);
      
      // Retornar componente de error
      return ErrorHandlerService.createErrorComponent(config, error as Error);
    }
  }

  /**
   * Realiza la carga efectiva del componente
   * @param config - Configuración del componente
   * @returns Promise del componente Vue
   */
  private async performLoad(config: ComponentConfig): Promise<any> {
    // 1. Verificar salud del endpoint
    const healthStatus = await this.healthCheck.checkComponentHealth(config);
    if (!healthStatus.isHealthy) {
      throw new Error(`Component endpoint unhealthy: ${healthStatus.error}`);
    }
    
    // 2. Cargar script del componente
    await this.scriptLoader.loadScript(config);
    
    // 3. Verificar que el Web Component esté definido
    if (!customElements.get(config.metadata.tagName)) {
      throw new Error(`Web Component not defined: ${config.metadata.tagName}`);
    }
    
    // 4. Registrar componente
    this.registry.registerComponent(config);
    
    // 5. Crear wrapper Vue
    const vueWrapper = VueWrapperFactory.createVueWrapper(config);
    this.vueWrappers.set(config.id, vueWrapper);
    
    console.log(`✅ Component loaded successfully: ${config.id}`);
    return vueWrapper;
  }

  /**
   * Carga múltiples componentes
   * @param configs - Array de configuraciones
   * @returns Promise con mapa de componentes
   */
  async loadMultipleComponents(configs: ComponentConfig[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const loadPromises = configs.map(async (config) => {
      try {
        const component = await this.loadComponent(config);
        results.set(config.id, component);
      } catch (error) {
        console.error(`❌ Failed to load ${config.id}:`, error);
        const errorComponent = ErrorHandlerService.createErrorComponent(config, error as Error);
        results.set(config.id, errorComponent);
      }
    });
    
    await Promise.allSettled(loadPromises);
    
    console.log(`📦 Loaded ${results.size}/${configs.length} components`);
    return results;
  }

  /**
   * Obtiene un componente del caché
   * @param componentId - ID del componente
   * @returns Componente Vue o undefined
   */
  getCachedComponent(componentId: string): any {
    return this.vueWrappers.get(componentId);
  }

  /**
   * Verifica si un componente está cargado
   * @param componentId - ID del componente
   * @returns true si está cargado
   */
  isComponentLoaded(componentId: string): boolean {
    return this.vueWrappers.has(componentId) && this.registry.isRegistered(componentId);
  }

  /**
   * Descarga un componente específico
   * @param componentId - ID del componente
   */
  unloadComponent(componentId: string): void {
    try {
      this.cache.delete(componentId);
      this.vueWrappers.delete(componentId);
      this.registry.unregisterComponent(componentId);
      console.log(`🗑️ Component unloaded: ${componentId}`);
    } catch (error) {
      console.warn(`⚠️ Error unloading component ${componentId}:`, error);
    }
  }

  /**
   * Limpia todos los componentes cargados
   */
  unloadAllComponents(): void {
    try {
      this.cache.clear();
      this.vueWrappers.clear();
      this.registry.clear();
      console.log('🧹 All components unloaded');
    } catch (error) {
      console.warn('⚠️ Error during cleanup:', error);
    }
  }

  /**
   * Recarga un componente específico
   * @param config - Configuración del componente
   * @returns Promise del componente recargado
   */
  async reloadComponent(config: ComponentConfig): Promise<any> {
    console.log(`🔄 Reloading component: ${config.id}`);
    
    // Descargar componente actual
    this.unloadComponent(config.id);
    
    // Cargar nuevamente
    return await this.loadComponent(config);
  }

  /**
   * Obtiene estadísticas de componentes cargados
   * @returns Estadísticas del servicio
   */
  getStats() {
    return {
      cachedComponents: this.cache.size(),
      registeredComponents: this.registry.getRegisteredCount(),
      vueWrappers: this.vueWrappers.size,
      components: Array.from(this.vueWrappers.keys())
    };
  }

  /**
   * Verifica la salud de un componente
   * @param config - Configuración del componente
   * @returns Status de salud
   */
  async checkComponentHealth(config: ComponentConfig): Promise<ComponentHealthStatus> {
    return await this.healthCheck.checkComponentHealth(config);
  }

  /**
   * Verifica la salud de todos los componentes cargados
   * @returns Mapa de status por componente
   */
  async checkAllComponentsHealth(): Promise<Map<string, ComponentHealthStatus>> {
    const configs = this.registry.getAllConfigs();
    const healthStatuses = new Map<string, ComponentHealthStatus>();
    
    const healthPromises = configs.map(async (config) => {
      try {
        const status = await this.healthCheck.checkComponentHealth(config);
        healthStatuses.set(config.id, status);
      } catch (error) {
        healthStatuses.set(config.id, {
          isHealthy: false,
          responseTime: 0,
          error: (error as Error).message,
          lastCheck: new Date()
        });
      }
    });
    
    await Promise.allSettled(healthPromises);
    return healthStatuses;
  }

  /**
   * Crea un componente de loading para mostrar mientras carga
   * @param config - Configuración del componente
   * @param timeoutMs - Timeout en milliseconds
   * @returns Componente Vue de loading
   */
  createLoadingComponent(config: ComponentConfig, timeoutMs: number = 10000): any {
    return ErrorHandlerService.createLoadingComponent(config, timeoutMs);
  }

  /**
   * Crea un componente placeholder
   * @param config - Configuración del componente
   * @returns Componente Vue placeholder
   */
  createPlaceholderComponent(config: ComponentConfig): any {
    return ErrorHandlerService.createPlaceholderComponent(config);
  }

  /**
   * Obtiene todas las configuraciones registradas
   * @returns Array de configuraciones
   */
  getAllConfigs(): ComponentConfig[] {
    return this.registry.getAllConfigs();
  }

  /**
   * Busca componentes por criterio
   * @param predicate - Función de filtrado
   * @returns Array de configuraciones que cumplen el criterio
   */
  findComponents(predicate: (config: ComponentConfig) => boolean): ComponentConfig[] {
    return this.registry.findComponents(predicate);
  }
}

// Singleton instance
let externalComponentService: ExternalComponentService | null = null;

/**
 * Obtiene la instancia singleton del servicio
 * @returns Instancia del servicio
 */
export function getExternalComponentService(): ExternalComponentService {
  if (!externalComponentService) {
    externalComponentService = new ExternalComponentService();
  }
  return externalComponentService;
}

/**
 * Función de conveniencia para cargar un componente
 * Mantiene compatibilidad con la API anterior
 * @param config - Configuración del componente
 * @returns Promise del componente Vue
 */
export async function loadExternalComponent(config: ComponentConfig): Promise<any> {
  const service = getExternalComponentService();
  return await service.loadComponent(config);
}

// Re-exportar tipos y clases para facilitar imports
export type { 
  ComponentConfig, 
  ComponentHealthStatus,
  VueWrapperProps,
  VueWrapperEvents 
} from './types';

export {
  ComponentCache,
  ComponentRegistry, 
  HealthCheckService,
  ScriptLoader,
  VueWrapperFactory,
  ErrorHandlerService
};

// Log de inicialización
console.log('📦 External Component System initialized');
console.log('   - Component loading and caching');
console.log('   - Vue wrapper creation'); 
console.log('   - Health monitoring');
console.log('   - Error handling and fallbacks');
