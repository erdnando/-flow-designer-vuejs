import type { Node, Edge } from '@vue-flow/core';
import type { ValidationRule, ValidationResult } from './types';
import { nodeRules } from './rules/nodeRules';
import { connectionRules } from './rules/connectionRules';
import { handlerRules } from './rules/handlerRules';

/**
 * Registro de todas las reglas disponibles
 */
export const availableRules: ValidationRule[] = [
	...nodeRules,
	...connectionRules, 
	...handlerRules
];

/**
 * Función principal para validar todas las reglas
 * @param nodes - Lista de nodos del flujo
 * @param edges - Lista de aristas del flujo
 * @param targetNode - Nodo específico a validar (opcional)
 * @returns Array con resultados de todas las validaciones
 */
export function validateAllRules(nodes: Node[], edges: Edge[] = [], targetNode?: Node): ValidationResult[] {
	return availableRules.map(rule => rule.validate(nodes, edges, targetNode));
}

/**
 * Función para validar una regla específica
 * @param ruleId - ID de la regla a validar
 * @param nodes - Lista de nodos del flujo
 * @param edges - Lista de aristas del flujo
 * @param targetNode - Nodo específico a validar (opcional)
 * @returns Resultado de la validación o null si la regla no existe
 */
export function validateRule(ruleId: string, nodes: Node[], edges: Edge[] = [], targetNode?: Node): ValidationResult | null {
	const rule = availableRules.find(r => r.id === ruleId);
	if (!rule) return null;
	
	return rule.validate(nodes, edges, targetNode);
}

/**
 * Función para obtener solo los errores de validación
 * @param nodes - Lista de nodos del flujo
 * @param edges - Lista de aristas del flujo
 * @param targetNode - Nodo específico a validar (opcional)
 * @returns Array con solo los errores encontrados
 */
export function getValidationErrors(nodes: Node[], edges: Edge[] = [], targetNode?: Node): ValidationResult[] {
	return validateAllRules(nodes, edges, targetNode).filter(result => !result.isValid && result.severity === 'error');
}

/**
 * Función para obtener solo las advertencias de validación
 * @param nodes - Lista de nodos del flujo
 * @param edges - Lista de aristas del flujo
 * @param targetNode - Nodo específico a validar (opcional)
 * @returns Array con solo las advertencias encontradas
 */
export function getValidationWarnings(nodes: Node[], edges: Edge[] = [], targetNode?: Node): ValidationResult[] {
	return validateAllRules(nodes, edges, targetNode).filter(result => !result.isValid && result.severity === 'warning');
}

/**
 * Función para verificar si el flujo es válido (sin errores críticos)
 * @param nodes - Lista de nodos del flujo
 * @param edges - Lista de aristas del flujo
 * @returns true si no hay errores críticos
 */
export function isFlowValid(nodes: Node[], edges: Edge[] = []): boolean {
	const errors = getValidationErrors(nodes, edges);
	return errors.length === 0;
}
