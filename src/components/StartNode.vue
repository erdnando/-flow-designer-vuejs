<template>
	<div 
		class="start-node"
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
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2" fill="none"/>
				</svg>
			</button>

			<!-- Botón de duplicar -->
			<button
				class="toolbar-btn duplicate-btn"
				@click="handleDuplicate"
				title="Duplicar nodo"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
					<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2" fill="none"/>
					<rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2" fill="none"/>
				</svg>
			</button>

			<!-- Botón de eliminar -->
			<button
				class="toolbar-btn delete-btn"
				@click="handleDelete"
				title="Eliminar nodo"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
					<path
						d="M18 6L6 18M6 6l12 12"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>

			<!-- Botón de menú -->
			<button
				class="toolbar-btn menu-btn"
				@click="handleMenu"
				title="Más opciones"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="1.5" fill="currentColor" />
					<circle cx="12" cy="5" r="1.5" fill="currentColor" />
					<circle cx="12" cy="19" r="1.5" fill="currentColor" />
				</svg>
			</button>
		</div>

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

// Estado para la toolbar
const showToolbar = ref(false);
const nodeInstance = useNode();

// Emits para comunicar con el parent
const emit = defineEmits<{
	'node-copy': [node: any]
	'node-duplicate': [node: any]
	'node-delete': [nodeId: string]
	'node-menu': [event: MouseEvent, node: any]
}>();

const subtitle = computed(() => props.data?.subtitle || 'Inicio del flujo');

// Funciones para manejar eventos de mouse
function onMouseEnter() {
	showToolbar.value = true;
}

function onMouseLeave() {
	showToolbar.value = false;
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
