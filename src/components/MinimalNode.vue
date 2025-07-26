<template>
	<div 
		:class="['minimal-node', { error: hasError, selected: isSelected }]" 
		@contextmenu.prevent
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
					width="18"
					height="18"
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
					width="18"
					height="18"
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
					src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTggNkw2IDE4TTYgNmwxMiAxMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4="
					width="18"
					height="18"
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
					src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjYiIHI9IjIiIHN0cm9rZT0id2hpdGUiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMiIgc3Ryb2tlPSJ3aGl0ZSIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjE4IiByPSIyIiBzdHJva2U9IndoaXRlIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg=="
					width="18"
					height="18"
					alt="Menú"
				/>
			</button>
		</div>

		<!-- Warning icon -->
		<NodeWarning :hasError="hasError" />

		{{ nodeLabel }}
	</div>
</template>

<script setup lang="ts">
import { useNode } from '@vue-flow/core';
import { computed, ref, watch, inject } from 'vue';
import { useNodeValidation } from '../composables/useNodeValidation';
import NodeWarning from './NodeWarning.vue';

const props = defineProps<{ data: { label?: string } }>();
const { data } = props;
const node = useNode ? useNode() : undefined;

// Estado para la toolbar
const showToolbar = ref(false);

// Inyectar funciones del padre
const deleteNodeFunction = inject<(nodeId: string) => void>('deleteNode');
const copyNodeFunction = inject<(nodeData: any) => void>('copyNode');
const duplicateNodeFunction = inject<(nodeData: any) => void>('duplicateNode');
const menuNodeFunction = inject<(event: MouseEvent, node: any) => void>('menuNode');

// Emits para comunicar con el parent
const emit = defineEmits<{
	'node-copy': [node: any]
	'node-duplicate': [node: any]
	'node-delete': [nodeId: string]
	'node-menu': [event: MouseEvent, node: any]
}>();

const nodeLabel = data.label ?? node?.node?.label ?? 'Nodo';
const isSelected = computed(() => node?.node?.selected ?? false);

// Validation composable with connection validation
const { hasError } = useNodeValidation({
	validateTitle: true,
	validateConnections: true
});

// Handlers para mostrar/ocultar toolbar
function onMouseEnter() {
	showToolbar.value = true;
}

function onMouseLeave() {
	// Solo ocultar si el nodo no está seleccionado
	if (!isSelected.value) {
		showToolbar.value = false;
	}
}

// Funciones para manejar la toolbar
function handleCopy() {
	if (node?.node) {
		const nodeData = {
			id: node.node.id,
			type: node.node.type,
			label: nodeLabel,
			data: node.node.data,
			position: node.node.position
		};
		console.log('MinimalNode: Usando función inyectada para copiar');
		if (copyNodeFunction) {
			copyNodeFunction(nodeData);
		} else {
			console.log('MinimalNode: Fallback - emitiendo evento copy');
			emit('node-copy', nodeData);
		}
	}
}

function handleDuplicate() {
	if (node?.node) {
		const nodeData = {
			id: node.node.id,
			type: node.node.type,
			label: nodeLabel,
			data: node.node.data,
			position: node.node.position
		};
		console.log('MinimalNode: Usando función inyectada para duplicar');
		if (duplicateNodeFunction) {
			duplicateNodeFunction(nodeData);
		} else {
			console.log('MinimalNode: Fallback - emitiendo evento duplicate');
			emit('node-duplicate', nodeData);
		}
	}
}

function handleDelete() {
	console.log('MinimalNode: handleDelete llamado', node?.node?.id);
	if (node?.node?.id) {
		console.log('MinimalNode: Usando función inyectada para eliminar');
		if (deleteNodeFunction) {
			deleteNodeFunction(node.node.id);
		} else {
			console.log('MinimalNode: Fallback - emitiendo evento delete');
			emit('node-delete', node.node.id);
		}
	} else {
		console.log('MinimalNode: No se pudo obtener el ID del nodo');
	}
}

function handleMenu(event: MouseEvent) {
	console.log('MinimalNode: Usando función inyectada para menú');
	if (menuNodeFunction) {
		menuNodeFunction(event, node?.node);
	} else {
		console.log('MinimalNode: Fallback - emitiendo evento menu');
		emit('node-menu', event, node?.node);
	}
}

// Observar selección para mostrar/ocultar toolbar
watch(isSelected, (selected) => {
	if (selected) {
		showToolbar.value = true;
	} else if (!showToolbar.value) {
		showToolbar.value = false;
	}
});
</script>

<style scoped>
.minimal-node {
	position: relative;
	background: #23272e;
	color: #fff;
	border-radius: 14px;
	padding: 16px 32px 16px 20px;
	min-width: 200px;
	min-height: 64px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.1rem;
	border: 2.5px solid #23272e;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.22) inset;
	transition:
		border-color 0.15s,
		box-shadow 0.15s,
		outline 0.15s,
		background-color 0.15s,
		transform 0.15s;
}
.minimal-node.selected {
	border: 4px solid #fff !important;
	outline: 5px solid #1faaff !important;
	outline-offset: 2px !important;
	box-shadow:
		0 0 0 6px #1faaff99,
		0 0 0 12px #fff,
		0 0 30px 10px #1faaffaa,
		0 2px 16px 0 #1faaff88,
		0 4px 32px 0 #1faaff44;
	background: linear-gradient(135deg, #2a2f36 50%, #1faaff44 100%) !important;
	animation: minimal-node-glow 2s infinite alternate;
	transform: scale(1.1);
	z-index: 20;
}
.minimal-node.selected.error {
	border: 4px solid #fff !important;
	outline: 5px solid #ff4d4f !important;
	outline-offset: 2px !important;
	box-shadow:
		0 0 0 6px #ff4d4f99,
		0 0 0 12px #fff,
		0 0 30px 10px #ff4d4faa,
		0 2px 16px 0 #ff4d4f88,
		0 4px 32px 0 #ff4d4f44;
	background: linear-gradient(135deg, #2a2f36 50%, #ff4d4f44 100%) !important;
	animation: minimal-node-pulse-error 1.2s infinite alternate;
}
@keyframes minimal-node-glow {
	0% {
		box-shadow:
			0 0 0 6px #1faaff99,
			0 0 0 12px #fff,
			0 0 30px 10px #1faaffaa,
			0 2px 16px 0 #1faaff88,
			0 4px 32px 0 #1faaff44;
	}
	100% {
		box-shadow:
			0 0 0 6px #1faaff99,
			0 0 0 12px #fff,
			0 0 40px 15px #1faaffbb,
			0 2px 20px 0 #1faaffaa,
			0 4px 40px 0 #1faaff66;
	}
}
@keyframes minimal-node-pulse {
	0% {
		box-shadow:
			0 0 0 1.11px #fff,
			0 0 6.75px 1.11px #97fdff34,
			0 0 10.1px 3.5px #97fdff0f;
	}
	100% {
		box-shadow:
			0 0 0 1.11px #fff,
			0 0 15.77px 3.5px #97fdff8a,
			0 0 26.9px 7px #97fdff40;
	}
}
@keyframes minimal-node-pulse-error {
	0% {
		box-shadow:
			0 0 0 1.11px #fff,
			0 0 6.75px 1.11px #ff4d4f34,
			0 0 10.1px 3.5px #ff4d4f0f;
	}
	100% {
		box-shadow:
			0 0 0 1.11px #fff,
			0 0 15.77px 3.5px #ff4d4f8a,
			0 0 26.9px 7px #ff4d4f40;
	}
}

/* Estilos para la toolbar inline */
.node-toolbar-inline {
	position: absolute;
	top: -45px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	gap: 6px;
	background: rgba(0, 0, 0, 0.9);
	border: 2px solid rgba(255, 255, 255, 0.2);
	border-radius: 8px;
	padding: 6px;
	z-index: 1000;
	backdrop-filter: blur(10px);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
	animation: toolbar-appear 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	pointer-events: auto;
}

@keyframes toolbar-appear {
	from {
		opacity: 0;
		transform: translateX(-50%) translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
}

.toolbar-btn {
	width: 32px;
	height: 32px;
	border: none;
	border-radius: 6px;
	background: transparent;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	position: relative;
	overflow: hidden;
}

.toolbar-btn:hover {
	background: rgba(255, 255, 255, 0.1);
	transform: scale(1.1);
}

.toolbar-btn:active {
	transform: scale(0.95);
}

.copy-btn:hover {
	background: rgba(74, 158, 255, 0.2);
}

.duplicate-btn:hover {
	background: rgba(255, 184, 77, 0.2);
}

.delete-btn:hover {
	background: rgba(225, 77, 67, 0.2);
}

.menu-btn:hover {
	background: rgba(255, 255, 255, 0.15);
}

.toolbar-btn img {
	filter: brightness(1);
	transition: filter 0.2s ease;
}

.toolbar-btn:hover img {
	filter: brightness(1.2);
}
</style>
