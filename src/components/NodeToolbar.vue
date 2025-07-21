<template>
	<div
		v-if="visible && node"
		class="node-toolbar"
		:style="{
			left: position.x + 'px',
			top: position.y + 'px',
		}"
		@click.stop
		@mousedown.stop
	>
		<!-- Botón de copiar -->
		<button
			class="toolbar-button copy-button"
			@click="handleCopy"
			title="Copiar nodo"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
				<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2" fill="none"/>
			</svg>
		</button>

		<!-- Botón de duplicar -->
		<button
			class="toolbar-button duplicate-button"
			@click="handleDuplicate"
			title="Duplicar nodo"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
				<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2" fill="none"/>
				<rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2" fill="none"/>
			</svg>
		</button>

		<!-- Botón de eliminar -->
		<button
			class="toolbar-button delete-button"
			@click="handleDelete"
			title="Eliminar nodo"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
			class="toolbar-button menu-button"
			@click="handleMenu"
			title="Más opciones"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
				<circle cx="12" cy="12" r="1.5" fill="currentColor" />
				<circle cx="12" cy="5" r="1.5" fill="currentColor" />
				<circle cx="12" cy="19" r="1.5" fill="currentColor" />
			</svg>
		</button>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@vue-flow/core'

interface Props {
	node: Node | null
	visible: boolean
}

interface Emits {
	(e: 'delete', nodeId: string): void
	(e: 'copy', node: Node): void
	(e: 'duplicate', node: Node): void
	(e: 'menu', event: MouseEvent, node: Node): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Calcular posición de la toolbar
const position = computed(() => {
	if (!props.node) {
		return { x: 0, y: 0 }
	}

	// Posición base del nodo
	const nodeX = props.node.position?.x || 0
	const nodeY = props.node.position?.y || 0
	
	// Ajustar según el tipo de nodo para un mejor posicionamiento
	let nodeWidth = 240; // Ancho por defecto más realista
	
	// Ajustar según tipo de nodo
	if (props.node.type === 'start' || props.node.type === 'end') {
		nodeWidth = 140;
	} else if (props.node.type === 'condition') {
		nodeWidth = 200;
	}
	
	const toolbarWidth = 140; // Ancho de la toolbar (4 botones)
	
	// Centrar la toolbar horizontalmente sobre el nodo
	const x = nodeX + (nodeWidth / 2) - (toolbarWidth / 2)
	// Posicionar arriba del nodo con un pequeño offset
	const y = nodeY - 45

	return { x, y }
})

function handleCopy() {
	if (props.node) {
		emit('copy', props.node)
	}
}

function handleDuplicate() {
	if (props.node) {
		emit('duplicate', props.node)
	}
}

function handleDelete() {
	if (props.node) {
		emit('delete', props.node.id)
	}
}

function handleMenu(event: MouseEvent) {
	if (props.node) {
		emit('menu', event, props.node)
	}
}
</script>

<style scoped>
.node-toolbar {
	position: absolute;
	z-index: 10000;
	display: flex;
	gap: 4px;
	background: rgba(0, 0, 0, 0.9);
	border: 2px solid rgba(255, 255, 255, 0.2);
	border-radius: 8px;
	padding: 6px;
	box-shadow: 
		0 4px 20px rgba(0, 0, 0, 0.6),
		0 2px 8px rgba(0, 0, 0, 0.4);
	backdrop-filter: blur(8px);
	pointer-events: auto;
	animation: toolbar-appear 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	will-change: transform, opacity;
	transform-origin: center bottom;
	min-width: 140px;
}

@keyframes toolbar-appear {
	from {
		opacity: 0;
		transform: scale(0.9) translateY(6px);
	}
	to {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

.toolbar-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 30px;
	height: 30px;
	border: none;
	border-radius: 6px;
	background: transparent;
	color: rgba(255, 255, 255, 0.8);
	cursor: pointer;
	transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	font-size: 14px;
}

.toolbar-button:hover {
	background: rgba(255, 255, 255, 0.08);
	transform: scale(1.05);
	color: rgba(255, 255, 255, 1);
}

.toolbar-button:active {
	transform: scale(0.95);
	transition-duration: 0.05s;
}

.delete-button:hover {
	background: rgba(239, 68, 68, 0.15);
	color: #ef4444;
	box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2);
}

.menu-button:hover {
	background: rgba(59, 130, 246, 0.15);
	color: #3b82f6;
	box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.copy-button:hover {
	background: rgba(34, 197, 94, 0.15);
	color: #22c55e;
	box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.2);
}

.duplicate-button:hover {
	background: rgba(168, 85, 247, 0.15);
	color: #a855f7;
	box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.2);
}

.toolbar-button svg {
	pointer-events: none;
	transition: transform 0.15s ease;
}

.toolbar-button:hover svg {
	transform: scale(1.1);
}
</style>
