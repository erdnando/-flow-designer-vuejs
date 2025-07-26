<template>
	<BaseEdge 
		:id="id"
		:style="style"
		:path="path"
		:marker-end="markerEnd"
		:marker-start="markerStart"
		:interaction-width="interactionWidth"
	/>
	
	<!-- Botón de eliminar siempre visible -->
	<foreignObject
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

// Calcular el path del edge según el tipo
const path = computed(() => {
	const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, type } = props;
	
	if (type === 'step') {
		const [pathString] = getSmoothStepPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition,
		});
		return pathString;
	} else if (type === 'straight') {
		return getStraightPath({
			sourceX,
			sourceY,
			targetX,
			targetY,
		});
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

// Calcular la posición del botón de eliminar en el centro del edge
const deleteButtonPosition = computed(() => {
	const { sourceX, sourceY, targetX, targetY } = props;
	
	return {
		x: (sourceX + targetX) / 2 - 16, // Centrar el botón de 32px
		y: (sourceY + targetY) / 2 - 16
	};
});

function onDeleteClick() {
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
