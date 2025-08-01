import { defineStore } from 'pinia';
import type { Node, Edge, Connection, XYPosition } from '@vue-flow/core';
import { ref } from 'vue';

export const useFlowStore = defineStore('flow', () => {
	// Estado reactivo para nodos y edges
	const nodes = ref<Node[]>([]);
	const edges = ref<Edge[]>([]);
	
	// Título del flujo
	const flowTitle = ref<string>('Mi Flujo de Trabajo');

	// Método para agregar nodos
	function addNode(opts?: { type?: string; label?: string; position?: XYPosition; data?: any }) {
		const newId = (nodes.value.length + 1).toString();

		// Aseguramos que el nodo siempre tenga un objeto data con la propiedad subtitle
		const data = {
			subtitle: '', // Inicializar con cadena vacía para que sea validado
			...(opts?.data || {}), // Mantener el resto de propiedades si existen
		};

		nodes.value.push({
			id: newId,
			label: opts?.label || `Nodo ${newId}`,
			position: opts?.position || { x: 100 + nodes.value.length * 60, y: 100 },
			type: opts?.type || 'default',
			data: data,
		});
	}

	// Método para agregar edges/conexiones
	function addEdge(connection: Connection) {
		edges.value.push({
			id: `e${connection.source}-${connection.target}`,
			source: connection.source,
			target: connection.target,
			sourceHandle: connection.sourceHandle,
			targetHandle: connection.targetHandle,
			type: 'deletable', // Usar el tipo personalizado con botón de eliminar
			animated: true,
			selectable: true,
			focusable: true,
			deletable: true,
		});
	}

	// Método para actualizar un nodo específico, optimizado para evitar actualizaciones innecesarias
	function updateNode(id: string, updates: Partial<Node>) {
		const index = nodes.value.findIndex((node) => node.id === id);
		if (index === -1) return;

		const currentNode = nodes.value[index];

		// Crear nuevo objeto para las propiedades del nodo
		const updatedNode = { ...currentNode };

		// Aplicar cambios directos (excepto data)
		Object.keys(updates).forEach((key) => {
			if (key !== 'data' && updates[key as keyof Node] !== undefined) {
				updatedNode[key as keyof Node] = updates[key as keyof Node] as any;
			}
		});

		// Manejar data por separado para preservar la estructura
		if (updates.data) {
			// Asegurar que tenemos un objeto data en el nodo actualizado
			updatedNode.data = { ...(currentNode.data || {}), ...updates.data };

			// Debug para verificar la actualización de data
			console.log(`Nodo ${id} - data actualizado:`, updatedNode.data);
		}

		// Reemplazar el nodo en el array para mantener reactividad
		nodes.value[index] = updatedNode;
	}

	return { nodes, edges, flowTitle, addNode, addEdge, updateNode };
});
