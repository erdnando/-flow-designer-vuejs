<template>
  <div class="accordion-section">
    <!-- Header de la categoría -->
    <div 
      class="accordion-header"
      :class="{ 'active': isExpanded }"
      @click="onToggle"
    >
      <div class="accordion-title">
        <span class="category-name">{{ category.name }}</span>
        <span class="node-count">({{ category.nodes.length }})</span>
      </div>
      <div class="accordion-arrow" :class="{ 'expanded': isExpanded }">
        <svg width="12" height="12" :viewBox="ICONS.ACCORDION_ARROW.viewBox" fill="currentColor">
          <path v-html="ICONS.ACCORDION_ARROW.path"></path>
        </svg>
      </div>
    </div>
    
    <!-- Contenido de la categoría -->
    <transition name="accordion" @enter="onEnter" @leave="onLeave">
      <div 
        v-show="isExpanded"
        class="accordion-content"
        :class="{ 'expanded': isExpanded }"
      >
        <div class="node-grid" :class="gridClass">
          <NodeCard
            v-for="node in category.nodes"
            :key="nodeKey(node)"
            :node="node"
            :node-type-meta="nodeTypeMeta"
            :show-badge="showNodeBadges"
            :clickable="nodeClickable"
            @drag-start="onNodeDragStart"
            @drag-end="onNodeDragEnd"
            @click="onNodeClick"
          />
        </div>
        
        <!-- Mensaje cuando no hay nodos -->
        <div v-if="category.nodes.length === 0" class="empty-category">
          No hay nodos en esta categoría
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NodeCategory, NodeItem } from './types';
import { ICONS } from './constants';
import NodeCard from './NodeCard.vue';

// Props
interface Props {
  category: NodeCategory;
  isExpanded: boolean;
  nodeTypeMeta?: Record<string, { icon: string; color?: string }>;
  showNodeBadges?: boolean;
  nodeClickable?: boolean;
  gridColumns?: number;
}

const props = withDefaults(defineProps<Props>(), {
  nodeTypeMeta: () => ({
    default: { icon: '🔧' }
  }),
  showNodeBadges: true,
  nodeClickable: false,
  gridColumns: 2
});

// Events
interface Emits {
  'toggle': [categoryName: string];
  'node-drag-start': [node: NodeItem, event: DragEvent];
  'node-drag-end': [node: NodeItem, event: DragEvent];
  'node-click': [node: NodeItem];
}

const emit = defineEmits<Emits>();

// Computed
const gridClass = computed(() => {
  return `grid-cols-${props.gridColumns}`;
});

/**
 * Genera una clave única para cada nodo
 */
function nodeKey(node: NodeItem): string {
  return node.templateId || `${node.type}-${node.label}`;
}

/**
 * Maneja el toggle de la categoría
 */
function onToggle(): void {
  emit('toggle', props.category.name);
}

/**
 * Maneja el inicio de drag de un nodo
 */
function onNodeDragStart(node: NodeItem, event: DragEvent): void {
  emit('node-drag-start', node, event);
}

/**
 * Maneja el final de drag de un nodo
 */
function onNodeDragEnd(node: NodeItem, event: DragEvent): void {
  emit('node-drag-end', node, event);
}

/**
 * Maneja el click en un nodo
 */
function onNodeClick(node: NodeItem): void {
  emit('node-click', node);
}

/**
 * Animación de entrada del acordeón
 */
function onEnter(el: Element): void {
  const element = el as HTMLElement;
  element.style.height = 'auto';
  const height = element.offsetHeight;
  element.style.height = '0';
  element.offsetHeight; // Force reflow
  element.style.height = `${height}px`;
}

/**
 * Animación de salida del acordeón
 */
function onLeave(el: Element): void {
  const element = el as HTMLElement;
  element.style.height = `${element.offsetHeight}px`;
  element.offsetHeight; // Force reflow
  element.style.height = '0';
}
</script>

<style scoped>
.accordion-section {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  background: transparent;
  transition: background-color 0.2s ease;
  user-select: none;
}

.accordion-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.accordion-header.active {
  background: rgba(255, 255, 255, 0.08);
}

.accordion-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.category-name {
  font-weight: 600;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.node-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

.accordion-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.2s ease, color 0.2s ease;
}

.accordion-arrow.expanded {
  transform: rotate(180deg);
  color: rgba(255, 255, 255, 0.9);
}

.accordion-content {
  overflow: hidden;
  transition: height 0.3s ease;
}

.accordion-content.expanded {
  height: auto;
}

.node-grid {
  display: grid;
  gap: 8px;
  padding: 12px 16px;
  grid-template-columns: repeat(v-bind('props.gridColumns'), 1fr);
}

.grid-cols-1 {
  grid-template-columns: 1fr;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.empty-category {
  padding: 24px 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-style: italic;
}

/* Animaciones del acordeón */
.accordion-enter-active,
.accordion-leave-active {
  transition: height 0.3s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  height: 0;
}

/* Responsive */
@media (max-width: 320px) {
  .node-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 400px) {
  .node-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
