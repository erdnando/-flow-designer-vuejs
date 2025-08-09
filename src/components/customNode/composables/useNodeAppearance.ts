/**
 * Composable for node appearance management
 * Handles icons, labels, versions, and display logic
 */

import { computed } from 'vue';
import { useNodeCatalogStore } from '../../../stores/nodeCatalog';
import { nodeTypeMeta } from '../../../utils/nodeTypeMeta';
import { NODE_CONFIG } from '../constants';
import type { NodeProps } from '../types';

export function useNodeAppearance(
	props: NodeProps,
	nodeInstance: ReturnType<typeof import('@vue-flow/core').useNode> | undefined
) {
	const nodeCatalogStore = useNodeCatalogStore();

	// Separar las fuentes de datos para evitar ciclos reactivos
	const rawData = computed(() => {
		// Combinar todas las fuentes de datos, priorizando en este orden:
		// 1. Propiedades directas del nodo (si existe nodeInstance)
		// 2. Propiedades en el objeto data del nodo (desde props.data)
		const nodeData: any = nodeInstance?.node?.data || {};

		return {
			// Propiedades directas del nodo (si existe)
			nodeLabel: nodeInstance?.node?.label,
			nodeType: nodeInstance?.node?.type,
			// Propiedades de data (de props)
			dataLabel: props.data?.label,
			dataType: props.data?.type,
			dataSubtitle: props.data?.subtitle,
			// Propiedades de data (del nodo, si existe)
			nodeDataLabel: nodeData.label,
			nodeDataType: nodeData.type,
			nodeDataSubtitle: nodeData.subtitle,
			// Propiedades del catálogo
			templateId: nodeData.templateId,
			isFromCatalog: nodeData.isFromCatalog,
		};
	});

	// Computed properties que resuelven en cascada según prioridad
	const nodeLabel = computed(
		() => rawData.value.nodeLabel || rawData.value.dataLabel || rawData.value.nodeDataLabel || 'Nodo',
	);

	// Computed para el subtítulo del nodo
	const nodeSubtitle = computed(
		() => rawData.value.dataSubtitle || rawData.value.nodeDataSubtitle || '',
	);

	// Para el tipo, implementamos una solución robusta que siempre refleja el tipo actual
	const nodeType = computed(() => {
		// LOGGING: Información completa para diagnóstico
		console.log('Recalculando tipo de nodo. Node:', nodeInstance?.node);

		// Prioridad 1: Tipo directo del nodo (la fuente más confiable)
		const directNodeType = nodeInstance?.node?.type;
		console.log('Tipo directo del nodo:', directNodeType);

		// Prioridad 2: Tipo almacenado en data del nodo (para nodos personalizados)
		const dataTypeFromNode = (nodeInstance?.node?.data as any)?.type;
		console.log('Tipo desde node.data:', dataTypeFromNode);

		// Prioridad 3: Tipo de las props directas (para compatibilidad)
		const dataTypeFromProps = props.data?.type;
		console.log('Tipo desde props.data:', dataTypeFromProps);

		// Elegimos el primer tipo válido siguiendo la prioridad establecida
		// Esta lógica es crucial para reflejar correctamente los cambios de tipo
		const finalType = directNodeType || dataTypeFromNode || dataTypeFromProps || 'default';
		console.log('Tipo final determinado:', finalType);

		return finalType;
	});

	// Computed para mostrar el tipo de nodo en el badge (solo para nodos processNode)
	const nodeTypeDisplay = computed(() => {
		const type = nodeType.value;
		// Los nodos processNode muestran 'processNode'
		// Los engineNode tienen su propio componente que muestra 'engineNode'
		return type === 'processNode' ? 'processNode' : type;
	});

	// Computed para mostrar la versión del nodo
	const nodeVersion = computed(() => {
		// Prioridad 1: Versión específica del componente externo en node.data
		const nodeData: any = nodeInstance?.node?.data;
		if (nodeData?.componentVersion) {
			return `v${nodeData.componentVersion}`;
		}
		
		// Prioridad 2: Si el nodo tiene templateId, buscar la versión en el catálogo
		const templateId = rawData.value.templateId;
		if (templateId) {
			const template = nodeCatalogStore.getTemplateById(templateId);
			if (template && template.version) {
				return `v${template.version}`;
			}
		}
		
		// Prioridad 3: Versión por defecto
		return NODE_CONFIG.DEFAULT_VERSION;
	});

	// El icono se actualiza automáticamente cuando cambia nodeType
	const nodeIcon = computed(() => {
		// FORZAR ACTUALIZACIÓN: Siempre recalcular el icono basado en el tipo actual
		// Intentar obtener el tipo más actualizado posible
		const currentType = nodeType.value;
		console.log('Actualizando ícono para tipo:', currentType);

		// Prioridad 1: Si el nodo tiene templateId, buscar el icono en el catálogo
		const templateId = rawData.value.templateId;
		if (templateId) {
			const template = nodeCatalogStore.getTemplateById(templateId);
			if (template && template.data?.icon) {
				console.log('Usando icono del template:', template.data.icon, 'para templateId:', templateId);
				return template.data.icon;
			}
		}

		// Prioridad 2: Si el tipo existe en nodeTypeMeta, usar su icono
		if (nodeTypeMeta[currentType]) {
			return nodeTypeMeta[currentType].icon;
		}

		// Prioridad 3: Usar el icono por defecto
		return nodeTypeMeta.default.icon;
	});

	return {
		nodeLabel,
		nodeSubtitle,
		nodeType,
		nodeTypeDisplay,
		nodeVersion,
		nodeIcon,
		rawData
	};
}
