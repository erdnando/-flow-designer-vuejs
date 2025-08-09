import { computed } from 'vue';
import { nodeTypeMeta } from '../../../utils/nodeTypeMeta';
import { useNodeCatalogStore } from '../../../stores/nodeCatalog';
import { useNodeTypesStore } from '../../../stores/nodeTypes';
import type { NodeProperties, ComponentVersion, ComponentStatus } from '../types';
import { AVAILABLE_COMPONENT_VERSIONS } from '../constants';

export function useNodeProperties(props: any) {
	const nodeCatalogStore = useNodeCatalogStore();
	const nodeTypesStore = useNodeTypesStore();

	// Propiedades computadas del nodo seleccionado
	const nodeProperties = computed((): NodeProperties => {
		if (!props.node) {
			return {
				label: '',
				type: 'default',
				subtitle: '',
				customTypeId: '',
				componentVersion: '1.0.0',
			};
		}

		return {
			label: props.node.label || '',
			type: props.node.type || 'default',
			subtitle: props.node.data?.subtitle || '',
			customTypeId: props.node.data?.customTypeId || '',
			componentVersion: props.node.data?.componentVersion || '1.0.0',
		};
	});

	// Icono del nodo con prioridades
	const nodeIcon = computed(() => {
		if (!props.node) {
			return nodeTypeMeta.default.icon;
		}

		// Prioridad 1: Si el nodo tiene templateId, buscar el icono en el catálogo
		const templateId = props.node.data?.templateId;
		if (templateId) {
			const template = nodeCatalogStore.getTemplateById(templateId);
			if (template && template.data?.icon) {
				return template.data.icon;
			}
		}

		// Prioridad 2: Si el tipo existe en nodeTypeMeta, usar su icono
		const nodeType = props.node.type || 'default';
		if (nodeTypeMeta[nodeType]) {
			return nodeTypeMeta[nodeType].icon;
		}

		// Prioridad 3: Usar el icono por defecto
		return nodeTypeMeta.default.icon;
	});

	// Determinar si es un componente externo
	const isExternalComponent = computed(() => {
		return !!(props.node?.data?.customTypeId);
	});

	// Versiones disponibles del componente
	const availableVersions = computed((): ComponentVersion[] => {
		// Por el momento, todos los componentes externos solo tienen v1.0.0 disponible
		// En el futuro esto vendrá del ComponentRegistry real con múltiples versiones
		return AVAILABLE_COMPONENT_VERSIONS;
	});

	// Estado del componente
	const componentStatus = computed((): ComponentStatus => {
		if (!isExternalComponent.value) return 'unknown';
		
		// Por el momento, la versión 1.0.0 se considera estable para todos los componentes
		return 'stable';
	});

	// Texto del estado del componente
	const componentStatusText = computed(() => {
		switch (componentStatus.value) {
			case 'stable': return '✅ Estable';
			case 'beta': return '🧪 Beta';
			case 'deprecated': return '⚠️ Obsoleto';
			default: return '❓ Desconocido';
		}
	});

	// Todos los tipos de nodo disponibles
	const allNodeTypes = computed(() => {
		// Combina tipos estándar y personalizados
		const customTypes = nodeTypesStore.customNodeTypes.map((n) => n.id);
		return [...Object.keys(nodeTypeMeta), ...customTypes];
	});

	return {
		nodeProperties,
		nodeIcon,
		isExternalComponent,
		availableVersions,
		componentStatus,
		componentStatusText,
		allNodeTypes
	};
}
