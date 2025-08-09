import type { Node } from '@vue-flow/core';
import type { ValidationRule, ValidationResult } from '../types';

/**
 * Regla: Solo debe haber un nodo tipo START en el flujo
 */
export const singleStartNodeRule: ValidationRule = {
	id: 'single-start-node',
	name: 'Nodo START único',
	description: 'Solo debe existir un nodo de tipo START en el flujo',
	severity: 'error',
	category: 'node',
	validate: (nodes: Node[]): ValidationResult => {
		const startNodes = nodes.filter(node => node.type === 'start');
		
		if (startNodes.length > 1) {
			return {
				isValid: false,
				message: `Solo puede haber un nodo START en el flujo. Actualmente hay ${startNodes.length} nodos START.`,
				severity: 'error',
				ruleId: 'single-start-node',
				affectedNodes: startNodes.map(n => n.id)
			};
		}
		
		return {
			isValid: true,
			severity: 'error',
			ruleId: 'single-start-node'
		};
	}
};

/**
 * Regla: Solo debe haber un nodo tipo END en el flujo
 */
export const singleEndNodeRule: ValidationRule = {
	id: 'single-end-node',
	name: 'Nodo END único',
	description: 'Solo debe existir un nodo de tipo END en el flujo',
	severity: 'error',
	category: 'node',
	validate: (nodes: Node[]): ValidationResult => {
		const endNodes = nodes.filter(node => node.type === 'end');
		
		if (endNodes.length > 1) {
			return {
				isValid: false,
				message: `Solo puede haber un nodo END en el flujo. Actualmente hay ${endNodes.length} nodos END.`,
				severity: 'error',
				ruleId: 'single-end-node',
				affectedNodes: endNodes.map(n => n.id)
			};
		}
		
		return {
			isValid: true,
			severity: 'error',
			ruleId: 'single-end-node'
		};
	}
};

/**
 * Lista de todas las reglas de nodos
 */
export const nodeRules: ValidationRule[] = [
	singleStartNodeRule,
	singleEndNodeRule
];
