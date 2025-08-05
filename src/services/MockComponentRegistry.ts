import type { ComponentConfig } from './ExternalComponentLoader';

/**
 * Configuración mock del Component Registry
 * 
 * Este archivo simula el Component Registry real que vendrá de un backend
 * Contiene configuraciones de ejemplo para desarrollo y testing
 */

export const mockComponentRegistry: ComponentConfig[] = [
  {
    id: 'landing',
    name: 'Landing Page Component',
    version: '1.0.0',
    cdnUrl: 'http://localhost:3001/dist/landing-v1.0.0.js',
    fallbackUrl: '/local-components/landing-fallback.js',
    type: 'web-component',
    metadata: {
      description: 'Componente de página de aterrizaje para captura de datos básicos',
      category: 'Proceso',
      tagName: 'landing-web-component',
      inputs: {
        sessionId: 'string',
        userId: 'string',
        flowContext: 'object',
        config: 'object',
        inputData: 'object'
      },
      outputs: {
        'landing_data': 'object',
        'output-data': 'object',
        'component-ready': 'boolean',
        'node-completed': 'object'
      }
    },
    healthcheck: {
      url: 'http://localhost:3001/health',
      method: 'GET',
      expectedStatus: 200
    }
  },
  
  {
    id: 'sms',
    name: 'SMS Verification Component',
    version: '1.0.0',
    cdnUrl: 'http://localhost:3002/dist/sms-v1.0.0.js',
    fallbackUrl: '/local-components/sms-fallback.js',
    type: 'web-component',
    metadata: {
      description: 'Componente para verificación por SMS',
      category: 'Verificación',
      tagName: 'sms-verification-component',
      inputs: {
        phoneNumber: 'string',
        sessionId: 'string',
        flowContext: 'object'
      },
      outputs: {
        'verification-code': 'string',
        'sms-verified': 'boolean',
        'verification-status': 'object'
      }
    },
    healthcheck: {
      url: 'http://localhost:3002/health',
      method: 'GET',
      expectedStatus: 200
    }
  },

  {
    id: 'ine',
    name: 'INE Validation Component',
    version: '1.0.0',
    cdnUrl: 'http://localhost:3003/dist/ine-v1.0.0.js',
    fallbackUrl: '/local-components/ine-fallback.js',
    type: 'web-component',
    metadata: {
      description: 'Componente para validación de INE',
      category: 'Identificación',
      tagName: 'ine-validation-component',
      inputs: {
        sessionId: 'string',
        userId: 'string',
        documentData: 'object'
      },
      outputs: {
        'ine-data': 'object',
        'validation-result': 'object',
        'document-verified': 'boolean'
      }
    },
    healthcheck: {
      url: 'http://localhost:3003/health',
      method: 'GET',
      expectedStatus: 200
    }
  }
];

/**
 * Simulación de registry con funciones de búsqueda
 */
export class MockComponentRegistry {
  private static components = new Map(
    mockComponentRegistry.map(config => [config.id, config])
  );

  /**
   * Obtiene configuración de un componente por ID
   */
  static getComponent(id: string): ComponentConfig | undefined {
    return this.components.get(id);
  }

  /**
   * Obtiene todos los componentes disponibles
   */
  static getAllComponents(): ComponentConfig[] {
    return Array.from(this.components.values());
  }

  /**
   * Obtiene componentes por categoría
   */
  static getComponentsByCategory(category: string): ComponentConfig[] {
    return Array.from(this.components.values())
      .filter(config => config.metadata.category === category);
  }

  /**
   * Verifica si un componente está disponible
   */
  static isComponentAvailable(id: string): boolean {
    return this.components.has(id);
  }

  /**
   * Simula health check de un componente
   */
  static async performHealthCheck(id: string): Promise<boolean> {
    const component = this.getComponent(id);
    if (!component) {
      console.warn(`⚠️ Component not found: ${id}`);
      return false;
    }

    try {
      // Simular health check asíncrono
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simular respuesta exitosa
      const isHealthy = Math.random() > 0.1; // 90% success rate
      
      if (isHealthy) {
        console.log(`💚 Health check passed for ${id}`);
      } else {
        console.warn(`❌ Health check failed for ${id}`);
      }
      
      return isHealthy;
    } catch (error) {
      console.error(`❌ Health check error for ${id}:`, error);
      return false;
    }
  }

  /**
   * Lista todas las versiones disponibles de un componente
   */
  static getAvailableVersions(componentId: string): string[] {
    const component = this.getComponent(componentId);
    if (!component) return [];
    
    // Por ahora solo retornamos la versión actual
    // En el futuro esto vendrá del registry real
    return [component.version];
  }

  /**
   * Simula la obtención de metadatos extendidos
   */
  static getComponentMetadata(id: string) {
    const component = this.getComponent(id);
    if (!component) return null;

    return {
      ...component.metadata,
      lastUpdate: new Date().toISOString(),
      status: 'active',
      downloadCount: Math.floor(Math.random() * 1000),
      rating: (Math.random() * 2 + 3).toFixed(1) // Rating entre 3.0 y 5.0
    };
  }

  /**
   * Obtiene estadísticas del registry
   */
  static getRegistryStats() {
    const components = this.getAllComponents();
    const categories = new Set(components.map(c => c.metadata.category));
    
    return {
      totalComponents: components.length,
      totalCategories: categories.size,
      categories: Array.from(categories),
      lastUpdate: new Date().toISOString()
    };
  }
}
