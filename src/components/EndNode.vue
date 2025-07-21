<template>
	<div 
		class="end-node"
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
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
				</svg>
			</button>
			<button 
				class="toolbar-btn duplicate-btn" 
				@click="handleDuplicate"
				title="Duplicar nodo"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667-2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1-2.667 2.667H9.667A2.667 2.667 0 0 1 7 18.333z"/>
					<path d="M4.012 16.737A2.005 2.005 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/>
				</svg>
			</button>
			<button 
				class="toolbar-btn delete-btn" 
				@click="handleDelete"
				title="Eliminar nodo"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12"/>
				</svg>
			</button>
			<button 
				class="toolbar-btn menu-btn" 
				@click="handleMenu"
				title="Más opciones"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="1"/>
					<circle cx="19" cy="12" r="1"/>
					<circle cx="5" cy="12" r="1"/>
				</svg>
			</button>
		</div>

		<div class="end-node-content">
			<div class="end-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="10" fill="#F44336" stroke="#C62828" stroke-width="2"/>
					<rect x="8" y="8" width="8" height="8" fill="white" rx="1"/>
				</svg>
			</div>
			<div class="end-text">
				<div class="end-title">END</div>
				<div class="end-subtitle">{{ subtitle || 'Fin del flujo' }}</div>
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
import { computed, ref } from 'vue';

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
	copyNode: [nodeId: string];
	duplicateNode: [nodeId: string];
	deleteNode: [nodeId: string];
	showMenu: [nodeId: string];
}>();

// Hook para obtener información del nodo
const { node } = useNode();

// Estado para mostrar/ocultar la toolbar
const showToolbar = ref(false);

const subtitle = computed(() => props.data?.subtitle || 'Fin del flujo');

// Handlers para mostrar/ocultar toolbar
const onMouseEnter = () => {
	showToolbar.value = true;
};

const onMouseLeave = () => {
	showToolbar.value = false;
};

// Handlers para las acciones de la toolbar
const handleCopy = () => {
	emit('copyNode', node.id);
	console.log('Copiar nodo:', node.id);
};

const handleDuplicate = () => {
	emit('duplicateNode', node.id);
	console.log('Duplicar nodo:', node.id);
};

const handleDelete = () => {
	emit('deleteNode', node.id);
	console.log('Eliminar nodo:', node.id);
};

const handleMenu = () => {
	emit('showMenu', node.id);
	console.log('Mostrar menú para nodo:', node.id);
};
</script>

<style scoped>
.end-node {
	background: linear-gradient(135deg, #F44336 0%, #EF5350 100%);
	border: 2px solid #C62828;
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
	width: 32px;
	height: 32px;
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
	background: rgba(34, 197, 94, 0.15);
	color: #22c55e;
	box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.2);
}

.duplicate-btn:hover {
	background: rgba(168, 85, 247, 0.15);
	color: #a855f7;
	box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.2);
}

.delete-btn:hover {
	background: rgba(239, 68, 68, 0.15);
	color: #ef4444;
	box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2);
}

.menu-btn:hover {
	background: rgba(59, 130, 246, 0.15);
	color: #3b82f6;
	box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.toolbar-btn svg {
	pointer-events: none;
	transition: transform 0.15s ease;
}

.toolbar-btn:hover svg {
	transform: scale(1.1);
}
</style>
