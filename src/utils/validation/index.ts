/**
 * Sistema de validación de flujos - Punto de entrada principal
 * 
 * Este módulo proporciona un sistema completo de validación para flujos,
 * incluyendo validaciones de nodos, conexiones y handlers.
 */

// Exportar tipos principales
export type {
	ValidationResult,
	ValidationRule,
	CycleDetectionResult,
	NodeConnectionLimits,
	NodeConnectionInfo
} from './types';

// Exportar funciones principales del validador
export {
	availableRules,
	validateAllRules,
	validateRule,
	getValidationErrors,
	getValidationWarnings,
	isFlowValid
} from './validator';

// Exportar helpers útiles
export {
	detectCycles,
	getNodeConnectionLimits,
	canReceiveInput,
	canSendOutput,
	getHandleType,
	countNodeConnections
} from './helpers';

// Exportar reglas específicas para uso avanzado
export { nodeRules } from './rules/nodeRules';
export { connectionRules } from './rules/connectionRules';
export { handlerRules } from './rules/handlerRules';

// Re-exportar reglas individuales para casos específicos
export { 
	singleStartNodeRule, 
	singleEndNodeRule 
} from './rules/nodeRules';

export { 
	noCircularConnectionsRule 
} from './rules/connectionRules';

export { 
	validHandlerConnectionsRule 
} from './rules/handlerRules';
