import type { ComponentConfig } from './types';
import { mockComponentRegistry } from '../MockComponentRegistry';

/**
 * Registry de componentes externos
 * Maneja el registro y recuperación de configuraciones de componentes
 */
export class ComponentRegistry {
  private componentRegistry = new Map<string, ComponentConfig>();
  private initialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Inicializa el registry con componentes predefinidos
   */
  private initialize(): void {
    if (this.initialized) {
      console.log('📋 ComponentRegistry already initialized');
      return;
    }

    try {
      console.log('📋 Initializing ComponentRegistry...');
      
      // Registrar todos los componentes del MockComponentRegistry
      mockComponentRegistry.forEach(component => {
        this.componentRegistry.set(component.id, component);
        console.log(`📋 Component auto-registered: ${component.id} v${component.version}`);
      });
      
      console.log('📋 Registry initialized with components:', 
                 Array.from(this.componentRegistry.keys()));
      
      this.initialized = true;
    } catch (error) {
      console.error('❌ Error initializing ComponentRegistry:', error);
      throw error;
    }
  }

  /**
   * Registra un nuevo componente en el registry
   * @param config - Configuración del componente
   */
  registerComponent(config: ComponentConfig): void {
    this.componentRegistry.set(config.id, config);
    console.log(`📋 Component registered: ${config.id} v${config.version}`);
  }

  /**
   * Obtiene la configuración de un componente
   * @param id - ID del componente
   * @returns Configuración del componente o undefined
   */
  getComponent(id: string): ComponentConfig | undefined {
    return this.componentRegistry.get(id);
  }

  /**
   * Verifica si un componente está registrado
   * @param id - ID del componente
   * @returns true si está registrado
   */
  isRegistered(id: string): boolean {
    return this.componentRegistry.has(id);
  }

  /**
   * Obtiene todos los IDs de componentes registrados
   * @returns Array de IDs de componentes
   */
  getRegisteredComponentIds(): string[] {
    return Array.from(this.componentRegistry.keys());
  }

  /**
   * Obtiene todas las configuraciones de componentes
   * @returns Array de configuraciones
   */
  getAllConfigs(): ComponentConfig[] {
    return Array.from(this.componentRegistry.values());
  }

  /**
   * Obtiene el número de componentes registrados
   * @returns Número de componentes
   */
  getRegisteredCount(): number {
    return this.componentRegistry.size;
  }

  /**
   * Desregistra un componente
   * @param id - ID del componente a desregistrar
   * @returns true si se desregistró correctamente
   */
  unregisterComponent(id: string): boolean {
    const result = this.componentRegistry.delete(id);
    if (result) {
      console.log(`📋 Component unregistered: ${id}`);
    }
    return result;
  }

  /**
   * Limpia todo el registry (solo para testing)
   */
  clear(): void {
    this.componentRegistry.clear();
    this.initialized = false;
    console.log('🧹 ComponentRegistry cleared');
  }

  /**
   * Busca componentes por un criterio
   * @param predicate - Función de filtrado
   * @returns Array de configuraciones que cumplen el criterio
   */
  findComponents(predicate: (config: ComponentConfig) => boolean): ComponentConfig[] {
    return Array.from(this.componentRegistry.values()).filter(predicate);
  }
}
