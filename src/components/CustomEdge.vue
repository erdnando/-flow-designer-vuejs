<template>
	<BaseEdge 
		:id="id"
		:style="edgeStyle"
		:path="path"
		:marker-end="markerEnd"
		:marker-start="markerStart"
		:interaction-width="interactionWidth"
	/>
	
	<!-- Botón de eliminar que aparece solo cuando la conexión está seleccionada -->
	<foreignObject
		v-if="selected"
		:x="deleteButtonPosition.x"
		:y="deleteButtonPosition.y"
		:width="32"
		:height="32"
		class="vue-flow__edge-delete-button"
		style="overflow: visible;"
	>
		<div 
			class="edge-delete-button"
			@click.stop="onDeleteClick"
			@mousedown.stop
			title="Eliminar conexión"
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
		</div>
	</foreignObject>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BaseEdge, getBezierPath, getSmoothStepPath, getStraightPath, Position } from '@vue-flow/core';

interface CustomEdgeProps {
	id: string;
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
	sourcePosition: Position;
	targetPosition: Position;
	selected?: boolean;
	markerEnd?: string;
	markerStart?: string;
	style?: any;
	data?: any;
	type?: string;
	interactionWidth?: number;
}

const props = withDefaults(defineProps<CustomEdgeProps>(), {
	selected: false,
	interactionWidth: 20,
	type: 'default'
});

const emit = defineEmits<{
	delete: [edgeId: string];
}>();

// Calcular el estilo del edge con color de selección
const edgeStyle = computed(() => {
	const baseStyle = props.style || {};
	
	if (props.selected) {
		// Cuando está seleccionado, usar un color muy vibrante y visible
		return {
			...baseStyle,
			stroke: '#00ff88', // Verde neón muy vibrante
			strokeWidth: 5, // Línea muy gruesa
			filter: 'drop-shadow(0 0 15px rgba(0, 255, 136, 1)) drop-shadow(0 0 25px rgba(0, 255, 136, 0.7))', // Doble sombra muy brillante
			strokeDasharray: '10,5', // Línea punteada para mayor visibilidad
			opacity: 1 // Asegurar opacidad máxima
		};
	}
	
	// Estilo base sin modificaciones
	return baseStyle;
});

// Calcular el path del edge según el tipo
const path = computed(() => {
	const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;
	const pathType = data?.pathType || 'bezier'; // Usar pathType del data, bezier por defecto
	
	if (pathType === 'step') {
		const [pathString] = getSmoothStepPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition,
		});
		return pathString;
	} else if (pathType === 'straight') {
		const [pathString] = getStraightPath({
			sourceX,
			sourceY,
			targetX,
			targetY,
		});
		return pathString;
	} else {
		// Bezier por defecto
		const [pathString] = getBezierPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition,
		});
		return pathString;
	}
});

// Calcular la posición del botón de eliminar en el centro real de la curva
const deleteButtonPosition = computed(() => {
	const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;
	const pathType = data?.pathType || 'bezier'; // Usar pathType del data, bezier por defecto
	
	if (pathType === 'straight') {
		// Para líneas rectas, usar el punto medio simple
		return {
			x: (sourceX + targetX) / 2 - 16,
			y: (sourceY + targetY) / 2 - 16
		};
	} else {
		// Para curvas Bézier y step, calcular punto en la curva real
		// Determinar la distancia de los puntos de control basada en la dirección
		const dx = Math.abs(targetX - sourceX);
		const dy = Math.abs(targetY - sourceY);
		
		// Calcular puntos de control basados en las posiciones de los handles
		let controlX1 = sourceX;
		let controlY1 = sourceY;
		let controlX2 = targetX;
		let controlY2 = targetY;
		
		// Usar la misma lógica que Vue Flow para calcular la distancia de control
		// Para conexiones horizontales, usar dx; para verticales, usar dy
		let controlDistanceX = Math.max(dx * 0.5, 50);
		let controlDistanceY = Math.max(dy * 0.5, 50);
		
		// Ajustar puntos de control según la posición del handle de origen
		if (sourcePosition === Position.Right) {
			controlX1 = sourceX + controlDistanceX;
		} else if (sourcePosition === Position.Left) {
			controlX1 = sourceX - controlDistanceX;
		} else if (sourcePosition === Position.Bottom) {
			controlY1 = sourceY + controlDistanceY;
		} else if (sourcePosition === Position.Top) {
			controlY1 = sourceY - controlDistanceY;
		}
		
		// Ajustar puntos de control según la posición del handle de destino
		if (targetPosition === Position.Left) {
			controlX2 = targetX - controlDistanceX;
		} else if (targetPosition === Position.Right) {
			controlX2 = targetX + controlDistanceX;
		} else if (targetPosition === Position.Top) {
			controlY2 = targetY - controlDistanceY;
		} else if (targetPosition === Position.Bottom) {
			controlY2 = targetY + controlDistanceY;
		}
		
		// Calcular punto en t=0.5 de la curva Bézier cúbica
		const t = 0.5;
		const x = Math.pow(1-t, 3) * sourceX + 
				  3 * Math.pow(1-t, 2) * t * controlX1 + 
				  3 * (1-t) * Math.pow(t, 2) * controlX2 + 
				  Math.pow(t, 3) * targetX;
		const y = Math.pow(1-t, 3) * sourceY + 
				  3 * Math.pow(1-t, 2) * t * controlY1 + 
				  3 * (1-t) * Math.pow(t, 2) * controlY2 + 
				  Math.pow(t, 3) * targetY;
		
		return {
			x: x - 16,
			y: y - 16
		};
	}
});

function onDeleteClick() {
	console.log('🗑️ CustomEdge: onDeleteClick ejecutado para edge:', props.id);
	emit('delete', props.id);
}
</script>

<style scoped>
.edge-delete-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	background: rgba(239, 68, 68, 0.95);
	color: white;
	border-radius: 50%;
	cursor: pointer;
	font-size: 14px;
	font-weight: bold;
	border: 2px solid rgba(255, 255, 255, 0.9);
	box-shadow: 
		0 2px 8px rgba(0, 0, 0, 0.25),
		0 0 0 1px rgba(239, 68, 68, 0.5);
	transition: all 0.2s ease;
	animation: edge-delete-appear 0.3s ease-out;
}

.edge-delete-button:hover {
	background: rgba(220, 38, 38, 1);
	transform: scale(1.1);
	box-shadow: 
		0 6px 16px rgba(0, 0, 0, 0.4),
		0 0 0 3px rgba(239, 68, 68, 0.3),
		0 0 12px rgba(239, 68, 68, 0.6);
}

.edge-delete-button:active {
	transform: scale(0.95);
	transition-duration: 0.05s;
}

@keyframes edge-delete-appear {
	from {
		opacity: 0;
		transform: scale(0.8);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

/* Asegurar que el foreignObject sea clickeable */
.vue-flow__edge-delete-button {
	pointer-events: auto;
}
</style>
