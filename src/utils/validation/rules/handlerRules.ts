import type { Node, Edge } from '@vue-flow/core';
import type { ValidationRule, ValidationResult } from '../types';
import { 
	getNodeConnectionLimits, 
	canReceiveInput, 
	canSendOutput, 
	getHandleType, 
	countNodeConnections 
} from '../helpers';

/**
 * Verifica si una conexión handler-específica es válida
 * @param sourceNode - Nodo fuente
 * @param targetNode - Nodo destino
 * @param edge - Arista de conexión
 * @returns true si la conexión es válida
 */
function isValidHandlerConnection(sourceNode: Node, targetNode: Node, edge: Edge): boolean {
	const sourceHandleType = getHandleType(sourceNode, edge.sourceHandle, true);
	const targetHandleType = getHandleType(targetNode, edge.targetHandle, false);
	
	// Una conexión válida debe ser: output → input
	if (!sourceHandleType || !targetHandleType) {
		return false; // Uno de los handles no existe
	}
	
	// Solo permitir conexiones output → input
	return sourceHandleType === 'output' && targetHandleType === 'input';
}

/**
 * Regla: Validar handlers de entrada y salida
 */
export const validHandlerConnectionsRule: ValidationRule = {
	id: 'valid-handler-connections',
	name: 'Conexiones válidas de handlers',
	description: 'Los handlers de salida solo pueden conectarse a handlers de entrada. Los nodos END pueden recibir múltiples conexiones como excepción.',
	severity: 'error',
	category: 'connection',
	validate: (nodes: Node[], edges: Edge[] = []): ValidationResult => {
		// Validar cada conexión individualmente
		for (const edge of edges) {
			const sourceNode = nodes.find(n => n.id === edge.source);
			const targetNode = nodes.find(n => n.id === edge.target);
			
			if (!sourceNode || !targetNode) continue;
			
			const sourceType = sourceNode.type || 'default';
			const targetType = targetNode.type || 'default';
			const sourceLabel = sourceNode.data?.label || sourceType || edge.source;
			const targetLabel = targetNode.data?.label || targetType || edge.target;

			// Validar que el nodo fuente puede enviar conexiones de salida
			if (!canSendOutput(sourceType)) {
				return {
					isValid: false,
					message: `El nodo "${sourceLabel}" (${sourceType.toUpperCase()}) no puede enviar conexiones de salida.`,
					severity: 'error',
					ruleId: 'valid-handler-connections',
					affectedNodes: [edge.source],
					affectedEdges: [edge.id]
				};
			}

			// Validar que el nodo destino puede recibir conexiones de entrada
			if (!canReceiveInput(targetType)) {
				return {
					isValid: false,
					message: `El nodo "${targetLabel}" (${targetType.toUpperCase()}) no puede recibir conexiones de entrada.`,
					severity: 'error',
					ruleId: 'valid-handler-connections',
					affectedNodes: [edge.target],
					affectedEdges: [edge.id]
				};
			}

			// Validar conexión handler-específica
			if (!isValidHandlerConnection(sourceNode, targetNode, edge)) {
				return {
					isValid: false,
					message: `Conexión inválida: el handler de salida de "${sourceLabel}" debe conectarse a un handler de entrada, no a un handler de salida.`,
					severity: 'error',
					ruleId: 'valid-handler-connections',
					affectedNodes: [edge.source, edge.target],
					affectedEdges: [edge.id]
				};
			}

			// No permitir auto-conexiones
			if (edge.source === edge.target) {
				return {
					isValid: false,
					message: `El nodo "${sourceLabel}" no puede conectarse a sí mismo.`,
					severity: 'error',
					ruleId: 'valid-handler-connections',
					affectedNodes: [edge.source],
					affectedEdges: [edge.id]
				};
			}
		}
		
		// Contar conexiones para cada nodo y validar límites
		const nodeConnections = countNodeConnections(nodes, edges);
		
		// Validar límites para cada nodo
		for (const node of nodes) {
			const limits = getNodeConnectionLimits(node.type || 'default');
			const connections = nodeConnections.get(node.id);
			
			if (!connections) continue;
			
			const nodeLabel = node.data?.label || node.type || node.id;
			
			// Verificar conexiones entrantes
			if (connections.incoming > limits.maxIncoming) {
				const relatedEdges = edges.filter(edge => edge.target === node.id);
				
				// Mensaje personalizado para diferentes tipos de nodos
				let message: string;
				if (node.type === 'end') {
					// Este caso nunca debería ocurrir ya que END permite infinitas conexiones,
					// pero mantenemos el código por robustez
					message = `El nodo "${nodeLabel}" (END) no debería tener restricciones de entrada.`;
				} else {
					message = `El nodo "${nodeLabel}" tiene ${connections.incoming} conexiones de entrada, pero el máximo permitido es ${limits.maxIncoming}.`;
				}
				
				return {
					isValid: false,
					message,
					severity: 'error',
					ruleId: 'valid-handler-connections',
					affectedNodes: [node.id],
					affectedEdges: relatedEdges.map(e => e.id)
				};
			}
			
			// Verificar conexiones salientes
			if (connections.outgoing > limits.maxOutgoing) {
				const relatedEdges = edges.filter(edge => edge.source === node.id);
				return {
					isValid: false,
					message: `El nodo "${nodeLabel}" tiene ${connections.outgoing} conexiones de salida, pero el máximo permitido es ${limits.maxOutgoing}.`,
					severity: 'error',
					ruleId: 'valid-handler-connections',
					affectedNodes: [node.id],
					affectedEdges: relatedEdges.map(e => e.id)
				};
			}
		}
		
		return {
			isValid: true,
			severity: 'error',
			ruleId: 'valid-handler-connections'
		};
	}
};

/**
 * Lista de todas las reglas de handlers
 */
export const handlerRules: ValidationRule[] = [
	validHandlerConnectionsRule
];
