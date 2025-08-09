<template>
	<div
		class="custom-node"
		:class="{ 'node-selected': isNodeSelected }"
		tabindex="0"
		style="pointer-events: auto"
		@mouseenter="onMouseEnter"
		@mouseleave="onMouseLeave"
	>
		<!-- Toolbar flotante -->
		<NodeToolbar 
			:visible="showToolbar"
			@copy="handleCopy"
			@duplicate="handleDuplicate" 
			@delete="handleDelete"
			@menu="handleMenu"
		/>

		<!-- Warning icon -->
		<NodeWarning :hasError="hasError" />

		<Handle type="target" :position="Position.Left" id="input" />
		
		<NodeContent
			:icon="nodeIcon"
			:label="nodeLabel"
			:subtitle="nodeSubtitle"
			:typeDisplay="nodeTypeDisplay"
			:version="nodeVersion"
		/>
		
		<Handle type="source" :position="Position.Right" id="output" />
	</div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { watch, onBeforeUnmount } from 'vue';
import { useNodeValidation } from '../../composables/useNodeValidation';
import NodeWarning from '../NodeWarning.vue';

// Modular components and composables
import NodeToolbar from './components/NodeToolbar.vue';
import NodeContent from './components/NodeContent.vue';
import { useNodeState } from './composables/useNodeState';
import { useNodeAppearance } from './composables/useNodeAppearance';
import { useNodeEvents } from './composables/useNodeEvents';
import type { NodeProps, NodeEvents } from './types';

// Props and events (mantener compatibilidad exacta)
const props = defineProps<NodeProps>();
const emit = defineEmits<NodeEvents>();

// Composables
const { showToolbar, isHovered, isNodeSelected, nodeInstance, onMouseEnter, onMouseLeave, cleanup } = useNodeState();
const { nodeLabel, nodeSubtitle, nodeType, nodeTypeDisplay, nodeVersion, nodeIcon } = useNodeAppearance(props, nodeInstance);
const { handleCopy, handleDuplicate, handleDelete, handleMenu } = useNodeEvents(
	props, 
	emit, 
	nodeInstance, 
	nodeType, 
	nodeLabel
);

// Usar el sistema de validación unificado
const { hasError } = useNodeValidation({ validateConnections: true });

// Observar selección para mostrar/ocultar toolbar
watch(isNodeSelected, (selected) => {
	if (selected) {
		showToolbar.value = true;
	} else if (!isHovered.value) {
		showToolbar.value = false;
	}
});

// Watcher para forzar reactividad en cambios de data del nodo
watch(
	() => nodeInstance?.node?.data,
	(newData: any, oldData: any) => {
		// Este watcher asegura que las computed properties se actualicen
		// cuando cambian las propiedades data del nodo
		if (newData?.componentVersion !== oldData?.componentVersion) {
			console.log('🔄 Versión del componente cambió:', newData?.componentVersion);
		}
	},
	{ deep: true, immediate: true }
);

// Cleanup al desmontar el componente
onBeforeUnmount(() => {
	cleanup();
});
</script>

<style scoped>
.custom-node {
	background: #23272e !important;
	color: #fff;
	border-radius: 14px;
	padding: 16px 32px 16px 20px;
	min-width: 200px;
	min-height: 64px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
	font-size: 1rem;
	z-index: 1;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.22) inset;
	border: 2.5px solid transparent; /* Cambiado de #23272e a transparente */
	transition:
		box-shadow 0.2s ease,
		border-color 0.2s ease,
		transform 0.2s ease;
	cursor: grab;
}

.custom-node:hover {
	border-color: rgba(59, 130, 246, 0.5) !important;
}

.custom-node.node-selected {
	border-color: #3b82f6 !important;
	box-shadow:
		0 2px 12px 0 rgba(0, 0, 0, 0.22) inset,
		0 0 0 3px rgba(59, 130, 246, 0.2);
}

.custom-node:active {
	cursor: grabbing;
}

/* Toolbar flotante */
.node-toolbar-inline {
	position: absolute;
	top: -48px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	gap: 8px;
	background: rgba(0, 0, 0, 0.9);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	padding: 8px;
	z-index: 1000;
	backdrop-filter: blur(10px);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.toolbar-btn {
	width: 32px;
	height: 32px;
	border: none;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
}

.toolbar-btn:hover {
	background: rgba(255, 255, 255, 0.2);
	transform: translateY(-1px);
}

.copy-btn:hover {
	background: rgba(34, 197, 94, 0.2);
}

.duplicate-btn:hover {
	background: rgba(59, 130, 246, 0.2);
}

.delete-btn:hover {
	background: rgba(239, 68, 68, 0.2);
}

.menu-btn:hover {
	background: rgba(156, 163, 175, 0.2);
}

.node-content {
	display: flex;
	align-items: center;
	gap: 12px;
	flex: 1;
}

.node-icon {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.node-icon :deep(svg) {
	width: 100%;
	height: 100%;
	fill: currentColor;
}

.node-labels {
	display: flex;
	flex-direction: column;
	gap: 2px;
	flex: 1;
	min-width: 0;
}

.node-title {
	font-size: 1rem;
	font-weight: 600;
	line-height: 1.2;
	color: #fff;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.node-type-badge {
	font-size: 0.75rem;
	color: #9ca3af;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.node-version {
	font-size: 0.7rem;
	color: #6b7280;
	font-weight: 400;
	line-height: 1;
}

/* Handlers grandes y visibles específicos para CustomNode - ESPECIFICIDAD MÁXIMA */
.custom-node.custom-node.custom-node :deep(.vue-flow__handle) {
	width: 18px !important;
	height: 18px !important;
	min-width: 18px !important;
	min-height: 18px !important;
	border: 2.5px solid #fff !important;
	background: #222 !important;
	z-index: 10 !important;
	border-radius: 50%;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
	transform-origin: center center !important;
	opacity: 1 !important; /* SIEMPRE VISIBLES */
}

/* Los handlers se mantienen visibles siempre, no solo en hover */
.custom-node.custom-node.custom-node:hover :deep(.vue-flow__handle) {
	opacity: 1 !important;
}

/* Posicionamiento correcto para handlers de CustomNode - ESPECIFICIDAD MÁXIMA */
.custom-node.custom-node.custom-node :deep(.vue-flow__handle[data-handlepos="left"]) {
	left: -20px !important; /* Posicionado fuera del borde izquierdo */
}

.custom-node.custom-node.custom-node :deep(.vue-flow__handle[data-handlepos="right"]) {
	right: -30px !important; /* Posicionado fuera del borde derecho */
}

/* Efecto hover específico para CustomNode - ESPECIFICIDAD MÁXIMA */
.custom-node.custom-node.custom-node :deep(.vue-flow__handle:hover) {
	width: 22px !important;
	height: 22px !important;
	border: 3px solid #fff !important;
	background: #1faaff !important;
	box-shadow: 
		0 0 0 2px rgba(31, 170, 255, 0.3),
		0 2px 8px rgba(0, 0, 0, 0.3) !important;
	transform: scale(1.1) !important;
}

/* Posicionamiento hover corregido para CustomNode - ESPECIFICIDAD MÁXIMA */
.custom-node.custom-node.custom-node :deep(.vue-flow__handle[data-handlepos="left"]:hover) {
	left: -20px !important; /* Mantener posición en hover - NO MOVER */
	transition: none !important; /* Evitar parpadeos durante transiciones */
}

.custom-node.custom-node.custom-node :deep(.vue-flow__handle[data-handlepos="right"]:hover) {
	right: -30px !important; /* Mantener posición en hover - NO MOVER */
	transition: none !important; /* Evitar parpadeos durante transiciones */
}

/* Estados de conexión */
.custom-node.custom-node :deep(.vue-flow__handle.connecting) {
	opacity: 1 !important;
	border-color: #22c55e !important;
	background: #22c55e !important;
	box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3) !important;
}

.custom-node.custom-node :deep(.vue-flow__handle.valid) {
	border-color: #22c55e !important;
	background: #22c55e !important;
	box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3) !important;
}

.custom-node.custom-node :deep(.vue-flow__handle.invalid) {
	border-color: #ef4444 !important;
	background: #ef4444 !important;
	box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3) !important;
}
</style>
