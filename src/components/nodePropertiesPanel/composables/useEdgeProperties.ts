import { computed } from 'vue';
import type { EdgeProperties } from '../types';

export function useEdgeProperties(props: any) {
	// Propiedades computadas de la conexión seleccionada
	const edgeProperties = computed((): EdgeProperties | null => {
		if (!props.edge) {
			return null;
		}

		return {
			id: props.edge.id || '',
			type: props.edge.type || 'default',
			source: props.edge.source || '',
			target: props.edge.target || '',
			sourceHandle: props.edge.sourceHandle || 'output',
			targetHandle: props.edge.targetHandle || 'input',
			animated: props.edge.animated || false,
			selectable: props.edge.selectable !== false,
			sourceX: props.edge.sourceX || 0,
			sourceY: props.edge.sourceY || 0,
			targetX: props.edge.targetX || 0,
			targetY: props.edge.targetY || 0,
		};
	});

	// Helper para obtener el label de un nodo por su ID
	function getNodeLabel(nodeId: string): string {
		if (!props.nodes) return `Nodo ${nodeId}`;
		
		const node = props.nodes.find((n: any) => n.id === nodeId);
		return node?.label || `Nodo ${nodeId}`;
	}

	// Información formateada de nodos origen y destino
	const sourceNodeInfo = computed(() => {
		if (!edgeProperties.value) return '';
		return `${edgeProperties.value.source} (${getNodeLabel(edgeProperties.value.source)})`;
	});

	const targetNodeInfo = computed(() => {
		if (!edgeProperties.value) return '';
		return `${edgeProperties.value.target} (${getNodeLabel(edgeProperties.value.target)})`;
	});

	// Posiciones formateadas
	const sourcePosition = computed(() => {
		if (!edgeProperties.value) return '';
		return `(${Math.round(edgeProperties.value.sourceX || 0)}, ${Math.round(edgeProperties.value.sourceY || 0)})`;
	});

	const targetPosition = computed(() => {
		if (!edgeProperties.value) return '';
		return `(${Math.round(edgeProperties.value.targetX || 0)}, ${Math.round(edgeProperties.value.targetY || 0)})`;
	});

	return {
		edgeProperties,
		getNodeLabel,
		sourceNodeInfo,
		targetNodeInfo,
		sourcePosition,
		targetPosition
	};
}
