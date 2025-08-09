<template>
  <div
    class="node-card"
    :class="{ 'dragging': isDragging }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="onClick"
  >
    <div class="node-card-icon">
      <span 
        v-if="displayIcon"
        v-html="displayIcon"
        class="icon-content"
      ></span>
      <span v-else class="icon-fallback">
        {{ node.label.charAt(0) }}
      </span>
    </div>
    <span class="node-card-label">{{ node.label }}</span>
    <div v-if="showBadge && node.templateId" class="template-badge">
      T
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { NodeItem } from './types';
import { useNodeDragDrop } from './useNodeDragDrop';

// Props
interface Props {
  node: NodeItem;
  nodeTypeMeta?: Record<string, { icon: string; color?: string }>;
  showBadge?: boolean;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  nodeTypeMeta: () => ({
    default: { icon: '🔧' }
  }),
  showBadge: true,
  clickable: false
});

// Events
interface Emits {
  'drag-start': [node: NodeItem, event: DragEvent];
  'drag-end': [node: NodeItem, event: DragEvent];
  'click': [node: NodeItem];
}

const emit = defineEmits<Emits>();

// Composables
const { onDragStart: handleDragStart } = useNodeDragDrop();

// Estado local
const isDragging = ref(false);

// Computed
const displayIcon = computed(() => {
  // Prioridad: icon del nodo > icon del tipo > fallback
  if (props.node.icon) {
    return props.node.icon;
  }
  
  if (props.nodeTypeMeta[props.node.type]?.icon) {
    return props.nodeTypeMeta[props.node.type].icon;
  }
  
  if (props.nodeTypeMeta.default?.icon) {
    return props.nodeTypeMeta.default.icon;
  }
  
  return null;
});

/**
 * Maneja el inicio del drag
 */
function onDragStart(event: DragEvent): void {
  isDragging.value = true;
  
  // Usar el composable para configurar los datos de drag
  handleDragStart(props.node, event);
  
  // Emitir evento personalizado
  emit('drag-start', props.node, event);
  
  console.log(`🎯 Dragging node: ${props.node.type} (${props.node.label})`);
}

/**
 * Maneja el final del drag
 */
function onDragEnd(event: DragEvent): void {
  isDragging.value = false;
  emit('drag-end', props.node, event);
  
  console.log(`🎯 Drag ended for node: ${props.node.type}`);
}

/**
 * Maneja el click en la tarjeta
 */
function onClick(): void {
  if (props.clickable) {
    emit('click', props.node);
    console.log(`👆 Node card clicked: ${props.node.type} (${props.node.label})`);
  }
}
</script>

<style scoped>
.node-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  min-height: 80px;
  user-select: none;
}

.node-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.node-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
  transform: rotate(2deg);
}

.node-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  font-size: 18px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
}

.icon-content {
  line-height: 1;
}

.icon-fallback {
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
}

.node-card-label {
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.9);
  word-break: break-word;
  hyphens: auto;
  max-width: 100%;
}

.template-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animación para el hover del icono */
.node-card:hover .node-card-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Efectos adicionales para diferentes estados */
.node-card[draggable="true"]:active {
  cursor: grabbing;
}

.node-card.clickable {
  cursor: pointer;
}

.node-card.clickable:active {
  transform: translateY(0) scale(0.98);
}
</style>
