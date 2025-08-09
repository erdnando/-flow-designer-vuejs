import { markRaw, defineComponent } from 'vue';
import type { ComponentConfig } from './types';

/**
 * Servicio para manejo de errores y componentes de fallback
 */
export class ErrorHandlerService {
  
  /**
   * Crea un componente de error genérico
   * @param config - Configuración del componente que falló
   * @param error - Error ocurrido
   * @returns Componente Vue de error
   */
  static createErrorComponent(config: ComponentConfig, error: Error | string) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    return markRaw(defineComponent({
      name: `${config.id}Error`,
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
        'node-completed',
        'retry-load'
      ] as const,
      template: `
        <div class="external-component-error">
          <div class="error-container">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
              <h3 class="error-title">Error loading component</h3>
              <p class="error-message">{{ errorMessage }}</p>
              <div class="error-details">
                <p><strong>Component ID:</strong> {{ config.id }}</p>
                <p><strong>Script URL:</strong> {{ config.scriptUrl }}</p>
                <p v-if="config.metadata.version"><strong>Version:</strong> {{ config.metadata.version }}</p>
              </div>
              <div class="error-actions">
                <button @click="retryLoad" class="retry-button">
                  🔄 Retry Load
                </button>
                <button @click="skipNode" class="skip-button">
                  ⏭️ Skip Node
                </button>
                <button @click="showDetails" class="details-button">
                  📋 Show Details
                </button>
              </div>
              <div v-if="showDetailedError" class="detailed-error">
                <h4>Technical Details:</h4>
                <pre>{{ fullError }}</pre>
              </div>
            </div>
          </div>
        </div>
      `,
      data() {
        return {
          config,
          errorMessage,
          fullError: typeof error === 'string' ? error : error.stack || error.toString(),
          showDetailedError: false
        };
      },
      mounted() {
        // Emitir error para notificación
        this.$emit('error', errorMessage);
        
        // Log del error
        console.error(`❌ Component Error [${config.id}]:`, error);
        
        // Emitir component-ready para que el flujo continue
        this.$emit('component-ready', { 
          success: false, 
          error: errorMessage,
          componentId: config.id 
        });
      },
      methods: {
        retryLoad() {
          this.$emit('retry-load', { componentId: config.id });
          console.log(`🔄 Retry requested for component: ${config.id}`);
        },
        
        skipNode() {
          // Continuar con datos vacíos
          this.$emit('next', { 
            skipped: true, 
            reason: 'Component load error',
            componentId: config.id 
          });
          console.log(`⏭️ Node skipped due to error: ${config.id}`);
        },
        
        showDetails() {
          this.showDetailedError = !this.showDetailedError;
        }
      },
      styles: `
        .external-component-error {
          padding: 20px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          margin: 10px 0;
        }
        
        .error-container {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        
        .error-icon {
          font-size: 32px;
          line-height: 1;
        }
        
        .error-content {
          flex: 1;
        }
        
        .error-title {
          margin: 0 0 8px 0;
          color: #856404;
          font-size: 18px;
        }
        
        .error-message {
          margin: 0 0 15px 0;
          color: #856404;
          font-weight: 500;
        }
        
        .error-details {
          margin-bottom: 15px;
          font-size: 14px;
          color: #6c757d;
        }
        
        .error-details p {
          margin: 4px 0;
        }
        
        .error-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .retry-button, .skip-button, .details-button {
          padding: 8px 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .retry-button {
          background: #28a745;
          color: white;
          border-color: #28a745;
        }
        
        .retry-button:hover {
          background: #218838;
        }
        
        .skip-button {
          background: #6c757d;
          color: white;
          border-color: #6c757d;
        }
        
        .skip-button:hover {
          background: #5a6268;
        }
        
        .details-button {
          background: #17a2b8;
          color: white;
          border-color: #17a2b8;
        }
        
        .details-button:hover {
          background: #138496;
        }
        
        .detailed-error {
          margin-top: 15px;
          padding: 10px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
        }
        
        .detailed-error h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #495057;
        }
        
        .detailed-error pre {
          margin: 0;
          padding: 8px;
          background: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: 3px;
          font-size: 12px;
          white-space: pre-wrap;
          word-wrap: break-word;
          max-height: 200px;
          overflow-y: auto;
        }
      `
    }));
  }

  /**
   * Crea un componente de carga con timeout
   * @param config - Configuración del componente
   * @param timeoutMs - Tiempo de timeout en ms
   * @returns Componente Vue de loading
   */
  static createLoadingComponent(config: ComponentConfig, timeoutMs: number = 10000) {
    return markRaw(defineComponent({
      name: `${config.id}Loading`,
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
        'node-completed',
        'timeout'
      ] as const,
      template: `
        <div class="external-component-loading">
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-content">
              <h3 class="loading-title">Loading component...</h3>
              <p class="loading-message">{{ config.metadata.displayName || config.id }}</p>
              <div class="loading-progress">
                <div class="progress-bar" :style="{ width: progressWidth + '%' }"></div>
              </div>
              <p class="loading-time">{{ elapsedTime }}s elapsed</p>
              <button @click="cancelLoad" class="cancel-button">
                ❌ Cancel Load
              </button>
            </div>
          </div>
        </div>
      `,
      data() {
        return {
          config,
          startTime: Date.now(),
          elapsedTime: 0,
          progressWidth: 0,
          progressInterval: null as number | null,
          timeoutHandle: null as number | null
        };
      },
      mounted() {
        this.startProgress();
        this.setupTimeout();
        console.log(`⏳ Loading component: ${config.id}`);
      },
      beforeUnmount() {
        this.cleanup();
      },
      methods: {
        startProgress() {
          this.progressInterval = window.setInterval(() => {
            this.elapsedTime = Math.round((Date.now() - this.startTime) / 1000);
            this.progressWidth = Math.min((this.elapsedTime / (timeoutMs / 1000)) * 100, 95);
          }, 100);
        },
        
        setupTimeout() {
          this.timeoutHandle = window.setTimeout(() => {
            this.cleanup();
            this.$emit('timeout', { 
              componentId: config.id,
              elapsedTime: this.elapsedTime 
            });
            console.warn(`⏰ Component load timeout: ${config.id}`);
          }, timeoutMs);
        },
        
        cancelLoad() {
          this.cleanup();
          this.$emit('error', 'Component load cancelled by user');
          console.log(`❌ Component load cancelled: ${config.id}`);
        },
        
        cleanup() {
          if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
          }
          if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
          }
        }
      },
      styles: `
        .external-component-loading {
          padding: 40px 20px;
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          text-align: center;
          margin: 10px 0;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e3e3e3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-title {
          margin: 0;
          color: #495057;
          font-size: 18px;
        }
        
        .loading-message {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }
        
        .loading-progress {
          width: 200px;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #20c997);
          border-radius: 4px;
          transition: width 0.2s ease;
        }
        
        .loading-time {
          margin: 0;
          color: #868e96;
          font-size: 12px;
        }
        
        .cancel-button {
          padding: 8px 16px;
          background: #dc3545;
          color: white;
          border: 1px solid #dc3545;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .cancel-button:hover {
          background: #c82333;
        }
      `
    }));
  }

  /**
   * Crea un componente placeholder simple
   * @param config - Configuración del componente
   * @returns Componente Vue placeholder
   */
  static createPlaceholderComponent(config: ComponentConfig) {
    return markRaw(defineComponent({
      name: `${config.id}Placeholder`,
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
        <div class="external-component-placeholder">
          <div class="placeholder-container">
            <div class="placeholder-icon">📦</div>
            <div class="placeholder-content">
              <h3 class="placeholder-title">External Component</h3>
              <p class="placeholder-message">{{ config.metadata.displayName || config.id }}</p>
              <div class="placeholder-actions">
                <button @click="continueFlow" class="continue-button">
                  ▶️ Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      `,
      data() {
        return {
          config
        };
      },
      mounted() {
        this.$emit('component-ready', { 
          success: true, 
          placeholder: true,
          componentId: config.id 
        });
        console.log(`📦 Placeholder mounted: ${config.id}`);
      },
      methods: {
        continueFlow() {
          this.$emit('next', { 
            placeholder: true,
            componentId: config.id,
            data: this.inputData || {} 
          });
          console.log(`▶️ Continuing from placeholder: ${config.id}`);
        }
      },
      styles: `
        .external-component-placeholder {
          padding: 30px 20px;
          background: #f1f3f4;
          border: 2px dashed #9aa0a6;
          border-radius: 8px;
          text-align: center;
          margin: 10px 0;
        }
        
        .placeholder-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        
        .placeholder-icon {
          font-size: 48px;
        }
        
        .placeholder-title {
          margin: 0;
          color: #5f6368;
          font-size: 18px;
        }
        
        .placeholder-message {
          margin: 0;
          color: #80868b;
          font-size: 14px;
        }
        
        .continue-button {
          padding: 10px 20px;
          background: #1a73e8;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .continue-button:hover {
          background: #1557b0;
        }
      `
    }));
  }
}
