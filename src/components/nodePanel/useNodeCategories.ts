import { ref, computed, onMounted, type ComputedRef } from 'vue';
import { useNodeCatalogStore } from '../../stores/nodeCatalog';
import type { NodeCategory, CategoryState } from './types';
import { STATIC_CATEGORIES, DEFAULT_EXPANDED_CATEGORIES } from './constants';

/**
 * Composable para manejo de categorías de nodos
 */
export function useNodeCategories(defaultExpandedCategories: string[] = DEFAULT_EXPANDED_CATEGORIES) {
  // Estado reactivo de categorías expandidas
  const expandedCategories = ref<Set<string>>(new Set(defaultExpandedCategories));
  
  // Store del catálogo de nodos
  const nodeCatalogStore = useNodeCatalogStore();
  
  /**
   * Categorías combinadas (estáticas + dinámicas del catálogo)
   */
  const nodeCategories: ComputedRef<NodeCategory[]> = computed(() => {
    // Categorías estáticas
    const staticCategories: NodeCategory[] = STATIC_CATEGORIES.map(config => ({
      name: config.name,
      nodes: config.nodes
    }));
    
    // Categorías dinámicas del catálogo de nodos
    const dynamicCategories: NodeCategory[] = Object.entries(nodeCatalogStore.nodesByCategory).map(
      ([categoryName, templates]) => ({
        name: categoryName,
        nodes: (templates as any[]).map((template: any) => ({
          type: template.type,
          label: template.name,
          templateId: template.id,
          icon: template.data?.icon,
          defaultData: template.data
        }))
      })
    );
    
    return [...staticCategories, ...dynamicCategories];
  });
  
  /**
   * Total de categorías disponibles
   */
  const totalCategories: ComputedRef<number> = computed(() => {
    return nodeCategories.value.length;
  });
  
  /**
   * Total de nodos en todas las categorías
   */
  const totalNodes: ComputedRef<number> = computed(() => {
    return nodeCategories.value.reduce((total, category) => 
      total + category.nodes.length, 0
    );
  });
  
  /**
   * Categorías expandidas actualmente
   */
  const expandedCategoryNames: ComputedRef<string[]> = computed(() => {
    return Array.from(expandedCategories.value);
  });
  
  /**
   * Verifica si una categoría está expandida
   * @param categoryName - Nombre de la categoría
   * @returns true si está expandida
   */
  function isCategoryExpanded(categoryName: string): boolean {
    return expandedCategories.value.has(categoryName);
  }
  
  /**
   * Alterna el estado de expansión de una categoría
   * @param categoryName - Nombre de la categoría
   */
  function toggleCategory(categoryName: string): void {
    if (expandedCategories.value.has(categoryName)) {
      expandedCategories.value.delete(categoryName);
      console.log(`📋 Category collapsed: ${categoryName}`);
    } else {
      expandedCategories.value.add(categoryName);
      console.log(`📋 Category expanded: ${categoryName}`);
    }
  }
  
  /**
   * Expande una categoría específica
   * @param categoryName - Nombre de la categoría
   */
  function expandCategory(categoryName: string): void {
    if (!expandedCategories.value.has(categoryName)) {
      expandedCategories.value.add(categoryName);
      console.log(`📋 Category expanded: ${categoryName}`);
    }
  }
  
  /**
   * Colapsa una categoría específica
   * @param categoryName - Nombre de la categoría
   */
  function collapseCategory(categoryName: string): void {
    if (expandedCategories.value.has(categoryName)) {
      expandedCategories.value.delete(categoryName);
      console.log(`📋 Category collapsed: ${categoryName}`);
    }
  }
  
  /**
   * Expande todas las categorías
   */
  function expandAllCategories(): void {
    nodeCategories.value.forEach(category => {
      expandedCategories.value.add(category.name);
    });
    console.log('📋 All categories expanded');
  }
  
  /**
   * Colapsa todas las categorías
   */
  function collapseAllCategories(): void {
    expandedCategories.value.clear();
    console.log('📋 All categories collapsed');
  }
  
  /**
   * Establece las categorías expandidas
   * @param categoryNames - Nombres de las categorías a expandir
   */
  function setExpandedCategories(categoryNames: string[]): void {
    expandedCategories.value = new Set(categoryNames);
    console.log(`📋 Expanded categories set: ${categoryNames.join(', ')}`);
  }
  
  /**
   * Obtiene una categoría por nombre
   * @param categoryName - Nombre de la categoría
   * @returns Categoría encontrada o undefined
   */
  function getCategoryByName(categoryName: string): NodeCategory | undefined {
    return nodeCategories.value.find(category => category.name === categoryName);
  }
  
  /**
   * Obtiene nodos de una categoría específica
   * @param categoryName - Nombre de la categoría
   * @returns Array de nodos o array vacío
   */
  function getNodesInCategory(categoryName: string) {
    const category = getCategoryByName(categoryName);
    return category?.nodes || [];
  }
  
  /**
   * Obtiene estadísticas de categorías
   */
  function getCategoryStats() {
    return {
      totalCategories: totalCategories.value,
      totalNodes: totalNodes.value,
      expandedCategories: expandedCategoryNames.value.length,
      collapsedCategories: totalCategories.value - expandedCategoryNames.value.length,
      categories: nodeCategories.value.map(cat => ({
        name: cat.name,
        nodeCount: cat.nodes.length,
        isExpanded: isCategoryExpanded(cat.name)
      }))
    };
  }
  
  /**
   * Obtiene el estado actual de categorías
   * @returns Estado de categorías
   */
  function getCategoryState(): CategoryState {
    return {
      expandedCategories: new Set(expandedCategories.value)
    };
  }
  
  /**
   * Inicializa el catálogo de nodos
   */
  function initializeCatalog(): void {
    nodeCatalogStore.initializeCatalog();
    console.log('📋 Node catalog initialized');
  }
  
  // Inicializar automáticamente al montar
  onMounted(() => {
    initializeCatalog();
  });
  
  return {
    // Estado reactivo
    nodeCategories,
    expandedCategories,
    totalCategories,
    totalNodes,
    expandedCategoryNames,
    
    // Métodos de verificación
    isCategoryExpanded,
    
    // Métodos de manipulación
    toggleCategory,
    expandCategory,
    collapseCategory,
    expandAllCategories,
    collapseAllCategories,
    setExpandedCategories,
    
    // Métodos de consulta
    getCategoryByName,
    getNodesInCategory,
    getCategoryStats,
    getCategoryState,
    
    // Inicialización
    initializeCatalog
  };
}
