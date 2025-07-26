<template>
	<!-- Debug: componente simplificado para testing -->
	<BaseEdge 
		:id="id"
		:style="style"
		:path="path"
		:marker-end="markerEnd"
		:marker-start="markerStart"
		:interaction-width="interactionWidth"
	/>
	
	<!-- Botón de debug siempre visible -->
	<foreignObject
		:x="50"
		:y="50"
		:width="60"
		:height="30"
		style="overflow: visible;"
	>
		<div 
			style="background: red; color: white; padding: 5px; border-radius: 4px; cursor: pointer;"
			@click.stop="onDeleteClick"
			title="DEBUG: Eliminar conexión"
		>
			DEBUG
		</div>
	</foreignObject>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BaseEdge, getBezierPath, Position } from '@vue-flow/core';

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

// Debug: Log para verificar que el componente se está renderizando
console.log('CustomEdgeDebug renderizado con props:', props);

const emit = defineEmits<{
	delete: [edgeId: string];
}>();

// Calcular el path del edge
const path = computed(() => {
	const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props;
	
	return getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	})[0];
});

function onDeleteClick() {
	console.log('Botón de eliminar DEBUG clickeado para edge:', props.id);
	emit('delete', props.id);
}
</script>

<style scoped>
/* Sin estilos adicionales para debug */
</style>
