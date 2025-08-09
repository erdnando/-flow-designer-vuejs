import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { NodeCategory, SearchState } from './types';

/**
 * Composable para funcionalidad de búsqueda de nodos
 */
export function useNodeSearch(categories: Ref<NodeCategory[]>) {
  // Estado reactivo de búsqueda
  const searchQuery = ref<string>('');
  
  /**
   * Categorías filtradas basadas en el query de búsqueda
   */
  const filteredCategories: ComputedRef<NodeCategory[]> = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    
    // Si no hay query, retornar todas las categorías
    if (!query) {
      return categories.value;
    }
    
    // Filtrar categorías y nodos que coincidan con el query
    return categories.value
      .map((category) => ({
        ...category,
        nodes: category.nodes.filter((node) => 
          node.label.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query) ||
          (node.templateId && node.templateId.toLowerCase().includes(query))
        ),
      }))
      .filter((category) => category.nodes.length > 0); // Solo categorías con nodos
  });
  
  /**
   * Número total de nodos filtrados
   */
  const totalFilteredNodes: ComputedRef<number> = computed(() => {
    return filteredCategories.value.reduce((total, category) => 
      total + category.nodes.length, 0
    );
  });
  
  /**
   * Indica si hay una búsqueda activa
   */
  const hasActiveSearch: ComputedRef<boolean> = computed(() => {
    return searchQuery.value.trim().length > 0;
  });
  
  /**
   * Indica si no hay resultados de búsqueda
   */
  const hasNoResults: ComputedRef<boolean> = computed(() => {
    return hasActiveSearch.value && totalFilteredNodes.value === 0;
  });
  
  /**
   * Establece el query de búsqueda
   * @param query - Nuevo query de búsqueda
   */
  function setSearchQuery(query: string): void {
    searchQuery.value = query;
    console.log(`🔍 Search query updated: "${query}"`);
  }
  
  /**
   * Limpia la búsqueda
   */
  function clearSearch(): void {
    searchQuery.value = '';
    console.log('🔍 Search cleared');
  }
  
  /**
   * Busca nodos por tipo específico
   * @param nodeType - Tipo de nodo a buscar
   * @returns Nodos que coinciden
   */
  function findNodesByType(nodeType: string) {
    const results: Array<{ category: string; node: any }> = [];
    
    categories.value.forEach(category => {
      category.nodes.forEach(node => {
        if (node.type === nodeType) {
          results.push({ category: category.name, node });
        }
      });
    });
    
    return results;
  }
  
  /**
   * Busca nodos por template ID
   * @param templateId - ID del template a buscar
   * @returns Nodos que coinciden
   */
  function findNodesByTemplateId(templateId: string) {
    const results: Array<{ category: string; node: any }> = [];
    
    categories.value.forEach(category => {
      category.nodes.forEach(node => {
        if (node.templateId === templateId) {
          results.push({ category: category.name, node });
        }
      });
    });
    
    return results;
  }
  
  /**
   * Obtiene estadísticas de búsqueda
   */
  function getSearchStats() {
    return {
      query: searchQuery.value,
      totalCategories: categories.value.length,
      filteredCategories: filteredCategories.value.length,
      totalNodes: categories.value.reduce((total, cat) => total + cat.nodes.length, 0),
      filteredNodes: totalFilteredNodes.value,
      hasResults: !hasNoResults.value,
      isActive: hasActiveSearch.value
    };
  }
  
  /**
   * Obtiene el estado actual de búsqueda
   * @returns Estado de búsqueda
   */
  function getSearchState(): SearchState {
    return {
      query: searchQuery.value,
      filteredCategories: filteredCategories.value
    };
  }
  
  return {
    // Estado reactivo
    searchQuery,
    filteredCategories,
    totalFilteredNodes,
    hasActiveSearch,
    hasNoResults,
    
    // Métodos
    setSearchQuery,
    clearSearch,
    findNodesByType,
    findNodesByTemplateId,
    getSearchStats,
    getSearchState
  };
}
