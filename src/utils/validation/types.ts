import type { Node, Edge } from '@vue-flow/core';

/**
 * Resultado de la validación de una regla
 */
export interface ValidationResult {
	isValid: boolean;
	message?: string;
	severity: 'error' | 'warning' | 'info';
	nodeId?: string;
	ruleId: string;
	affectedNodes?: string[];
	affectedEdges?: string[];
}

/**
 * Definición de una regla de validación
 */
export interface ValidationRule {
	id: string;
	name: string;
	description: string;
	severity: 'error' | 'warning' | 'info';
	category: 'node' | 'connection' | 'flow';
	validate: (nodes: Node[], edges?: Edge[], targetNode?: Node) => ValidationResult;
}

/**
 * Resultado de detección de ciclos en el grafo
 */
export interface CycleDetectionResult {
	hasCycle: boolean;
	cycleNodes: string[];
	cycleEdges: string[];
}

/**
 * Límites de conexiones por tipo de nodo
 */
export interface NodeConnectionLimits {
	maxIncoming: number;
	maxOutgoing: number;
}

/**
 * Información de conexiones de un nodo
 */
export interface NodeConnectionInfo {
	incoming: number;
	outgoing: number;
}
