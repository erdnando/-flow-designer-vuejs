import type { Node, Edge } from '@vue-flow/core';

// Tipos para el sistema de validación
export interface ValidationResult {
	isValid: boolean;
	message?: string;
	severity: 'error' | 'warning' | 'info';
	nodeId?: string;
	ruleId: string;
	affectedNodes?: string[];
	affectedEdges?: string[];
}

export interface ValidationRule {
	id: string;
	name: string;
	description: string;
	severity: 'error' | 'warning' | 'info';
	category: 'node' | 'connection' | 'flow';
	validate: (nodes: Node[], edges?: Edge[], targetNode?: Node) => ValidationResult;
}

// Regla 1: Solo debe haber un nodo tipo START
const singleStartNodeRule: ValidationRule = {
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

// Regla 2: Solo debe haber un nodo tipo END
const singleEndNodeRule: ValidationRule = {
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

// Función auxiliar para detectar ciclos usando DFS
function hasCycle(nodes: Node[], edges: Edge[]): { hasCycle: boolean; cycleNodes: string[]; cycleEdges: string[] } {
	const visited = new Set<string>();
	const recursionStack = new Set<string>();
	const cycleNodes: string[] = [];
	const cycleEdges: string[] = [];
	
	// Crear mapa de adyacencia
	const adjacencyMap = new Map<string, { nodeId: string; edgeId: string }[]>();
	
	// Inicializar el mapa con todos los nodos
	nodes.forEach(node => {
		adjacencyMap.set(node.id, []);
	});
	
	// Llenar el mapa con las conexiones
	edges.forEach(edge => {
		if (adjacencyMap.has(edge.source)) {
			adjacencyMap.get(edge.source)!.push({
				nodeId: edge.target,
				edgeId: edge.id
			});
		}
	});
	
	// Función DFS para detectar ciclos
	function dfs(nodeId: string, path: string[]): boolean {
		if (recursionStack.has(nodeId)) {
			// Se encontró un ciclo
			const cycleStart = path.indexOf(nodeId);
			cycleNodes.push(...path.slice(cycleStart));
			cycleNodes.push(nodeId); // Cerrar el ciclo
			
			// Encontrar las aristas del ciclo
			for (let i = cycleStart; i < path.length; i++) {
				const currentNode = path[i];
				const nextNode = i + 1 < path.length ? path[i + 1] : nodeId;
				const edge = edges.find(e => e.source === currentNode && e.target === nextNode);
				if (edge) {
					cycleEdges.push(edge.id);
				}
			}
			
			return true;
		}
		
		if (visited.has(nodeId)) {
			return false;
		}
		
		visited.add(nodeId);
		recursionStack.add(nodeId);
		
		const neighbors = adjacencyMap.get(nodeId) || [];
		for (const neighbor of neighbors) {
			if (dfs(neighbor.nodeId, [...path, nodeId])) {
				return true;
			}
		}
		
		recursionStack.delete(nodeId);
		return false;
	}
	
	// Verificar cada nodo como punto de inicio
	for (const node of nodes) {
		if (!visited.has(node.id)) {
			if (dfs(node.id, [])) {
				return { hasCycle: true, cycleNodes: [...new Set(cycleNodes)], cycleEdges };
			}
		}
	}
	
	return { hasCycle: false, cycleNodes: [], cycleEdges: [] };
}

// Regla 3: No permitir conexiones circulares
const noCircularConnectionsRule: ValidationRule = {
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
		
		const cycleResult = hasCycle(nodes, edges);
		
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

// Regla 4: Validar handlers de entrada y salida
const validHandlerConnectionsRule: ValidationRule = {
	id: 'valid-handler-connections',
	name: 'Conexiones válidas de handlers',
	description: 'Los handlers de salida solo pueden conectarse a handlers de entrada. Los nodos END pueden recibir múltiples conexiones como excepción.',
	severity: 'error',
	category: 'connection',
	validate: (nodes: Node[], edges: Edge[] = []): ValidationResult => {
		// Definir límites de conexiones por tipo de nodo
		const getNodeLimits = (nodeType: string) => {
			switch (nodeType) {
				case 'start':
					return { maxIncoming: 0, maxOutgoing: 1 }; // START: solo salida
				case 'end':
					return { maxIncoming: Infinity, maxOutgoing: 0 }; // END: múltiples entradas permitidas, sin salida
				case 'condition': // Nodo IF/condición
					return { maxIncoming: 1, maxOutgoing: 2 }; // IF: 1 entrada, 2 salidas (true/false)
				default:
					return { maxIncoming: 1, maxOutgoing: 1 }; // Otros nodos: 1 entrada, 1 salida
			}
		};

		// Función para verificar si un nodo puede recibir conexiones de entrada
		const canReceiveInput = (nodeType: string): boolean => {
			return nodeType !== 'start'; // START no puede recibir entradas
		};

		// Función para verificar si un nodo puede enviar conexiones de salida
		const canSendOutput = (nodeType: string): boolean => {
			return nodeType !== 'end'; // END no puede enviar salidas
		};

		// Función para verificar conexión handler-específica
		const isValidHandlerConnection = (sourceNode: Node, targetNode: Node, edge: Edge): boolean => {
			// Determinar si el handle específico es válido para cada tipo de nodo
			const getHandleType = (node: Node, handleId: string | null | undefined, isSource: boolean): 'input' | 'output' | null => {
				const nodeType = node.type || 'default';
				
				// START: solo tiene handle de salida (sin ID específico)
				if (nodeType === 'start') {
					return isSource ? 'output' : null; // START no puede ser target de conexión
				}
				
				// END: solo tiene handle de entrada (sin ID específico)
				if (nodeType === 'end') {
					return isSource ? null : 'input'; // END no puede ser source de conexión
				}
				
				// Para nodos regulares (custom, condition, etc.)
				// Usar el handleId si está disponible, sino inferir por la dirección
				if (handleId === 'input') {
					return 'input';
				} else if (handleId === 'output') {
					return 'output';
				}
				
				// Si no hay handleId específico, inferir por si es source o target
				return isSource ? 'output' : 'input';
			};
			
			const sourceHandleType = getHandleType(sourceNode, edge.sourceHandle, true);
			const targetHandleType = getHandleType(targetNode, edge.targetHandle, false);
			
			// Una conexión válida debe ser: output → input
			if (!sourceHandleType || !targetHandleType) {
				return false; // Uno de los handles no existe
			}
			
			// Solo permitir conexiones output → input
			return sourceHandleType === 'output' && targetHandleType === 'input';
		};

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
		const nodeConnections = new Map<string, { incoming: number; outgoing: number }>();
		
		// Inicializar contadores
		nodes.forEach(node => {
			nodeConnections.set(node.id, { incoming: 0, outgoing: 0 });
		});
		
		// Contar conexiones reales
		edges.forEach(edge => {
			// Contar conexiones salientes
			const sourceConnections = nodeConnections.get(edge.source);
			if (sourceConnections) {
				sourceConnections.outgoing++;
			}
			
			// Contar conexiones entrantes
			const targetConnections = nodeConnections.get(edge.target);
			if (targetConnections) {
				targetConnections.incoming++;
			}
		});
		
		// Validar límites para cada nodo
		for (const node of nodes) {
			const limits = getNodeLimits(node.type || 'default');
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

// Registro de todas las reglas disponibles
export const availableRules: ValidationRule[] = [
	singleStartNodeRule,
	singleEndNodeRule,
	noCircularConnectionsRule,
	validHandlerConnectionsRule
];

// Función principal para validar todas las reglas
export function validateAllRules(nodes: Node[], edges: Edge[] = [], targetNode?: Node): ValidationResult[] {
	return availableRules.map(rule => rule.validate(nodes, edges, targetNode));
}

// Función para validar una regla específica
export function validateRule(ruleId: string, nodes: Node[], edges: Edge[] = [], targetNode?: Node): ValidationResult | null {
	const rule = availableRules.find(r => r.id === ruleId);
	if (!rule) return null;
	
	return rule.validate(nodes, edges, targetNode);
}

// Función para obtener solo los errores
export function getValidationErrors(nodes: Node[], edges: Edge[] = [], targetNode?: Node): ValidationResult[] {
	return validateAllRules(nodes, edges, targetNode).filter(result => !result.isValid && result.severity === 'error');
}

// Función para obtener solo las advertencias
export function getValidationWarnings(nodes: Node[], edges: Edge[] = [], targetNode?: Node): ValidationResult[] {
	return validateAllRules(nodes, edges, targetNode).filter(result => !result.isValid && result.severity === 'warning');
}

// Función para verificar si el flujo es válido (sin errores críticos)
export function isFlowValid(nodes: Node[], edges: Edge[] = []): boolean {
	const errors = getValidationErrors(nodes, edges);
	return errors.length === 0;
}
