<template>
	<div 
		class="end-node"
		:class="{ 'node-selected': isSelected }"
		@mouseenter="onMouseEnter"
		@mouseleave="onMouseLeave"
	>
		<!-- Toolbar que aparece al hacer hover o cuando está seleccionado -->
		<div v-if="showToolbar" class="node-toolbar-inline">
			<button 
				class="toolbar-btn copy-btn" 
				@click="handleCopy"
				title="Copiar nodo"
			>
				<img 
					src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI5IiB5PSI5IiB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHJ4PSIyIiByeT0iMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTUgMTVINGEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg5YTIgMiAwIDAgMSAyIDJ2MSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+"
					width="16"
					height="16" 
					alt="Copiar"
				/>
			</button>
			<button 
				class="toolbar-btn duplicate-btn" 
				@click="handleDuplicate"
				title="Duplicar nodo"
			>
				<img 
					src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNyA3bTAgMi42NjdhMi42NjcgMi42NjcgMCAwIDEgMi42NjctMi42NjdoOC42NjZhMi42NjcgMi42NjcgMCAwIDEgMi42NjcgMi42Njd2OC42NjZhMi42NjcgMi42NjcgMCAwIDEtMi42NjcgMi42NjdIOS42NjdBMi42NjcgMi42NjcgMCAwIDEgNyAxOC4zMzN6IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNNC4wMTIgMTYuNzM3QTIuMDA1IDIuMDA1IDAgMCAxIDMgMTVWNWMwLTEuMS45LTIgMi0yaDEwYy43NSAwIDEuMTU4LjM4NSAxLjUgMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+"
					width="16"
					height="16" 
					alt="Duplicar"
				/>
			</button>
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

		<div class="end-node-content">
			<div class="end-icon">
				<svg width="30" height="30" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="10" fill="#F44336" stroke="#C62828" stroke-width="2"/>
					<rect x="8" y="8" width="8" height="8" fill="white" rx="1"/>
				</svg>
			</div>
			<div class="end-text">
				<div class="end-title">FIN</div>
				<div class="end-subtitle">{{ subtitle || 'Fin del flujo' }}</div>
				<div class="node-version">1.0.0</div>
			</div>
		</div>
		<!-- Solo handle de entrada (izquierda) -->
		<Handle 
			type="target" 
			:position="Position.Left" 
			:style="{ background: '#F44336', width: '12px', height: '12px' }"
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

// Emits para comunicar acciones al componente padre
const emit = defineEmits<{
	'node-copy': [nodeData: any];
	'node-duplicate': [nodeData: any];
	'node-delete': [nodeId: string];
	'node-menu': [event: MouseEvent, node: any];
}>();

// Hook para obtener información del nodo
const { node } = useNode();

// Validation composable
const { hasError } = useNodeValidation({
	validateConnections: true
});

// Estado para mostrar/ocultar la toolbar
const showToolbar = ref(false);
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

const subtitle = computed(() => props.data?.subtitle || 'Fin del flujo');

// Verificar si el nodo está seleccionado
const isSelected = computed(() => node?.selected || false);

// Handlers simplificados para mostrar/ocultar toolbar
const onMouseEnter = () => {
	// Limpiar timeout previo si existe
	if (hoverTimeout) {
		clearTimeout(hoverTimeout);
		hoverTimeout = null;
	}
	
	showToolbar.value = true;
};

const onMouseLeave = () => {
	// Usar un timeout para evitar parpadeos rápidos
	if (hoverTimeout) {
		clearTimeout(hoverTimeout);
	}
	
	hoverTimeout = setTimeout(() => {
		showToolbar.value = false;
		hoverTimeout = null;
	}, 200);
};

// Handlers para las acciones de la toolbar
const handleCopy = () => {
	const nodeData = {
		type: 'end',
		label: 'FIN',
		data: props.data
	};
	emit('node-copy', nodeData);
	console.log('Copiar nodo:', node.id);
};

const handleDuplicate = () => {
	const nodeData = {
		type: 'end',
		label: 'FIN',
		data: props.data,
		position: node.position
	};
	emit('node-duplicate', nodeData);
	console.log('Duplicar nodo:', node.id);
};

const handleDelete = () => {
	emit('node-delete', node.id);
	console.log('Eliminar nodo:', node.id);
};

const handleMenu = (event: MouseEvent) => {
	emit('node-menu', event, node);
	console.log('Mostrar menú para nodo:', node.id);
};

// Cleanup al desmontar el componente
onBeforeUnmount(() => {
	if (hoverTimeout) {
		clearTimeout(hoverTimeout);
		hoverTimeout = null;
	}
});
</script>

<style scoped>
.end-node {
	background: linear-gradient(135deg, #F44336 0%, #EF5350 100%);
	border: 2px solid transparent;
	border-radius: 20px;
	padding: 12px 16px;
	min-width: 140px;
	position: relative;
	box-shadow: 
		0 4px 12px rgba(244, 67, 54, 0.3),
		0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease;
}

.end-node:hover {
	transform: translateY(-2px);
	box-shadow: 
		0 6px 16px rgba(244, 67, 54, 0.4),
		0 4px 8px rgba(0, 0, 0, 0.15);
}

.end-node-content {
	display: flex;
	align-items: center;
	gap: 10px;
	color: white;
}

.end-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
}

.end-text {
	flex: 1;
}

.end-title {
	font-weight: 700;
	font-size: 14px;
	letter-spacing: 1px;
	margin-bottom: 2px;
}

.end-subtitle {
	font-size: 11px;
	opacity: 0.9;
	font-weight: 400;
	line-height: 1.2;
}

.node-version {
	display: inline-block;
	background: #2a4c2a;
	color: #90ee90;
	font-size: 0.7rem;
	font-weight: 500;
	border-radius: 4px;
	padding: 1px 6px;
	margin: 2px 0;
	letter-spacing: 0.01em;
	max-width: fit-content;
	border: 1px solid #4a6b4a;
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
.end-node.node-selected {
	border-color: transparent !important;
	border-width: 0px !important;
	outline: none !important;
	box-shadow:
		0 0 0 2px #1faaff,
		0 0 0 4px #fff,
		0 0 20px 8px #1faaff66,
		0 2px 12px 0 #1faaff44,
		0 4px 24px 0 #1faaff22;
	animation: end-node-glow 2s infinite alternate;
	transform: scale(1.03);
	transition:
		box-shadow 0.2s ease,
		transform 0.2s ease;
	z-index: 20;
}

/* Handlers específicos para EndNode */
:deep(.vue-flow__handle) {
	width: 16px !important;
	height: 16px !important;
	border: 3px solid #fff !important;
	background: #F44336 !important;
	z-index: 10 !important;
	border-radius: 50%;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
	transform-origin: center center !important;
}

/* Posicionamiento correcto para handlers de EndNode */
:deep(.vue-flow__handle[data-handlepos="left"]) {
	left: -18px !important; /* Mitad del ancho del handler (16px/2) here*/
}

/* Efecto hover específico para EndNode que crece en lugar */
:deep(.vue-flow__handle:hover) {
	width: 20px !important;
	height: 20px !important;
	border: 4px solid #fff !important;
	background: #E57373 !important;
	box-shadow: 
		0 0 0 2px rgba(244, 67, 54, 0.3),
		0 0 12px rgba(244, 67, 54, 0.6) !important;
}

/* Ajustar posición en hover para mantener centrado */
:deep(.vue-flow__handle[data-handlepos="left"]:hover) {
	left: -18px !important; /* Mitad del ancho hover (20px/2) here*/
}

@keyframes end-node-glow {
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
