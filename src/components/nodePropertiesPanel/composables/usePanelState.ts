import { ref, watch } from 'vue';
import type { NodePropertiesPanelProps, PanelState } from '../types';

export function usePanelState(props: NodePropertiesPanelProps, emit: any) {
	// Estado reactivo del panel
	const collapsed = ref(props.collapsed ?? false);
	
	// Computed para determinar el estado del panel
	const panelState = ref<PanelState>({
		collapsed: collapsed.value,
		disabled: props.disabled ?? false,
		showProject: props.showProject ?? false
	});

	// Título dinámico del panel
	const panelTitle = ref('');
	
	// Función para actualizar el título basado en el contexto
	function updatePanelTitle() {
		if (props.showProject) {
			panelTitle.value = 'Propiedades del flujo';
		} else if (props.edge) {
			panelTitle.value = 'Propiedades de la conexión';
		} else {
			panelTitle.value = 'Propiedades del nodo';
		}
	}

	// Función para alternar el estado de colapso
	function toggleCollapse() {
		collapsed.value = !collapsed.value;
		panelState.value.collapsed = collapsed.value;
		emit('toggle-collapsed', collapsed.value);
	}

	// Watchers para sincronizar con props
	watch(
		() => props.collapsed,
		(newValue) => {
			if (typeof newValue === 'boolean') {
				collapsed.value = newValue;
				panelState.value.collapsed = newValue;
			}
		}
	);

	watch(
		() => props.disabled,
		(newValue) => {
			panelState.value.disabled = newValue ?? false;
		}
	);

	watch(
		() => props.showProject,
		(newValue) => {
			panelState.value.showProject = newValue ?? false;
			updatePanelTitle();
		}
	);

	watch(
		() => props.edge,
		() => {
			updatePanelTitle();
		}
	);

	watch(
		() => props.node,
		() => {
			collapsed.value = props.collapsed ?? false;
			panelState.value.collapsed = collapsed.value;
			updatePanelTitle();
		},
		{ immediate: true }
	);

	// Inicializar título
	updatePanelTitle();

	return {
		collapsed,
		panelState,
		panelTitle,
		toggleCollapse
	};
}
