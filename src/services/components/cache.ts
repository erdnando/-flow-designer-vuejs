import type { LoadingCache, CacheStatus } from './types';

/**
 * Sistema de caché para componentes externos
 * Maneja el caché de promesas de carga y componentes cargados
 */
export class ComponentCache {
  private loadingCache: LoadingCache = {};
  private loadedComponents = new Set<string>();

  /**
   * Obtiene una promesa de carga del caché
   * @param componentId - ID del componente
   * @returns Promesa de carga o undefined
   */
  get(componentId: string): Promise<any> | undefined {
    return this.loadingCache[componentId];
  }

  /**
   * Almacena una promesa de carga en el caché
   * @param componentId - ID del componente
   * @param promise - Promesa a cachear
   */
  set(componentId: string, promise: Promise<any>): void {
    this.loadingCache[componentId] = promise;
    console.log(`💾 Cached loading promise for component: ${componentId}`);
  }

  /**
   * Elimina una promesa del caché de carga
   * @param componentId - ID del componente a eliminar
   */
  delete(componentId: string): void {
    delete this.loadingCache[componentId];
    this.loadedComponents.delete(componentId);
    console.log(`🗑️ Removed from cache: ${componentId}`);
  }

  /**
   * Verifica si un componente ya está cargado
   * @param tagName - Nombre del tag del componente
   * @returns true si está cargado
   */
  isComponentLoaded(tagName: string): boolean {
    return this.loadedComponents.has(tagName);
  }

  /**
   * Marca un componente como cargado
   * @param tagName - Nombre del tag del componente
   */
  markComponentAsLoaded(tagName: string): void {
    this.loadedComponents.add(tagName);
    console.log(`🎯 Component marked as loaded: ${tagName}`);
  }

  /**
   * Verifica si un componente está en proceso de carga
   * @param componentId - ID del componente
   * @returns true si está cargando
   */
  isLoading(componentId: string): boolean {
    return componentId in this.loadingCache;
  }

  /**
   * Limpia todo el caché
   */
  clear(): void {
    this.loadingCache = {};
    this.loadedComponents.clear();
    console.log('🧹 Component cache cleared');
  }

  /**
   * Obtiene el tamaño del caché
   * @returns Número de promesas en caché
   */
  size(): number {
    return Object.keys(this.loadingCache).length;
  }

  /**
   * Obtiene el estado actual del caché
   * @returns Estado del caché
   */
  getStatus(): CacheStatus {
    return {
      loadingPromises: Object.keys(this.loadingCache).length,
      loadedComponents: this.loadedComponents.size,
      registeredComponents: 0 // Se actualizará desde el registry
    };
  }

  /**
   * Obtiene la lista de componentes cargados
   * @returns Array de nombres de componentes cargados
   */
  getLoadedComponents(): string[] {
    return Array.from(this.loadedComponents);
  }

  /**
   * Verifica si un componente está en caché
   * @param componentId - ID del componente
   * @returns true si está en caché
   */
  has(componentId: string): boolean {
    return componentId in this.loadingCache;
  }

  /**
   * Obtiene todos los IDs de componentes en caché
   * @returns Array de IDs
   */
  getKeys(): string[] {
    return Object.keys(this.loadingCache);
  }
}
