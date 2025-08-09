<template>
  <div class="node-panel" :class="{ collapsed: panelState.collapsed.value }">
    <!-- Header del panel -->
    <NodePanelHeader 
      :collapsed="panelState.collapsed.value"
      :title="panelTitle"
      @toggle="onPanelToggle"
    />
    
    <!-- Contenido del panel (solo visible cuando no está colapsado) -->
    <div v-if="!panelState.collapsed.value" class="panel-content">
      <!-- Input de búsqueda -->
      <NodeSearchInput
        v-model="searchState.searchQuery.value"
        :placeholder="searchPlaceholder"
        :filtered-count="searchState.totalFilteredNodes.value"
        :has-results="!searchState.hasNoResults.value"
        :show-stats="showSearchStats"
        @search-change="onSearchChange"
        @clear="onSearchClear"
        ref="searchInputRef"
      />
      
      <!-- Container del acordeón -->
      <div class="accordion-container">
        <!-- Mensaje cuando no hay resultados de búsqueda -->
        <div v-if="searchState.hasNoResults.value" class="no-search-results">
          <div class="no-results-icon">🔍</div>
          <div class="no-results-text">
            No se encontraron nodos para "<strong>{{ searchState.searchQuery.value }}</strong>"
          </div>
          <button class="clear-search-btn" @click="onSearchClear">
            Limpiar búsqueda
          </button>
        </div>
        
        <!-- Secciones de categorías -->
        <NodeCategorySection
          v-for="category in searchState.filteredCategories.value"
          :key="category.name"
          :category="category"
          :is-expanded="categoryState.isCategoryExpanded(category.name)"
          :node-type-meta="nodeTypeMeta"
          :show-node-badges="showNodeBadges"
          :node-clickable="nodeClickable"
          :grid-columns="nodeGridColumns"
          @toggle="onCategoryToggle"
          @node-drag-start="onNodeDragStart"
          @node-drag-end="onNodeDragEnd"
          @node-click="onNodeClick"
        />
      </div>
      
      <!-- Footer con estadísticas (opcional) -->
      <div v-if="showFooterStats" class="panel-footer">
        <div class="stats">
          {{ totalNodes }} nodos en {{ totalCategories }} categorías
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { NodeItem } from './types';
import { PANEL_CONFIG, PANEL_Z_INDEX } from './constants';
import { usePanelState } from './usePanelState';
import { useNodeCategories } from './useNodeCategories';
import { useNodeSearch } from './useNodeSearch';

// Componentes
import NodePanelHeader from './NodePanelHeader.vue';
import NodeSearchInput from './NodeSearchInput.vue';
import NodeCategorySection from './NodeCategorySection.vue';

// Props
interface Props {
  initialCollapsed?: boolean;
  defaultExpandedCategories?: string[];
  panelTitle?: string;
  searchPlaceholder?: string;
  showSearchStats?: boolean;
  showNodeBadges?: boolean;
  showFooterStats?: boolean;
  nodeClickable?: boolean;
  nodeGridColumns?: number;
  nodeTypeMeta?: Record<string, { icon: string; color?: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  initialCollapsed: false,
  defaultExpandedCategories: () => ['Control de flujo', 'Proceso', 'Motores de decisión'],
  panelTitle: PANEL_CONFIG.PANEL_TITLE,
  searchPlaceholder: PANEL_CONFIG.SEARCH_PLACEHOLDER,
  showSearchStats: true,
  showNodeBadges: true,
  showFooterStats: false,
  nodeClickable: false,
  nodeGridColumns: 2,
  nodeTypeMeta: () => ({
    default: { icon: '🔧' }
  })
});

// Events
interface Emits {
  'panel-toggle': [collapsed: boolean];
  'node-drag-start': [data: { node: NodeItem; event: DragEvent }];
  'node-drag-end': [data: { node: NodeItem; event: DragEvent }];
  'node-click': [node: NodeItem];
  'category-toggle': [categoryName: string, expanded: boolean];
  'search-change': [query: string];
}

const emit = defineEmits<Emits>();

// Template refs
const searchInputRef = ref<InstanceType<typeof NodeSearchInput>>();

// Composables
const panelState = usePanelState(props.initialCollapsed);
const categoryState = useNodeCategories(props.defaultExpandedCategories);
const searchState = useNodeSearch(categoryState.nodeCategories);

// Computed properties
const totalNodes = computed(() => categoryState.totalNodes.value);
const totalCategories = computed(() => categoryState.totalCategories.value);

/**
 * Maneja el toggle del panel
 */
function onPanelToggle(): void {
  panelState.toggle();
  emit('panel-toggle', panelState.collapsed.value);
  
  // Si se expande el panel, enfocar la búsqueda
  if (!panelState.collapsed.value) {
    setTimeout(() => {
      searchInputRef.value?.focusInput();
    }, 100);
  }
}

/**
 * Maneja el toggle de una categoría
 */
function onCategoryToggle(categoryName: string): void {
  categoryState.toggleCategory(categoryName);
  const isExpanded = categoryState.isCategoryExpanded(categoryName);
  emit('category-toggle', categoryName, isExpanded);
}

/**
 * Maneja cambios en la búsqueda
 */
function onSearchChange(query: string): void {
  searchState.setSearchQuery(query);
  emit('search-change', query);
  
  // Si hay búsqueda activa, expandir todas las categorías para mejor visibilidad
  if (query.trim() && searchState.filteredCategories.value.length > 0) {
    searchState.filteredCategories.value.forEach(category => {
      if (!categoryState.isCategoryExpanded(category.name)) {
        categoryState.expandCategory(category.name);
      }
    });
  }
}

/**
 * Maneja la limpieza de búsqueda
 */
function onSearchClear(): void {
  searchState.clearSearch();
  emit('search-change', '');
}

/**
 * Maneja el inicio de drag de un nodo
 */
function onNodeDragStart(node: NodeItem, event: DragEvent): void {
  emit('node-drag-start', { node, event });
}

/**
 * Maneja el final de drag de un nodo
 */
function onNodeDragEnd(node: NodeItem, event: DragEvent): void {
  emit('node-drag-end', { node, event });
}

/**
 * Maneja el click en un nodo
 */
function onNodeClick(node: NodeItem): void {
  emit('node-click', node);
}

/**
 * Expande todas las categorías
 */
function expandAllCategories(): void {
  categoryState.expandAllCategories();
}

/**
 * Colapsa todas las categorías
 */
function collapseAllCategories(): void {
  categoryState.collapseAllCategories();
}

/**
 * Enfoca el input de búsqueda
 */
function focusSearch(): void {
  searchInputRef.value?.focusInput();
}

/**
 * Obtiene estadísticas del panel
 */
function getStats() {
  return {
    panel: panelState.getState(),
    categories: categoryState.getCategoryStats(),
    search: searchState.getSearchStats()
  };
}

// Exponer métodos públicos
defineExpose({
  // Estado
  panelState,
  categoryState,
  searchState,
  
  // Métodos de control
  expandAllCategories,
  collapseAllCategories,
  focusSearch,
  getStats
});
</script>

<style scoped>
.node-panel {
  width: 100%;
  height: 100vh;
  background: #23272e;
  color: #fff;
  border-right: 1.5px solid #23272e;
  box-shadow: 2px 0 12px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  transition: width v-bind('PANEL_CONFIG.COLLAPSE_TRANSITION_DURATION + "ms"');
  z-index: v-bind('PANEL_Z_INDEX');
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.node-panel.collapsed {
  width: v-bind('PANEL_CONFIG.COLLAPSED_WIDTH + "px"');
  min-width: v-bind('PANEL_CONFIG.COLLAPSED_WIDTH + "px"');
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
}

.accordion-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.no-search-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results-text {
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.4;
}

.clear-search-btn {
  background: rgba(59, 130, 246, 0.8);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.clear-search-btn:hover {
  background: rgba(59, 130, 246, 1);
}

.panel-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  margin-top: auto;
}

.stats {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

/* Scrollbar personalizado */
.accordion-container::-webkit-scrollbar {
  width: 6px;
}

.accordion-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.accordion-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.accordion-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
