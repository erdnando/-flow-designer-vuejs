/**
 * Composable for node state management
 * Handles hover, toolbar visibility, and selection state
 */

import { ref, computed } from 'vue';
import { useNode } from '@vue-flow/core';
import { NODE_CONFIG } from '../constants';

export function useNodeState() {
	// Reactive state
	const showToolbar = ref(false);
	const isHovered = ref(false);
	let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

	// Vue-Flow node instance
	const nodeInstance = useNode ? useNode() : undefined;

	// Computed properties
	const isNodeSelected = computed(() => nodeInstance?.node?.selected || false);

	// Mouse event handlers
	function onMouseEnter() {
		// Clear any pending timeout
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			hoverTimeout = null;
		}
		
		isHovered.value = true;
		showToolbar.value = true;
	}

	function onMouseLeave() {
		// Delay hiding toolbar to allow interaction
		hoverTimeout = setTimeout(() => {
			hoverTimeout = null;
			isHovered.value = false;
			
			// Only hide toolbar if node is not selected
			if (!isNodeSelected.value) {
				showToolbar.value = false;
			}
		}, NODE_CONFIG.HOVER_DELAY);
	}

	// Cleanup function
	function cleanup() {
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			hoverTimeout = null;
		}
	}

	return {
		// State
		showToolbar,
		isHovered,
		isNodeSelected,
		nodeInstance,
		
		// Methods
		onMouseEnter,
		onMouseLeave,
		cleanup
	};
}
