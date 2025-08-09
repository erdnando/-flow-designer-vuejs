import type { Node, Edge } from '@vue-flow/core';
import type { CycleDetectionResult, NodeConnectionLimits } from './types';

/**
 * Detecta ciclos en un grafo usando algoritmo DFS (Depth-First Search)
 * @param nodes - Nodos del grafo
 * @param edges - Aristas del grafo
 * @returns Información sobre ciclos detectados
 */
export function detectCycles(nodes: Node[], edges: Edge[]): CycleDetectionResult {
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

/**
 * Obtiene los límites de conexiones para un tipo de nodo específico
 * @param nodeType - Tipo del nodo
 * @returns Límites de conexiones entrantes y salientes
 */
export function getNodeConnectionLimits(nodeType: string): NodeConnectionLimits {
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
}

/**
 * Verifica si un nodo puede recibir conexiones de entrada
 * @param nodeType - Tipo del nodo
 * @returns true si puede recibir entradas
 */
export function canReceiveInput(nodeType: string): boolean {
	return nodeType !== 'start'; // START no puede recibir entradas
}

/**
 * Verifica si un nodo puede enviar conexiones de salida
 * @param nodeType - Tipo del nodo  
 * @returns true si puede enviar salidas
 */
export function canSendOutput(nodeType: string): boolean {
	return nodeType !== 'end'; // END no puede enviar salidas
}

/**
 * Determina el tipo de handle (input/output) basado en el nodo y handle ID
 * @param node - Nodo en cuestión
 * @param handleId - ID del handle
 * @param isSource - Si es el nodo fuente en la conexión
 * @returns Tipo de handle o null si es inválido
 */
export function getHandleType(node: Node, handleId: string | null | undefined, isSource: boolean): 'input' | 'output' | null {
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
}

/**
 * Cuenta las conexiones entrantes y salientes para cada nodo
 * @param nodes - Lista de nodos
 * @param edges - Lista de aristas
 * @returns Mapa con información de conexiones por nodo
 */
export function countNodeConnections(nodes: Node[], edges: Edge[]): Map<string, { incoming: number; outgoing: number }> {
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
	
	return nodeConnections;
}
