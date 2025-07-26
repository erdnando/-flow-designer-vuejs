<template>
	<div 
		class="condition-node"
		:class="{ 'node-selected': isSelected }"
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

		<!-- Handler de entrada en el vértice izquierdo -->
		<Handle type="target" :position="Position.Left" id="input" class="handle handle-left" />
		<!-- Handler de salida true en el vértice derecho -->
		<Handle type="source" :position="Position.Right" id="outputTrue" class="handle handle-right" />
		<!-- Handler de salida false en el vértice inferior -->
		<Handle
			type="source"
			:position="Position.Bottom"
			id="outputFalse"
			class="handle handle-bottom"
		/>
		<!-- Indicador de selección visible -->
		<div class="diamond">
			<span class="label">{{ data.label || 'Condición\n(If)' }}</span>
		</div>
		<div class="label-true">true</div>
		<div class="label-false">false</div>
	</div>
</template>

<script setup lang="ts">
import { Handle, Position, useNode } from '@vue-flow/core';
import { computed, ref, watch, inject } from 'vue';
import { useNodeValidation } from '../composables/useNodeValidation';
import NodeWarning from './NodeWarning.vue';

const props = defineProps<{ data: { label?: string } }>();
const data = props.data || {};
const nodeInstance = useNode ? useNode() : undefined;

// Validation composable
const { hasError } = useNodeValidation({
	validateConnections: true
});

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

// Verificar si el nodo está seleccionado
const isSelected = computed(() => nodeInstance?.node?.selected || false);

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
	if (nodeInstance?.node) {
		const nodeData = {
			id: nodeInstance.node.id,
			type: nodeInstance.node.type,
			label: data.label || nodeInstance.node.label,
			data: nodeInstance.node.data,
			position: nodeInstance.node.position
		};
		console.log('ConditionNode: Usando función inyectada para copiar');
		if (copyNodeFunction) {
			copyNodeFunction(nodeData);
		} else {
			console.log('ConditionNode: Fallback - emitiendo evento copy');
			emit('node-copy', nodeData);
		}
	}
}

function handleDuplicate() {
	if (nodeInstance?.node) {
		const nodeData = {
			id: nodeInstance.node.id,
			type: nodeInstance.node.type,
			label: data.label || nodeInstance.node.label,
			data: nodeInstance.node.data,
			position: nodeInstance.node.position
		};
		console.log('ConditionNode: Usando función inyectada para duplicar');
		if (duplicateNodeFunction) {
			duplicateNodeFunction(nodeData);
		} else {
			console.log('ConditionNode: Fallback - emitiendo evento duplicate');
			emit('node-duplicate', nodeData);
		}
	}
}

function handleDelete() {
	console.log('ConditionNode: handleDelete llamado', nodeInstance?.node?.id);
	if (nodeInstance?.node?.id) {
		console.log('ConditionNode: Usando función inyectada para eliminar');
		if (deleteNodeFunction) {
			deleteNodeFunction(nodeInstance.node.id);
		} else {
			console.log('ConditionNode: Fallback - emitiendo evento delete');
			emit('node-delete', nodeInstance.node.id);
		}
	} else {
		console.log('ConditionNode: No se pudo obtener el ID del nodo');
	}
}

function handleMenu(event: MouseEvent) {
	console.log('ConditionNode: Usando función inyectada para menú');
	if (menuNodeFunction) {
		menuNodeFunction(event, nodeInstance?.node);
	} else {
		console.log('ConditionNode: Fallback - emitiendo evento menu');
		emit('node-menu', event, nodeInstance?.node);
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
.condition-node {
	position: relative;
	width: 120px;
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
}
/* Borde ULTRA resaltado y efecto especial para el nodo seleccionado */
.condition-node.node-selected .diamond {
	border-color: transparent !important;
	border-width: 0px !important;
	outline: none !important;
	box-shadow:
		0 0 0 2px #1faaff,
		0 0 0 4px #fff,
		0 0 20px 8px #1faaff66,
		0 2px 12px 0 #1faaff44,
		0 4px 24px 0 #1faaff22;
	animation: diamond-glow 2s infinite alternate;
	transform: rotate(45deg) scale(1.03);
	transition:
		box-shadow 0.2s ease,
		transform 0.2s ease;
	z-index: 20;
}
@keyframes diamond-glow {
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
.diamond {
	width: 90px;
	height: 90px;
	background: #111;
	border: 2.5px solid transparent; /* Cambiado de #fff a transparente */
	transform: rotate(45deg);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.22);
	z-index: 2;
	border-radius: 10px; /* Esquinas redondeadas para el diamante */
}
.label {
	color: #fff;
	font-weight: 600;
	font-size: 1.1rem;
	transform: rotate(-45deg);
	user-select: none;
	text-shadow: 0 1px 2px #000;
	white-space: pre-line;
}
.label-true {
	position: absolute;
	right: -60px; /* antes -38px, ahora más a la derecha */
	top: 50%;
	transform: translateY(-50%);
	font-size: 0.95rem;
	font-weight: 600;
	color: #fff;
	background: rgba(30, 30, 30, 0.85);
	padding: 2px 8px;
	border-radius: 6px;
	pointer-events: none;
	z-index: 3;
	text-shadow: 0 1px 2px #000;
}
.label-false {
	position: absolute;
	left: 50%;
	bottom: -40px; /* antes -28px, ahora más abajo */
	transform: translateX(-50%);
	font-size: 0.95rem;
	font-weight: 600;
	color: #fff;
	background: rgba(30, 30, 30, 0.85);
	padding: 2px 8px;
	border-radius: 6px;
	pointer-events: none;
	z-index: 3;
	text-shadow: 0 1px 2px #000;
}
.handle {
	width: 18px !important;
	height: 18px !important;
	border: 2.5px solid #fff !important;
	background: #222 !important;
	z-index: 10 !important;
	border-radius: 50%;
}
.handle-left {
	position: absolute !important;
	left: 0%;
	top: 50%;
	transform: translate(-75%, -50%);
	z-index: 25;
}
.handle-right {
	position: absolute !important;
	right: 0%;
	top: 50%;
	transform: translate(75%, -50%);
	z-index: 25;
}
.handle-bottom {
	position: absolute !important;
	left: 50%;
	bottom: 0%;
	transform: translate(-50%, 75%);
	z-index: 25;
}

/* Asegurar que los handlers estén por encima cuando el nodo está seleccionado */
.condition-node.node-selected .handle {
	z-index: 30 !important;
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

/* Ajuste específico del NodeWarning para el nodo diamante */
.condition-node .node-warning {
	top: -8px;
	right: 15px; /* Mover más hacia la izquierda debido a la forma del diamante */
	z-index: 1000;
}
</style>
