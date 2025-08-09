<template>
  <NodePanelModular
    :initial-collapsed="false"
    :default-expanded-categories="['Control de flujo', 'Proceso', 'Motores de decisión']"
    :node-type-meta="nodeTypeMeta"
    @node-drag-start="onNodeDragStart"
  />
</template>

<script setup lang="ts">
import NodePanelModular from './nodePanel/index.vue';
import type { NodeItem } from './nodePanel/types';

// Metadatos de tipos de nodos (del NodePanel original)
const nodeTypeMeta = {
  start: { icon: '🚀', color: '#10B981' },
  end: { icon: '🏁', color: '#EF4444' },
  condition: { icon: '🔀', color: '#F59E0B' },
  process: { icon: '⚙️', color: '#3B82F6' },
  default: { icon: '🔧', color: '#6B7280' }
};

/**
 * Maneja el evento drag-start de nodos
 */
function onNodeDragStart(data: { node: NodeItem; event: DragEvent }) {
  console.log('🎯 Node drag started:', data.node);
}
</script>

<style scoped>
/* El NodePanel modular maneja sus propios estilos */
</style>
