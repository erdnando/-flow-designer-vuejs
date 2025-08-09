/**
 * Composable for node event handlers
 * Manages toolbar actions and node operations
 */

import { inject } from 'vue';
import type { NodeProps } from '../types';

export function useNodeEvents(
	props: NodeProps,
	emit: any,
	nodeInstance: ReturnType<typeof import('@vue-flow/core').useNode> | undefined,
	nodeType: { value: string },
	nodeLabel: { value: string }
) {

	// Funciones para manejar la toolbar
	function handleCopy() {
		console.log('📋 CustomNode: handleCopy llamado');
		const nodeData = {
			type: nodeType.value,
			label: nodeLabel.value,
			data: props.data
		};
		emit('node-copy', nodeData);
	}

	function handleDuplicate() {
		console.log('📑 CustomNode: handleDuplicate llamado');
		const nodeData = {
			type: nodeType.value,
			label: nodeLabel.value,
			data: props.data,
			position: nodeInstance?.node?.position
		};
		emit('node-duplicate', nodeData);
	}

	function handleDelete() {
		console.log('🗑️ CustomNode: handleDelete llamado');
		console.log('🗑️ CustomNode: nodeInstance?.node?.id =', nodeInstance?.node?.id);
		
		if (nodeInstance?.node?.id) {
			console.log('🗑️ CustomNode: Llamando a función global de delete');
			
			// Intentar obtener la función global de delete del contexto padre
			const globalDeleteFunction = inject('deleteNodeFunction', null) as any;
			
			if (globalDeleteFunction) {
				console.log('🗑️ CustomNode: Usando función global inject');
				globalDeleteFunction(nodeInstance.node.id);
			} else {
				console.log('🗑️ CustomNode: Emitiendo evento node-delete con ID:', nodeInstance.node.id);
				emit('node-delete', nodeInstance.node.id);
				
				// FALLBACK: Disparar evento personalizado en el DOM
				const deleteEvent = new CustomEvent('custom-node-delete', {
					detail: { nodeId: nodeInstance.node.id },
					bubbles: true,
					cancelable: true
				});
				document.dispatchEvent(deleteEvent);
			}
		} else {
			console.warn('🗑️ CustomNode: No se pudo obtener el ID del nodo');
		}
	}

	function handleMenu(event: MouseEvent) {
		console.log('📋 CustomNode: handleMenu llamado');
		emit('node-menu', event, nodeInstance?.node);
	}

	return {
		handleCopy,
		handleDuplicate,
		handleDelete,
		handleMenu
	};
}
