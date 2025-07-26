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

		<Handle type="target" :position="Position.Left" id="input" />
		<div class="node-content">
			<div class="node-icon">
				<!-- Icono dinámico según el tipo -->
				<span v-html="nodeIcon"></span>
			</div>
			<div class="node-labels">
				<div class="node-title">{{ nodeLabel }}</div>
				<div class="node-type-badge">{{ nodeType }}</div>
				<div class="node-subtitle">{{ nodeSubtitle }}</div>
			</div>
		</div>
		<Handle type="source" :position="Position.Right" id="output" />
	</div>
</template>

<script setup lang="ts">
import { Handle, Position, useNode } from '@vue-flow/core';
import { nodeTypeMeta } from '../utils/nodeTypeMeta';
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { useNodeValidation } from '../composables/useNodeValidation';
import NodeWarning from './NodeWarning.vue';

const props = defineProps<{ data: { label?: string; type?: string; subtitle?: string } }>();
const nodeInstance = useNode ? useNode() : undefined;

// Estado para la toolbar
const showToolbar = ref(false);
const isHovered = ref(false);
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

// Funciones simplificadas para manejar eventos de mouse
function onMouseEnter() {
	// Limpiar cualquier timeout pendiente
	if (hoverTimeout) {
		clearTimeout(hoverTimeout);
		hoverTimeout = null;
	}
	
	isHovered.value = true;
	showToolbar.value = true;
}

function onMouseLeave() {
	// Usar un timeout generoso para evitar parpadeos
	if (hoverTimeout) {
		clearTimeout(hoverTimeout);
	}
	
	hoverTimeout = setTimeout(() => {
		isHovered.value = false;
		
		// Solo ocultar si no está seleccionado
		if (!isNodeSelected.value) {
			showToolbar.value = false;
		}
		hoverTimeout = null;
	}, 200); // Timeout de 200ms para dar margen
}

// Emits para comunicar con el parent
const emit = defineEmits<{
	'node-copy': [node: any]
	'node-duplicate': [node: any]
	'node-delete': [nodeId: string]
	'node-menu': [event: MouseEvent, node: any]
}>();

// Separar las fuentes de datos para evitar ciclos reactivos
const rawData = computed(() => {
	// Combinar todas las fuentes de datos, priorizando en este orden:
	// 1. Propiedades directas del nodo (si existe nodeInstance)
	// 2. Propiedades en el objeto data del nodo (desde props.data)
	const nodeData = nodeInstance?.node?.data || {};

	return {
		// Propiedades directas del nodo (si existe)
		nodeLabel: nodeInstance?.node?.label,
		nodeType: nodeInstance?.node?.type,
		// Propiedades de data (de props)
		dataLabel: props.data?.label,
		dataType: props.data?.type,
		dataSubtitle: props.data?.subtitle,
		// Propiedades de data (del nodo, si existe)
		nodeDataLabel: nodeData.label,
		nodeDataType: nodeData.type,
		nodeDataSubtitle: nodeData.subtitle,
	};
});

// Computed properties que resuelven en cascada según prioridad
const nodeLabel = computed(
	() => rawData.value.nodeLabel || rawData.value.dataLabel || rawData.value.nodeDataLabel || 'Nodo',
);

// Para el tipo, implementamos una solución robusta que siempre refleja el tipo actual
const nodeType = computed(() => {
	// LOGGING: Información completa para diagnóstico
	console.log('Recalculando tipo de nodo. Node:', nodeInstance?.node);

	// Prioridad 1: Tipo directo del nodo (la fuente más confiable)
	const directNodeType = nodeInstance?.node?.type;
	console.log('Tipo directo del nodo:', directNodeType);

	// Prioridad 2: Tipo almacenado en data del nodo (para nodos personalizados)
	const dataTypeFromNode = nodeInstance?.node?.data?.type;
	console.log('Tipo desde node.data:', dataTypeFromNode);

	// Prioridad 3: Tipo de las props directas (para compatibilidad)
	const dataTypeFromProps = props.data?.type;
	console.log('Tipo desde props.data:', dataTypeFromProps);

	// Elegimos el primer tipo válido siguiendo la prioridad establecida
	// Esta lógica es crucial para reflejar correctamente los cambios de tipo
	const finalType = directNodeType || dataTypeFromNode || dataTypeFromProps || 'default';
	console.log('Tipo final determinado:', finalType);

	return finalType;
});

// El icono se actualiza automáticamente cuando cambia nodeType
const nodeIcon = computed(() => {
	// FORZAR ACTUALIZACIÓN: Siempre recalcular el icono basado en el tipo actual
	// Intentar obtener el tipo más actualizado posible
	const currentType = nodeType.value;
	console.log('Actualizando ícono para tipo:', currentType);

	// Si el tipo existe en nodeTypeMeta, usar su icono
	if (nodeTypeMeta[currentType]) {
		return nodeTypeMeta[currentType].icon;
	}

	// Si no, usar el icono por defecto
	return nodeTypeMeta.default.icon;
});

const nodeSubtitle = computed(() => {
	// Para asegurar que siempre se muestre el subtítulo actualizado, damos prioridad a los datos más frescos
	// Primero verificamos si hay un subtítulo explícito en props.data (desde el panel de propiedades)
	if (props.data?.subtitle !== undefined && props.data.subtitle !== null) {
		console.log('Usando subtitle desde props.data:', props.data.subtitle);
		return props.data.subtitle;
	}

	// Si no, intentamos obtenerlo del nodo
	if (
		nodeInstance?.node?.data?.subtitle !== undefined &&
		nodeInstance.node.data.subtitle !== null
	) {
		console.log('Usando subtitle desde node.data:', nodeInstance.node.data.subtitle);
		return nodeInstance.node.data.subtitle;
	}

	// Si no hay un subtítulo explícito, usamos el predeterminado del tipo de nodo
	const defaultSubtitle = nodeTypeMeta[nodeType.value]?.subtitle || nodeTypeMeta.default.subtitle;
	console.log('Usando subtitle por defecto:', defaultSubtitle);
	return defaultSubtitle;
});

// Usar el sistema de validación unificado
const { hasError } = useNodeValidation({ validateConnections: true });

// Propiedad computada para detectar si el nodo está seleccionado
const isNodeSelected = computed(() => nodeInstance?.node?.selected || false);

// Watcher para forzar actualización cuando cambia el estado de selección
watch(
	() => nodeInstance?.node?.selected,
	(newValue) => {
		console.log('Cambio en selección de nodo:', newValue);
		// Esto nos permitirá ver en consola cuando cambia el estado de selección
	},
);

// Funciones para manejar la toolbar
function handleCopy() {
	const nodeData = {
		type: nodeType.value,
		label: nodeLabel.value,
		data: props.data
	};
	emit('node-copy', nodeData);
}

function handleDuplicate() {
	const nodeData = {
		type: nodeType.value,
		label: nodeLabel.value,
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

// Observar selección para mostrar/ocultar toolbar
watch(isNodeSelected, (selected) => {
	if (selected) {
		showToolbar.value = true;
	} else if (!isHovered.value) {
		showToolbar.value = false;
	}
});

// Cleanup al desmontar el componente
onBeforeUnmount(() => {
	if (hoverTimeout) {
		clearTimeout(hoverTimeout);
		hoverTimeout = null;
	}
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
		box-shadow 0.2s,
		border 0.2s;
	background-clip: padding-box;
	background-image: none !important;
	width: auto;
	height: auto;
}
.node-content {
	display: flex;
	align-items: center;
	gap: 16px;
	width: 100%;
}
.node-icon {
	width: 38px;
	height: 38px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #23272e;
	border-radius: 10px;
	margin-right: 10px;
	position: relative;
}
.node-warning {
	position: absolute;
	right: -10px;
	bottom: -10px;
	background: transparent;
	border-radius: 50%;
	box-shadow: 0 1px 4px rgba(225, 77, 67, 0.18);
}
.node-labels {
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.node-title {
	font-weight: 700;
	font-size: 1.18rem;
	color: #fff;
	letter-spacing: 0.01em;
	line-height: 1.2;
	margin-bottom: 2px;
}
.node-subtitle {
	font-size: 0.92rem;
	color: #b0b0b0;
	font-weight: 500;
	letter-spacing: 0.01em;
	line-height: 1.1;
}
.node-type-badge {
	display: inline-block;
	background: #363a40;
	color: #ffb84d;
	font-size: 0.85rem;
	font-weight: 600;
	border-radius: 6px;
	padding: 2px 8px;
	margin: 2px 0 4px 0;
	letter-spacing: 0.02em;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	max-width: fit-content;
	transition: all 0.3s ease;
	animation: type-badge-flash 1.5s 1;
}

/* Handlers grandes y visibles como en el nodo IF */
:deep(.vue-flow__handle) {
	width: 18px !important;
	height: 18px !important;
	border: 2.5px solid #fff !important;
	background: #222 !important;
	z-index: 10 !important;
	border-radius: 50%;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
	transform-origin: center center !important;
}

/* Posicionamiento correcto para handlers de CustomNode */
:deep(.vue-flow__handle[data-handlepos="left"]) {
	left: -20px !important; /* Mitad del ancho del handler (18px/2) */
}

:deep(.vue-flow__handle[data-handlepos="right"]) {
	right: -30px !important; /* Mitad del ancho del handler (18px/2) */
}

/* Efecto hover específico para CustomNode que crece en lugar */
:deep(.vue-flow__handle:hover) {
	width: 22px !important;
	height: 22px !important;
	border: 3px solid #fff !important;
	background: #1faaff !important;
	box-shadow: 
		0 0 0 2px rgba(31, 170, 255, 0.3),
		0 0 12px rgba(31, 170, 255, 0.6) !important;
}

/* Ajustar posición en hover para mantener centrado */
:deep(.vue-flow__handle[data-handlepos="left"]:hover) {
	left: -20px !important; /* Mitad del ancho hover (22px/2) */
}

:deep(.vue-flow__handle[data-handlepos="right"]:hover) {
	right: -30px !important; /* Mitad del ancho hover (22px/2) */
}

/* Estilo para nodo seleccionado usando clase directa - HOMOLOGADO CON STARNODE */
.custom-node.node-selected {
	border-color: transparent !important;
	border-width: 0px !important;
	outline: none !important;
	box-shadow:
		0 0 0 2px #1faaff,
		0 0 0 4px #fff,
		0 0 20px 8px #1faaff66,
		0 2px 12px 0 #1faaff44,
		0 4px 24px 0 #1faaff22;
	animation: custom-node-glow 2s infinite alternate;
	transform: scale(1.03);
	transition:
		box-shadow 0.2s ease,
		transform 0.2s ease;
	z-index: 20;
}

@keyframes custom-node-glow {
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

.node-warning {
	position: absolute;
	top: -6px;
	right: -6px;
	z-index: 100;
	filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
	animation: pulse 1.5s infinite;
	pointer-events: none;
}

@keyframes pulse {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
	100% {
		transform: scale(1);
	}
}

@keyframes flash {
	0% {
		background-color: #363a40;
	}
	25% {
		background-color: #e14d43;
		color: white;
	}
	75% {
		background-color: #e14d43;
		color: white;
	}
	100% {
		background-color: #363a40;
	}
}

@keyframes type-badge-flash {
	0% {
		background-color: #363a40;
		transform: scale(1);
	}
	20% {
		background-color: #e9a946;
		color: #23272e;
		transform: scale(1.1);
	}
	40% {
		background-color: #ffb84d;
		color: #23272e;
		transform: scale(1.1);
	}
	80% {
		background-color: #e9a946;
		color: #23272e;
		transform: scale(1.05);
	}
	100% {
		background-color: #363a40;
		transform: scale(1);
	}
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
	width: 34px;
	height: 34px;
	border: none;
	border-radius: 8px;
	background: transparent;
	color: rgba(255, 255, 255, 0.8);
	cursor: pointer;
	transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	font-size: 14px;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.toolbar-btn:hover {
	background: rgba(255, 255, 255, 1);
	transform: scale(1.05);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.toolbar-btn:active {
	transform: scale(0.95);
	transition-duration: 0.05s;
}

.copy-btn:hover {
	background: rgba(34, 197, 94, 0.9);
	box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.4);
}

.copy-btn:hover img {
	filter: brightness(0.2); /* Oscurecer la imagen para que sea visible en el fondo claro */
}

/* Ya no necesitamos estos estilos para SVG */

.duplicate-btn:hover {
	background: rgba(168, 85, 247, 0.9);
	box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.4);
}

.duplicate-btn:hover img {
	filter: brightness(0.2); /* Oscurecer la imagen para que sea visible en el fondo claro */
}

/* Ya no necesitamos estos estilos para SVG */

.delete-btn:hover {
	background: rgba(239, 68, 68, 0.9);
	box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4);
}

.delete-btn:hover img {
	filter: brightness(0.2); /* Oscurecer la imagen para que sea visible en el fondo claro */
}

/* Ya no necesitamos estos estilos para SVG */

.menu-btn:hover {
	background: rgba(59, 130, 246, 0.9);
	box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

.menu-btn:hover img {
	filter: brightness(0.2); /* Oscurecer la imagen para que sea visible en el fondo claro */
}

/* Ya no necesitamos estos estilos para SVG */

.toolbar-btn img {
	pointer-events: none;
	transition: transform 0.15s ease;
}

.toolbar-btn:hover img {
	transform: scale(1.1);
}
</style>
