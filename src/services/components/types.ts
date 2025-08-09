/**
 * Tipos e interfaces para el sistema de carga de componentes externos
 */

/**
 * Configuración de un componente externo
 */
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

/**
 * Caché de promesas de carga de componentes
 */
export interface LoadingCache {
  [key: string]: Promise<any>;
}

/**
 * Propiedades de un wrapper Vue
 */
export interface VueWrapperProps {
  sessionId?: string;
  userId?: string;
  flowContext?: Record<string, any>;
  nodeData?: Record<string, any>;
  inputData?: Record<string, any>;
}

/**
 * Eventos emitidos por el wrapper Vue
 */
export interface VueWrapperEvents {
  next: [data?: any];
  previous: [data?: any];
  'data-change': [data: any];
  error: [message: string];
  'component-ready': [data: any];
  'node-completed': [data: any];
  retry: [];
}

/**
 * Estado del caché de componentes
 */
export interface CacheStatus {
  loadingPromises: number;
  loadedComponents: number;
  registeredComponents: number;
}

/**
 * Resultado de un health check
 */
export interface HealthCheckResult {
  success: boolean;
  status?: number;
  error?: string;
}

/**
 * Estado de salud de un componente externo
 */
export interface ComponentHealthStatus {
  isHealthy: boolean;
  responseTime: number;
  error?: string;
  lastCheck: Date;
}
