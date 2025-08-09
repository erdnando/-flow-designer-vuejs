import type { ComponentConfig, HealthCheckResult, ComponentHealthStatus } from './types';

/**
 * Servicio para realizar health checks de componentes externos
 */
export class HealthCheckService {
  
  /**
   * Verifica la salud de un componente
   * @param config - Configuración del componente
   * @returns Status de salud del componente
   */
  async checkComponentHealth(config: ComponentConfig): Promise<ComponentHealthStatus> {
    const startTime = Date.now();
    
    try {
      const result = await HealthCheckService.performHealthCheck(config);
      const responseTime = Date.now() - startTime;
      
      return {
        isHealthy: result.success,
        responseTime,
        error: result.error,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: (error as Error).message,
        lastCheck: new Date()
      };
    }
  }
  
  /**
   * Realiza un health check para un componente
   * @param config - Configuración del componente
   * @returns Resultado del health check
   */
  static async performHealthCheck(config: ComponentConfig): Promise<HealthCheckResult> {
    if (!config.healthcheck) {
      console.log(`⚪ No health check configured for ${config.id}`);
      return { success: true };
    }

    try {
      console.log(`🔍 Performing health check for ${config.id}...`);
      
      const response = await fetch(config.healthcheck.url, {
        method: config.healthcheck.method || 'GET',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'FlowDesigner-HealthCheck/1.0'
        },
        // Timeout de 5 segundos
        signal: AbortSignal.timeout(5000)
      });
      
      const expectedStatus = config.healthcheck.expectedStatus;
      
      if (response.status !== expectedStatus) {
        const error = `Health check failed. Expected ${expectedStatus}, got ${response.status}`;
        console.warn(`⚠️ ${error} for ${config.id}`);
        
        return {
          success: false,
          status: response.status,
          error
        };
      }
      
      console.log(`💚 Health check passed for ${config.id} (${response.status})`);
      
      return {
        success: true,
        status: response.status
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`⚠️ Health check failed for ${config.id}:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Realiza health checks para múltiples componentes
   * @param configs - Array de configuraciones de componentes
   * @returns Mapa con resultados de health check por ID de componente
   */
  static async performBulkHealthCheck(configs: ComponentConfig[]): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();
    
    console.log(`🔍 Performing bulk health check for ${configs.length} components...`);
    
    // Realizar health checks en paralelo
    const promises = configs.map(async (config) => {
      const result = await this.performHealthCheck(config);
      results.set(config.id, result);
      return { id: config.id, result };
    });
    
    await Promise.all(promises);
    
    const successCount = Array.from(results.values()).filter(r => r.success).length;
    console.log(`📊 Health check summary: ${successCount}/${configs.length} passed`);
    
    return results;
  }

  /**
   * Verifica si un componente pasa el health check antes de cargarlo
   * @param config - Configuración del componente
   * @returns true si pasa o no tiene health check configurado
   */
  static async isComponentHealthy(config: ComponentConfig): Promise<boolean> {
    const result = await this.performHealthCheck(config);
    return result.success;
  }

  /**
   * Realiza un health check con reintentos
   * @param config - Configuración del componente
   * @param maxRetries - Número máximo de reintentos
   * @param retryDelay - Delay entre reintentos en ms
   * @returns Resultado del health check
   */
  static async performHealthCheckWithRetry(
    config: ComponentConfig, 
    maxRetries: number = 3, 
    retryDelay: number = 1000
  ): Promise<HealthCheckResult> {
    let lastResult: HealthCheckResult = { success: false, error: 'No attempts made' };
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Health check attempt ${attempt}/${maxRetries} for ${config.id}`);
      
      lastResult = await this.performHealthCheck(config);
      
      if (lastResult.success) {
        console.log(`✅ Health check succeeded on attempt ${attempt} for ${config.id}`);
        return lastResult;
      }
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying health check for ${config.id} in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    console.error(`❌ Health check failed after ${maxRetries} attempts for ${config.id}`);
    return lastResult;
  }
}
