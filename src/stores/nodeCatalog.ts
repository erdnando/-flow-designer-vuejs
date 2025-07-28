import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';

// Interface para definir un template de nodo del catálogo
export interface NodeTemplate {
	id: string;
	name: string;
	subtitle: string;
	categoria: string;
	description: string;
	type: 'processNode' | 'engineNode'; // Ahora admite tanto processNode como engineNode
	// Estas propiedades se asignarán al data del nodo cuando se agregue al canvas
	data?: {
		icon?: string;
		customTypeId?: string;
		[key: string]: any;
	};
}

export const useNodeCatalogStore = defineStore('nodeCatalog', () => {
	// Estado reactivo para el catálogo de nodos
	const nodeTemplates = ref<NodeTemplate[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Datos iniciales del catálogo (simulando datos que vendrán de API)
	const initialNodeTemplates: NodeTemplate[] = [
		{
			id: 'ine',
			name: 'INE',
			subtitle: 'Validación de INE',
			categoria: 'Proceso',
			description: 'Nodo para validación de INE',
			type: 'processNode',
			data: {
				icon: '🪪',
				customTypeId: 'ine',
			},
		},
		{
			id: 'captura-rapida',
			name: 'Captura Rápida',
			subtitle: 'Captura rápida',
			categoria: 'Proceso',
			description: 'Captura rápida de datos',
			type: 'processNode',
			data: {
				icon: '📋',
				customTypeId: 'captura-rapida',
			},
		},
		{
			id: 'firma',
			name: 'Firma',
			subtitle: 'Firma digital',
			categoria: 'Proceso',
			description: 'Captura de firma digital',
			type: 'processNode',
			data: {
				icon: '📝',
				customTypeId: 'firma',
			},
		},
		{
			id: 'captura-completa',
			name: 'Captura Completa',
			subtitle: 'Captura completa',
			categoria: 'Proceso',
			description: 'Captura completa de información',
			type: 'processNode',
			data: {
				icon: '📊',
				customTypeId: 'captura-completa',
			},
		},
		{
			id: 'captura-telefonos',
			name: 'Captura Teléfonos',
			subtitle: 'Captura teléfonos',
			categoria: 'Proceso',
			description: 'Captura de números telefónicos',
			type: 'processNode',
			data: {
				icon: '☎️',
				customTypeId: 'captura-telefonos',
			},
		},
		{
			id: 'cargadocs',
			name: 'CargaDocs',
			subtitle: 'Carga docs',
			categoria: 'Proceso',
			description: 'Carga de documentos alternativa',
			type: 'processNode',
			data: {
				icon: '📄',
				customTypeId: 'cargadocs',
			},
		},
		{
			id: 'motor-1',
			name: 'Motor 1',
			subtitle: 'Motor 1',
			categoria: 'Motores de decisión',
			description: 'Motor de procesamiento 1',
			type: 'engineNode',
			data: {
				icon: '⚙️',
				customTypeId: 'motor-1',
			},
		},
		{
			id: 'motor-2',
			name: 'Motor 2',
			subtitle: 'Motor 2',
			categoria: 'Motores de decisión',
			description: 'Motor de procesamiento 2',
			type: 'engineNode',
			data: {
				icon: '⚙️',
				customTypeId: 'motor-2',
			},
		},
		{
			id: 'motor-3',
			name: 'Motor 3',
			subtitle: 'Motor 3',
			categoria: 'Motores de decisión',
			description: 'Motor de procesamiento 3',
			type: 'engineNode',
			data: {
				icon: '⚙️',
				customTypeId: 'motor-3',
			},
		},
		{
			id: 'alta-vision',
			name: 'Alta Producto',
			subtitle: 'Alta producto',
			categoria: 'Proceso',
			description: 'Sistema de visión avanzada',
			type: 'processNode',
			data: {
				icon: '🏦',
				customTypeId: 'alta-vision',
			},
		},
	];

	// Computed para obtener nodos por categoría
	const nodesByCategory = computed(() => {
		const categories: Record<string, NodeTemplate[]> = {};
		nodeTemplates.value.forEach(template => {
			const category = template.categoria || 'Sin categoría';
			if (!categories[category]) {
				categories[category] = [];
			}
			categories[category].push(template);
		});
		return categories;
	});

	// Computed para obtener todas las categorías
	const categories = computed(() => {
		return Object.keys(nodesByCategory.value).sort();
	});

	// Función para inicializar el catálogo con datos locales
	function initializeCatalog() {
		isLoading.value = true;
		error.value = null;
		
		try {
			// Simular un pequeño delay como si viniera de API
			setTimeout(() => {
				nodeTemplates.value = [...initialNodeTemplates];
				isLoading.value = false;
			}, 100);
		} catch (err) {
			error.value = 'Error al cargar el catálogo de nodos';
			isLoading.value = false;
		}
	}

	// Función para obtener un template por ID
	function getTemplateById(id: string): NodeTemplate | undefined {
		return nodeTemplates.value.find(template => template.id === id);
	}

	// Función para obtener templates por categoría
	function getTemplatesByCategory(category: string): NodeTemplate[] {
		return nodeTemplates.value.filter(template => template.categoria === category);
	}

	// Función para agregar un nuevo template
	function addTemplate(template: NodeTemplate) {
		nodeTemplates.value.push(template);
	}

	// Función para actualizar un template existente
	function updateTemplate(id: string, updates: Partial<NodeTemplate>) {
		const index = nodeTemplates.value.findIndex(t => t.id === id);
		if (index !== -1) {
			nodeTemplates.value[index] = { ...nodeTemplates.value[index], ...updates };
		}
	}

	// Función para eliminar un template
	function removeTemplate(id: string) {
		const index = nodeTemplates.value.findIndex(t => t.id === id);
		if (index !== -1) {
			nodeTemplates.value.splice(index, 1);
		}
	}

	return {
		// Estado
		nodeTemplates: readonly(nodeTemplates),
		isLoading: readonly(isLoading),
		error: readonly(error),
		
		// Computed
		nodesByCategory,
		categories,
		
		// Acciones
		initializeCatalog,
		getTemplateById,
		getTemplatesByCategory,
		addTemplate,
		updateTemplate,
		removeTemplate
	};
});
