import { markRaw, defineComponent } from 'vue';

// Interfaces basadas en la documentación técnica
export interface ComponentConfig {
  id: string;
  name: string;
  version: string;
  cdnUrl: string;
  fallbackUrl?: string;
  type: 'web-component';
  metadata: {
    tagName: string;
    description: string;
    category: string;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
  };
  healthcheck: {
    url: string;
    method: string;
    expectedStatus: number;
  };
}

interface LoadingCache {
  [key: string]: Promise<any>;
}

// Importar MockComponentRegistry directamente para inicializar el registry
import { mockComponentRegistry } from './MockComponentRegistry';

/**
 * Servicio para cargar componentes externos React como Web Components
 * Versión 2.0 - Con arquitectura mejorada y mejor manejo de errores
 */
export class ExternalComponentLoader {
  private static loadingCache: LoadingCache = {};
  private static loadedComponents = new Set<string>();
  private static componentRegistry = new Map<string, ComponentConfig>();

  // Inicializar el registry con los componentes mock automáticamente
  static {
    try {
      console.log('Inicializando ExternalComponentLoader...');
      // Registrar todos los componentes del MockComponentRegistry
      mockComponentRegistry.forEach(component => {
        ExternalComponentLoader.componentRegistry.set(component.id, component);
        console.log(`📋 Component auto-registered: ${component.id} v${component.version}`);
      });
      console.log('Registry inicializado con componentes:', 
                 Array.from(ExternalComponentLoader.componentRegistry.keys()));
    } catch (error) {
      console.error('Error al inicializar el registry de componentes:', error);
    }
  }

  /**
   * Registra un componente en el registry local
   */
  static registerComponent(config: ComponentConfig) {
    this.componentRegistry.set(config.id, config);
    console.log(`📋 Component registered: ${config.id} v${config.version}`);
  }

  /**
   * Obtiene un componente del registry
   */
  static getComponent(id: string): ComponentConfig | undefined {
    return this.componentRegistry.get(id);
  }

  /**
   * Carga un componente externo de forma asíncrona
   */
  static async loadComponent(componentId: string, version?: string): Promise<any> {
    const cacheKey = `${componentId}_${version || 'latest'}`;
    
    // Verificar caché de carga
    if (cacheKey in this.loadingCache) {
      console.log(`⏳ Component loading in progress: ${componentId}`);
      return this.loadingCache[cacheKey];
    }

    // Crear promesa de carga y cachearla
    this.loadingCache[cacheKey] = this._performLoad(componentId, version);
    
    try {
      const result = await this.loadingCache[cacheKey];
      console.log(`✅ Component loaded successfully: ${componentId}`);
      return result;
    } catch (error) {
      // Limpiar caché en caso de error
      delete this.loadingCache[cacheKey];
      throw error;
    }
  }

  /**
   * Realiza la carga efectiva del componente
   */
  private static async _performLoad(componentId: string, _version?: string): Promise<any> {
    const config = this.componentRegistry.get(componentId);
    
    if (!config) {
      throw new Error(`Component not found in registry: ${componentId}`);
    }

    console.log(`🔄 Loading component: ${config.id} v${config.version}`);

    try {
      // Verificar health check si está disponible
      if (config.healthcheck) {
        await this.performHealthCheck(config);
      }

      // Cargar el script del Web Component
      await this.loadWebComponentScript(config);
      
      // Crear y retornar el wrapper Vue
      return this.createVueWrapper(config);
      
    } catch (error) {
      console.error(`❌ Error loading component ${componentId}:`, error);
      
      // Intentar fallback si está disponible
      if (config.fallbackUrl) {
        console.log(`🔄 Trying fallback for ${componentId}...`);
        try {
          await this.loadWebComponentScript({...config, cdnUrl: config.fallbackUrl});
          return this.createVueWrapper(config);
        } catch (fallbackError) {
          console.error(`❌ Fallback also failed for ${componentId}:`, fallbackError);
        }
      }
      
      // Retornar componente de error
      return this.createErrorComponent(config, error);
    }
  }

  /**
   * Realiza health check del componente
   */
  private static async performHealthCheck(config: ComponentConfig): Promise<void> {
    try {
      const response = await fetch(config.healthcheck.url, {
        method: config.healthcheck.method || 'GET',
        cache: 'no-cache'
      });
      
      if (response.status !== config.healthcheck.expectedStatus) {
        throw new Error(`Health check failed. Expected ${config.healthcheck.expectedStatus}, got ${response.status}`);
      }
      
      console.log(`💚 Health check passed for ${config.id}`);
    } catch (error) {
      console.warn(`⚠️ Health check failed for ${config.id}:`, error);
      throw error;
    }
  }

  /**
   * Carga el script del Web Component
   */
  private static async loadWebComponentScript(config: ComponentConfig): Promise<void> {
    const tagName = config.metadata.tagName;
    
    // Verificar si ya está cargado
    if (this.loadedComponents.has(tagName)) {
      console.log(`🎯 Component already loaded: ${tagName}`);
      return;
    }

    return new Promise((resolve, reject) => {
      // Verificar si el custom element ya está definido
      if (customElements.get(tagName)) {
        this.loadedComponents.add(tagName);
        console.log(`🎯 Custom element already registered: ${tagName}`);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = config.cdnUrl;
      script.async = true;
      
      script.onload = () => {
        // Esperar a que el custom element se registre
        const checkRegistration = () => {
          if (customElements.get(tagName)) {
            this.loadedComponents.add(tagName);
            console.log(`🎯 Custom element registered: ${tagName}`);
            resolve();
          } else {
            // Retry después de un breve delay
            setTimeout(checkRegistration, 100);
          }
        };
        
        checkRegistration();
      };
      
      script.onerror = () => {
        document.head.removeChild(script);
        reject(new Error(`Failed to load script: ${config.cdnUrl}`));
      };
      
      document.head.appendChild(script);
      console.log(`📦 Loading script: ${config.cdnUrl}`);
    });
  }

  /**
   * Crea wrapper Vue para Web Component
   */
  private static createVueWrapper(config: ComponentConfig) {
    return markRaw(defineComponent({
      name: `${config.id}Wrapper`,
      props: {
        sessionId: String,
        userId: String,
        flowContext: Object,
        nodeData: Object,
        inputData: Object
      },
      emits: [
        'next',
        'previous', 
        'data-change',
        'error',
        'component-ready',
        'node-completed'
      ],
      template: `
        <div class="external-component-wrapper">
          <div class="component-container" ref="container"></div>
        </div>
      `,
      data() {
        return {
          componentElement: null as HTMLElement | null,
          isReady: false
        };
      },
      async mounted() {
        await this.initializeComponent();
      },
      beforeUnmount() {
        this.cleanupComponent();
      },
      watch: {
        sessionId() { this.updateComponentProps(); },
        userId() { this.updateComponentProps(); },
        flowContext() { this.updateComponentProps(); },
        inputData() { this.updateComponentProps(); }
      },
      methods: {
        async initializeComponent() {
          try {
            const element = document.createElement(config.metadata.tagName);
            this.componentElement = element;
            this.setupEventListeners(element);
            this.updateComponentProps();
            (this.$refs as any).container.appendChild(element);
            console.log(`🎨 Component wrapper initialized: ${config.id}`);
          } catch (error) {
            console.error(`❌ Error initializing component wrapper:`, error);
            this.$emit('error', (error as Error).message);
          }
        },
        
        setupEventListeners(element: HTMLElement) {
          element.addEventListener('component-ready', (e: any) => {
            this.isReady = true;
            this.$emit('component-ready', e.detail);
            console.log(`✅ Component ready: ${config.id}`);
          });
          
          element.addEventListener('output-data', (e: any) => {
            this.$emit('next', e.detail);
          });
          
          element.addEventListener('node-completed', (e: any) => {
            this.$emit('node-completed', e.detail);
          });
          
          element.addEventListener('request-navigation', (e: any) => {
            if (e.detail.direction === 'previous') {
              this.$emit('previous', e.detail.data);
            }
          });
          
          element.addEventListener('data-changed', (e: any) => {
            this.$emit('data-change', e.detail);
          });
          
          element.addEventListener('node-error', (e: any) => {
            this.$emit('error', e.detail.error);
          });
        },
        
        updateComponentProps() {
          const componentElement = this.componentElement;
          if (!componentElement) return;
          
          if (this.sessionId) {
            componentElement.setAttribute('session-id', this.sessionId);
          }
          
          if (this.userId) {
            componentElement.setAttribute('user-id', this.userId);
          }
          
          if (this.flowContext) {
            componentElement.setAttribute('flow-context', JSON.stringify(this.flowContext));
          }
          
          if (this.nodeData?.config) {
            componentElement.setAttribute('config', JSON.stringify(this.nodeData.config));
          }
          
          if (this.inputData && typeof (componentElement as any).setInputData === 'function') {
            (componentElement as any).setInputData(this.inputData);
          }
        },
        
        cleanupComponent() {
          const componentElement = this.componentElement;
          if (componentElement) {
            componentElement.remove();
            this.componentElement = null;
          }
        },
        
        getComponentData() {
          const componentElement = this.componentElement;
          if (componentElement && typeof (componentElement as any).getOutputData === 'function') {
            return (componentElement as any).getOutputData();
          }
          return null;
        },
        
        setComponentData(data: any) {
          const componentElement = this.componentElement;
          if (componentElement && typeof (componentElement as any).setInputData === 'function') {
            (componentElement as any).setInputData(data);
          }
        }
      }
    }));
  }

  /**
   * Crea componente de error como fallback
   */
  private static createErrorComponent(config: ComponentConfig, error: any) {
    return markRaw(defineComponent({
      name: 'ComponentError',
      props: {
        sessionId: String,
        userId: String,
        flowContext: Object,
        nodeData: Object,
        inputData: Object
      },
      emits: ['retry', 'next'],
      template: `
        <div class="component-error">
          <div class="error-content">
            <h3>⚠️ Error al cargar componente</h3>
            <p><strong>Componente:</strong> {{ componentName }} v{{ componentVersion }}</p>
            <p><strong>Error:</strong> {{ errorMessage }}</p>
            <div class="error-actions">
              <button @click="retry" class="retry-btn">🔄 Reintentar</button>
              <button @click="skip" class="skip-btn">⏭️ Omitir</button>
            </div>
          </div>
        </div>
      `,
      data() {
        return {
          componentName: config.name,
          componentVersion: config.version,
          errorMessage: error?.message || 'Error desconocido'
        };
      },
      methods: {
        retry() {
          this.$emit('retry');
        },
        skip() {
          this.$emit('next', { skipped: true, reason: 'Component load error' });
        }
      }
    }));
  }

  /**
   * Limpia el caché de componentes cargados
   */
  static clearCache() {
    this.loadingCache = {};
    this.loadedComponents.clear();
    console.log('🧹 Component cache cleared');
  }

  /**
   * Obtiene el estado del caché
   */
  static getCacheStatus() {
    return {
      loadingPromises: Object.keys(this.loadingCache).length,
      loadedComponents: this.loadedComponents.size,
      registeredComponents: this.componentRegistry.size
    };
  }

  /**
   * Obtiene todos los IDs de componentes registrados
   */
  static getRegisteredComponentIds(): string[] {
    return Array.from(this.componentRegistry.keys());
  }
  
  /**
   * Verifica si un componente está registrado
   */
  static isRegistered(id: string): boolean {
    return this.componentRegistry.has(id);
  }
}