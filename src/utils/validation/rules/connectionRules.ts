import type { Node, Edge } from '@vue-flow/core';
import type { ValidationRule, ValidationResult } from '../types';
import { detectCycles } from '../helpers';

/**
 * Regla: No permitir conexiones circulares en el flujo
 */
export const noCircularConnectionsRule: ValidationRule = {
	id: 'no-circular-connections',
	name: 'Sin conexiones circulares',
	description: 'No se permiten conexiones que formen ciclos infinitos en el flujo',
	severity: 'error',
	category: 'connection',
	validate: (nodes: Node[], edges: Edge[] = []): ValidationResult => {
		if (edges.length === 0) {
			return {
				isValid: true,
				severity: 'error',
				ruleId: 'no-circular-connections'
			};
		}
		
		const cycleResult = detectCycles(nodes, edges);
		
		if (cycleResult.hasCycle) {
			const cycleNodeNames = cycleResult.cycleNodes
				.map(nodeId => {
					const node = nodes.find(n => n.id === nodeId);
					return node?.data?.label || nodeId;
				})
				.join(' → ');
			
			return {
				isValid: false,
				message: `Se detectó una conexión circular: ${cycleNodeNames}. Las conexiones circulares pueden causar bucles infinitos.`,
				severity: 'error',
				ruleId: 'no-circular-connections',
				affectedNodes: cycleResult.cycleNodes,
				affectedEdges: cycleResult.cycleEdges
			};
		}
		
		return {
			isValid: true,
			severity: 'error',
			ruleId: 'no-circular-connections'
		};
	}
};

/**
 * Lista de todas las reglas de conexiones
 */
export const connectionRules: ValidationRule[] = [
	noCircularConnectionsRule
];
