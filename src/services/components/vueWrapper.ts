import { markRaw, defineComponent } from 'vue';
import type { ComponentConfig } from './types';

/**
 * Servicio para crear wrappers Vue para Web Components
 */
export class VueWrapperFactory {
  
  /**
   * Crea un wrapper Vue para un Web Component
   * @param config - Configuración del componente
   * @returns Componente Vue wrapeado
   */
  static createVueWrapper(config: ComponentConfig) {
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
      ] as const,
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
          // Event listener para component-ready
          element.addEventListener('component-ready', (e: any) => {
            this.isReady = true;
            this.$emit('component-ready', e.detail);
            console.log(`✅ Component ready: ${config.id}`);
          });
          
          // Event listener para output-data (navegación hacia adelante)
          element.addEventListener('output-data', (e: any) => {
            this.$emit('next', e.detail);
          });
          
          // Event listener para node-completed
          element.addEventListener('node-completed', (e: any) => {
            this.$emit('node-completed', e.detail);
          });
          
          // Event listener para request-navigation
          element.addEventListener('request-navigation', (e: any) => {
            if (e.detail.direction === 'previous') {
              this.$emit('previous', e.detail.data);
            }
          });
          
          // Event listener para data-changed
          element.addEventListener('data-changed', (e: any) => {
            this.$emit('data-change', e.detail);
          });
          
          // Event listener para node-error
          element.addEventListener('node-error', (e: any) => {
            this.$emit('error', e.detail.error);
          });
        },
        
        updateComponentProps() {
          const componentElement = this.componentElement;
          if (!componentElement) return;
          
          // Actualizar atributos básicos
          if (this.sessionId) {
            componentElement.setAttribute('session-id', this.sessionId);
          }
          
          if (this.userId) {
            componentElement.setAttribute('user-id', this.userId);
          }
          
          // Actualizar flow-context
          if (this.flowContext) {
            componentElement.setAttribute('flow-context', JSON.stringify(this.flowContext));
          }
          
          // Actualizar config del nodo
          if (this.nodeData?.config) {
            componentElement.setAttribute('config', JSON.stringify(this.nodeData.config));
          }
          
          // Actualizar input data usando método del componente si existe
          if (this.inputData && typeof (componentElement as any).setInputData === 'function') {
            try {
              (componentElement as any).setInputData(this.inputData);
            } catch (error) {
              console.warn(`⚠️ Error setting input data for ${config.id}:`, error);
            }
          }
        },
        
        cleanupComponent() {
          const componentElement = this.componentElement;
          if (componentElement) {
            try {
              componentElement.remove();
              this.componentElement = null;
              console.log(`🧹 Component wrapper cleaned up: ${config.id}`);
            } catch (error) {
              console.warn(`⚠️ Error cleaning up component ${config.id}:`, error);
            }
          }
        },
        
        getComponentData() {
          const componentElement = this.componentElement;
          if (componentElement && typeof (componentElement as any).getOutputData === 'function') {
            try {
              return (componentElement as any).getOutputData();
            } catch (error) {
              console.warn(`⚠️ Error getting output data from ${config.id}:`, error);
              return null;
            }
          }
          return null;
        },
        
        setComponentData(data: any) {
          const componentElement = this.componentElement;
          if (componentElement && typeof (componentElement as any).setInputData === 'function') {
            try {
              (componentElement as any).setInputData(data);
            } catch (error) {
              console.warn(`⚠️ Error setting component data for ${config.id}:`, error);
            }
          }
        },

        // Método para validar si el componente está listo
        isComponentReady(): boolean {
          return this.isReady && this.componentElement !== null;
        },

        // Método para reinicializar el componente
        async reinitializeComponent() {
          this.cleanupComponent();
          await this.initializeComponent();
        }
      }
    }));
  }

  /**
   * Crea múltiples wrappers Vue
   * @param configs - Array de configuraciones
   * @returns Mapa de wrappers por ID de componente
   */
  static createMultipleWrappers(configs: ComponentConfig[]): Map<string, any> {
    const wrappers = new Map<string, any>();
    
    configs.forEach(config => {
      try {
        const wrapper = this.createVueWrapper(config);
        wrappers.set(config.id, wrapper);
        console.log(`🎨 Wrapper created for ${config.id}`);
      } catch (error) {
        console.error(`❌ Failed to create wrapper for ${config.id}:`, error);
      }
    });
    
    console.log(`🎨 Created ${wrappers.size}/${configs.length} Vue wrappers`);
    return wrappers;
  }

  /**
   * Valida que un Web Component tenga los métodos esperados
   * @param element - Elemento del Web Component
   * @param requiredMethods - Métodos requeridos
   * @returns true si tiene todos los métodos
   */
  static validateWebComponentInterface(element: HTMLElement, requiredMethods: string[] = []): boolean {
    const defaultMethods = ['setInputData', 'getOutputData'];
    const methodsToCheck = [...defaultMethods, ...requiredMethods];
    
    return methodsToCheck.every(method => {
      const hasMethod = typeof (element as any)[method] === 'function';
      if (!hasMethod) {
        console.warn(`⚠️ Web Component missing method: ${method}`);
      }
      return hasMethod;
    });
  }
}
