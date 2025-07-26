<template>
	<div 
		class="start-node"
		:class="{ 'node-selected': isNodeSelected }"
		@mouseenter="onMouseEnter"
		@mouseleave="onMouseLeave"
	>
		<!-- Toolbar flotante -->
		<div 
			v-if="showToolbar" 
			class="node-toolbar-inline"
			@click.stop
			@mousedown.stop
		>
			<!-- Botón de copiar -->
			<button
				class="toolbar-btn copy-btn"
				@click="handleCopy"
				title="Copiar nodo"
			>
				<img 
					src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI5IiB5PSI5IiB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHJ4PSIyIiByeT0iMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTUgMTVINGEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg5YTIgMiAwIDAgMSAyIDJ2MSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+"
					width="16"
					height="16"
					alt="Copiar"
				/>
			</button>

			<!-- Botón de duplicar -->
			<button
				class="toolbar-btn duplicate-btn"
				@click="handleDuplicate"
				title="Duplicar nodo"
			>
				<img 
					src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgNGgyYTIgMiAwIDAgMSAyIDJ2MTRhMiAyIDAgMCAxLTIgMkg2YTIgMiAwIDAgMS0yLTJWNmEyIDIgMCAwIDEgMi0yaDIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjxyZWN0IHg9IjgiIHk9IjIiIHdpZHRoPSI4IiBoZWlnaHQ9IjQiIHJ4PSIxIiByeT0iMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+"
					width="16"
					height="16"
					alt="Duplicar"
				/>
			</button>

			<!-- Botón de eliminar -->
			<button
				class="toolbar-btn delete-btn"
				@click="handleDelete"
				title="Eliminar nodo"
			>
				<img 
					src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTggNkw2IDE4TTYgNmwxMiAxMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=="
					width="16"
					height="16"
					alt="Eliminar"
				/>
			</button>

			<!-- Botón de menú -->
			<button
				class="toolbar-btn menu-btn"
				@click="handleMenu"
				title="Más opciones"
			>
				<img 
					src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxLjUiIGZpbGw9IndoaXRlIiAvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNSIgcj0iMS41IiBmaWxsPSJ3aGl0ZSIgLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjE5IiByPSIxLjUiIGZpbGw9IndoaXRlIiAvPjwvc3ZnPg=="
					width="16"
					height="16"
					alt="Menú"
				/>
			</button>
		</div>

		<!-- Warning icon -->
		<NodeWarning :hasError="hasError" />

		<div class="start-node-content">
			<div class="start-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="10" fill="#4CAF50" stroke="#2E7D32" stroke-width="2"/>
					<polygon points="10,8 16,12 10,16" fill="white"/>
				</svg>
			</div>
			<div class="start-text">
				<div class="start-title">START</div>
				<div class="start-subtitle">{{ subtitle || 'Inicio del flujo' }}</div>
			</div>
		</div>
		<!-- Solo handle de salida (derecha) -->
		<Handle 
			type="source" 
			:position="Position.Right" 
			:style="{ background: '#4CAF50', width: '12px', height: '12px' }"
		/>
	</div>
</template>

<script setup lang="ts">
import { Handle, Position, useNode } from '@vue-flow/core';
import { computed, ref, onBeforeUnmount } from 'vue';
import { useNodeValidation } from '../composables/useNodeValidation';
import NodeWarning from './NodeWarning.vue';

interface Props {
	data?: {
		subtitle?: string;
		[key: string]: any;
	};
}

const props = withDefaults(defineProps<Props>(), {
	data: () => ({})
});

// Estado para la toolbar
const showToolbar = ref(false);
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
const nodeInstance = useNode();

// Validation composable
const { hasError } = useNodeValidation({
	validateConnections: true
});

// Emits para comunicar con el parent
const emit = defineEmits<{
	'node-copy': [node: any]
	'node-duplicate': [node: any]
	'node-delete': [nodeId: string]
	'node-menu': [event: MouseEvent, node: any]
}>();

const subtitle = computed(() => props.data?.subtitle || 'Inicio del flujo');

// Detectar si el nodo está seleccionado
const isNodeSelected = computed(() => nodeInstance?.node?.selected || false);

// Funciones simplificadas para manejar eventos de mouse
function onMouseEnter() {
	// Limpiar timeout previo si existe
	if (hoverTimeout) {
		clearTimeout(hoverTimeout);
		hoverTimeout = null;
	}
	
	showToolbar.value = true;
}

function onMouseLeave() {
	// Usar un timeout para evitar parpadeos rápidos
	if (hoverTimeout) {
		clearTimeout(hoverTimeout);
	}
	
	hoverTimeout = setTimeout(() => {
		showToolbar.value = false;
		hoverTimeout = null;
	}, 200);
}

// Funciones para manejar la toolbar
function handleCopy() {
	const nodeData = {
		type: 'start',
		label: 'START',
		data: props.data
	};
	emit('node-copy', nodeData);
}

function handleDuplicate() {
	const nodeData = {
		type: 'start',
		label: 'START',
		data: props.data,
		position: nodeInstance?.node?.position
	};
	emit('node-duplicate', nodeData);
}

function handleDelete() {
	if (nodeInstance?.node?.id) {
		emit('node-delete', nodeInstance.node.id);
	}
}

function handleMenu(event: MouseEvent) {
	emit('node-menu', event, nodeInstance?.node);
}

// Cleanup al desmontar el componente
onBeforeUnmount(() => {
	if (hoverTimeout) {
		clearTimeout(hoverTimeout);
		hoverTimeout = null;
	}
});
</script>

<style scoped>
.start-node {
	background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
	border: 2px solid #2E7D32;
	border-radius: 20px;
	padding: 12px 16px;
	min-width: 140px;
	position: relative;
	box-shadow: 
		0 4px 12px rgba(76, 175, 80, 0.3),
		0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease;
}

.start-node:hover {
	transform: translateY(-2px);
	box-shadow: 
		0 6px 16px rgba(76, 175, 80, 0.4),
		0 4px 8px rgba(0, 0, 0, 0.15);
}

.start-node-content {
	display: flex;
	align-items: center;
	gap: 10px;
	color: white;
}

.start-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
}

.start-text {
	flex: 1;
}

.start-title {
	font-weight: 700;
	font-size: 14px;
	letter-spacing: 1px;
	margin-bottom: 2px;
}

.start-subtitle {
	font-size: 11px;
	opacity: 0.9;
	font-weight: 400;
	line-height: 1.2;
}

/* Estilos para la toolbar inline */
.node-toolbar-inline {
	position: absolute;
	top: -45px;
	left: 50%;
	transform: translateX(-50%);
	z-index: 10000;
	display: flex;
	gap: 4px;
	background: rgba(0, 0, 0, 0.9);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 8px;
	padding: 6px;
	box-shadow: 
		0 4px 20px rgba(0, 0, 0, 0.6),
		0 2px 8px rgba(0, 0, 0, 0.4);
	backdrop-filter: blur(8px);
	pointer-events: auto;
	animation: toolbar-appear 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	will-change: transform, opacity;
}

@keyframes toolbar-appear {
	from {
		opacity: 0;
		transform: translateX(-50%) scale(0.9) translateY(6px);
	}
	to {
		opacity: 1;
		transform: translateX(-50%) scale(1) translateY(0);
	}
}

.toolbar-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 30px;
	height: 30px;
	border: none;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.1);
	color: rgba(255, 255, 255, 0.95);
	cursor: pointer;
	transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	font-size: 14px;
}

.toolbar-btn:hover {
	background: rgba(255, 255, 255, 0.15);
	transform: scale(1.05);
	color: rgba(255, 255, 255, 1);
}

.toolbar-btn:active {
	transform: scale(0.95);
	transition-duration: 0.05s;
}

.copy-btn:hover {
	background: rgba(34, 197, 94, 0.9);
	color: white;
	box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.4);
}

.duplicate-btn:hover {
	background: rgba(168, 85, 247, 0.9);
	color: white;
	box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.4);
}

.delete-btn:hover {
	background: rgba(239, 68, 68, 0.9);
	color: white;
	box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4);
}

.menu-btn:hover {
	background: rgba(59, 130, 246, 0.9);
	color: white;
	box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

.toolbar-btn img {
	pointer-events: none;
	transition: transform 0.15s ease;
}

.toolbar-btn:hover img {
	transform: scale(1.1);
}

/* Estilo para nodo seleccionado usando clase directa */
.start-node.node-selected {
	border-color: transparent !important;
	border-width: 0px !important;
	outline: none !important;
	box-shadow:
		0 0 0 2px #1faaff,
		0 0 0 4px #fff,
		0 0 20px 8px #1faaff66,
		0 2px 12px 0 #1faaff44,
		0 4px 24px 0 #1faaff22;
	animation: start-node-glow 2s infinite alternate;
	transform: scale(1.03);
	transition:
		box-shadow 0.2s ease,
		transform 0.2s ease;
	z-index: 20;
}

/* Handlers específicos para StartNode */
:deep(.vue-flow__handle) {
	width: 16px !important;
	height: 16px !important;
	border: 3px solid #fff !important;
	background: #4CAF50 !important;
	z-index: 10 !important;
	border-radius: 50%;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
	transform-origin: center center !important;
}

/* Posicionamiento correcto para handlers de StartNode */
:deep(.vue-flow__handle[data-handlepos="right"]) {
	right: -133px !important; /* Mitad del ancho del handler (16px/2) */
}

/* Efecto hover específico para StartNode que crece en lugar */
:deep(.vue-flow__handle:hover) {
	width: 20px !important;
	height: 20px !important;
	border: 4px solid #fff !important;
	background: #66BB6A !important;
	box-shadow: 
		0 0 0 2px rgba(76, 175, 80, 0.3),
		0 0 12px rgba(76, 175, 80, 0.6) !important;
}

/* Ajustar posición en hover para mantener centrado */
:deep(.vue-flow__handle[data-handlepos="right"]:hover) {
	right: -133px !important; /* Mitad del ancho hover (20px/2) */
}

@keyframes start-node-glow {
	0% {
		box-shadow:
			0 0 0 2px #1faaff,
			0 0 0 2px #fff,
			0 0 20px 8px #1faaff66,
			0 2px 12px 0 #1faaff44,
			0 4px 24px 0 #1faaff22;
	}
	100% {
		box-shadow:
			0 0 0 2px #1faaffdd,
			0 0 0 3px #fff,
			0 0 25px 12px #1faaff88,
			0 2px 14px 0 #1faaff66,
			0 4px 28px 0 #1faaff33;
	}
}
</style>
