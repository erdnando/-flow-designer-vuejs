import { computed } from 'vue';
import { useVueFlow, useNode, type Edge } from '@vue-flow/core';

/**
 * Composable para validar nodos y mostrar warnings
 * @param options - Opciones de validación
 * @returns objeto con hasError computed y otras utilidades
 */
export function useNodeValidation(options: {
	validateTitle?: boolean;
	validateConnections?: boolean;
} = {}) {
	const { validateTitle = false, validateConnections = true } = options;
	const { getEdges } = useVueFlow();
	const { node } = useNode();

	// Computed para verificar si hay errores de validación
	const hasError = computed(() => {
		if (!node) return false;

		const nodeId = node.id;
		const nodeData = node.data;
		const allEdges = getEdges.value || [];

		// Validar que el nodo tenga un título/label válido (si está habilitado)
		if (validateTitle) {
			const nodeTitle = nodeData?.label || node.label;
			if (!nodeTitle || typeof nodeTitle !== 'string' || nodeTitle.trim() === '') {
				return true;
			}
		}

		// Validar conexiones (si está habilitado)
		if (validateConnections) {
			// Obtener todas las conexiones del nodo actual
			const nodeConnections = allEdges.filter((edge: Edge) => 
				edge.source === nodeId || edge.target === nodeId
			);

			// Si no tiene conexiones, mostrar warning
			if (nodeConnections.length === 0) {
				return true;
			}

			// Verificar si el nodo tiene handles desconectados
			const nodeType = node.type;
			
			// Para nodos START: debe tener al menos una conexión de salida
			if (nodeType === 'start') {
				const outgoingConnections = allEdges.filter((edge: Edge) => edge.source === nodeId);
				if (outgoingConnections.length === 0) {
					return true;
				}
			}
			
			// Para nodos END: debe tener al menos una conexión de entrada
			if (nodeType === 'end') {
				const incomingConnections = allEdges.filter((edge: Edge) => edge.target === nodeId);
				if (incomingConnections.length === 0) {
					return true;
				}
			}
			
			// Para nodos CONDITION (IF): debe tener entrada Y al menos una salida
			if (nodeType === 'condition') {
				const incomingConnections = allEdges.filter((edge: Edge) => edge.target === nodeId);
				const outgoingConnections = allEdges.filter((edge: Edge) => edge.source === nodeId);
				
				if (incomingConnections.length === 0 || outgoingConnections.length === 0) {
					return true;
				}
			}
			
			// Para nodos CUSTOM, ENGINE y MINIMAL: deben tener al menos una conexión (entrada o salida)
			if (nodeType === 'custom' || nodeType === 'engineNode' || nodeType === 'minimal') {
				if (nodeConnections.length === 0) {
					return true;
				}
			}
		}

		return false;
	});

	return {
		hasError,
		nodeId: computed(() => node?.id),
		nodeType: computed(() => node?.type)
	};
}
