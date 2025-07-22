import type { Node } from '@vue-flow/core';

// Tipos para el sistema de validación
export interface ValidationResult {
	isValid: boolean;
	message?: string;
	severity: 'error' | 'warning' | 'info';
	nodeId?: string;
	ruleId: string;
}

export interface ValidationRule {
	id: string;
	name: string;
	description: string;
	severity: 'error' | 'warning' | 'info';
	validate: (nodes: Node[], targetNode?: Node) => ValidationResult;
}

// Regla 1: Solo debe haber un nodo tipo START
const singleStartNodeRule: ValidationRule = {
	id: 'single-start-node',
	name: 'Nodo START único',
	description: 'Solo debe existir un nodo de tipo START en el flujo',
	severity: 'error',
	validate: (nodes: Node[]): ValidationResult => {
		const startNodes = nodes.filter(node => node.type === 'start');
		
		if (startNodes.length > 1) {
			return {
				isValid: false,
				message: `Solo puede haber un nodo START en el flujo. Actualmente hay ${startNodes.length} nodos START.`,
				severity: 'error',
				ruleId: 'single-start-node'
			};
		}
		
		return {
			isValid: true,
			severity: 'error',
			ruleId: 'single-start-node'
		};
	}
};

// Regla 2: Solo debe haber un nodo tipo END
const singleEndNodeRule: ValidationRule = {
	id: 'single-end-node',
	name: 'Nodo END único',
	description: 'Solo debe existir un nodo de tipo END en el flujo',
	severity: 'error',
	validate: (nodes: Node[]): ValidationResult => {
		const endNodes = nodes.filter(node => node.type === 'end');
		
		if (endNodes.length > 1) {
			return {
				isValid: false,
				message: `Solo puede haber un nodo END en el flujo. Actualmente hay ${endNodes.length} nodos END.`,
				severity: 'error',
				ruleId: 'single-end-node'
			};
		}
		
		return {
			isValid: true,
			severity: 'error',
			ruleId: 'single-end-node'
		};
	}
};

// Registro de todas las reglas disponibles
export const availableRules: ValidationRule[] = [
	singleStartNodeRule,
	singleEndNodeRule
];

// Función principal para validar todas las reglas
export function validateAllRules(nodes: Node[], targetNode?: Node): ValidationResult[] {
	return availableRules.map(rule => rule.validate(nodes, targetNode));
}

// Función para validar una regla específica
export function validateRule(ruleId: string, nodes: Node[], targetNode?: Node): ValidationResult | null {
	const rule = availableRules.find(r => r.id === ruleId);
	if (!rule) return null;
	
	return rule.validate(nodes, targetNode);
}

// Función para obtener solo los errores
export function getValidationErrors(nodes: Node[], targetNode?: Node): ValidationResult[] {
	return validateAllRules(nodes, targetNode).filter(result => !result.isValid && result.severity === 'error');
}

// Función para obtener solo las advertencias
export function getValidationWarnings(nodes: Node[], targetNode?: Node): ValidationResult[] {
	return validateAllRules(nodes, targetNode).filter(result => !result.isValid && result.severity === 'warning');
}

// Función para verificar si el flujo es válido (sin errores críticos)
export function isFlowValid(nodes: Node[]): boolean {
	const errors = getValidationErrors(nodes);
	return errors.length === 0;
}
