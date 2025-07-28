import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';

// Interface para definir un template de nodo del catálogo
export interface NodeTemplate {
	id: string;
	name: string;
	subtitle: string;
	categoria: string;
	description: string;
	version: string; // Versión del nodo
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
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M26 11H12c-1.5 0-2.5 1-2.5 2.5v11c0 1.5 1 2.5 2.5 2.5h14c1.5 0 2.5-1 2.5-2.5v-11c0-1.5-1-2.5-2.5-2.5zm-1 13H13c-0.5 0-1-0.5-1-1v-6h14v6c0 0.5-0.5 1-1 1z" fill="white"/></svg>',
				customTypeId: 'ine',
			},
		},
		{
			id: 'captura-rapida',
			name: 'Captura Rápida',
			subtitle: 'Captura rápida',
			categoria: 'Proceso',
			description: 'Captura rápida de datos',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M18 6H12c-1.5 0-2.5 1-2.5 2.5v21c0 1.5 1 2.5 2.5 2.5h6c1.5 0 2.5-1 2.5-2.5v-21c0-1.5-1-2.5-2.5-2.5zm-1 12h-4v-2h4v2zm2-4H11v-2h8v2z" fill="white"/></svg>',
				customTypeId: 'captura-rapida',
			},
		},
		{
			id: 'firma',
			name: 'Firma',
			subtitle: 'Firma digital',
			categoria: 'Proceso',
			description: 'Captura de firma digital',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M18 6H12c-1.5 0-2.5 1-2.5 2.5v21c0 1.5 1 2.5 2.5 2.5h6c1.5 0 2.5-1 2.5-2.5v-21c0-1.5-1-2.5-2.5-2.5zm-3 18l-3-3 1.5-1.5 1.5 1.5 5.5-5.5 1.5 1.5-7 7z" fill="white"/></svg>',
				customTypeId: 'firma',
			},
		},
		{
			id: 'captura-completa',
			name: 'Captura Completa',
			subtitle: 'Captura completa',
			categoria: 'Proceso',
			description: 'Captura completa de información',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M25 7H13c-1.5 0-2.5 1-2.5 2.5v19c0 1.5 1 2.5 2.5 2.5h12c1.5 0 2.5-1 2.5-2.5v-19c0-1.5-1-2.5-2.5-2.5zM15 23h-2v-7h2v7zm4 0h-2v-10h2v10zm4 0h-2v-4h2v4z" fill="white"/></svg>',
				customTypeId: 'captura-completa',
			},
		},
		{
			id: 'captura-telefonos',
			name: 'Captura Teléfonos',
			subtitle: 'Captura teléfonos',
			categoria: 'Proceso',
			description: 'Captura de números telefónicos',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M26 19.5c-1.5 0-2.5-.25-3.5-.6-.35-.12-.75-.03-1 .25l-1.5 2c-2.8-1.3-5.5-3.9-6.9-6.8l2-1.7c.25-.25.35-.65.25-1-.35-1.1-.55-2.3-.55-3.5 0-.55-.45-1-1-1H8.2c-.55 0-1 .25-1 1 0 9.3 7.7 17 17 17 .7 0 1-.6 1-1.2v-3.4c0-.55-.45-1-1-1z" fill="white"/></svg>',
				customTypeId: 'captura-telefonos',
			},
		},
		{
			id: 'cargadocs',
			name: 'CargaDocs',
			subtitle: 'Carga docs',
			categoria: 'Proceso',
			description: 'Carga de documentos alternativa',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M18 6H12c-1.5 0-2.5 1-2.5 2.5v21c0 1.5 1 2.5 2.5 2.5h6c1.5 0 2.5-1 2.5-2.5v-8l-6-6zm4 18H12v-20h7v5h5v15z" fill="white"/></svg>',
				customTypeId: 'cargadocs',
			},
		},
		{
			id: 'motor-1',
			name: 'Motor 1',
			subtitle: 'Motor 1',
			categoria: 'Motores',
			description: 'Motor de procesamiento 1',
			version: '1.0.0',
			type: 'engineNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><circle cx="19" cy="19" r="12" fill="none"/><path d="m13.5 21.5 9.5-9.5-2-2-7.5 7.5-3.5-3.5-2 2 5.5 5.5z" fill="white"/></svg>',
				customTypeId: 'motor-1',
			},
		},
		{
			id: 'motor-2',
			name: 'Motor 2',
			subtitle: 'Motor 2',
			categoria: 'Motores',
			description: 'Motor de procesamiento 2',
			version: '1.0.0',
			type: 'engineNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><circle cx="19" cy="19" r="12" fill="white" fill-opacity="0.2"/><path d="m13.5 21.5 9.5-9.5-2-2-7.5 7.5-3.5-3.5-2 2 5.5 5.5z" fill="white"/></svg>',
				customTypeId: 'motor-2',
			},
		},
		{
			id: 'motor-3',
			name: 'Motor 3',
			subtitle: 'Motor 3',
			categoria: 'Motores',
			description: 'Motor de procesamiento 3',
			version: '1.0.0',
			type: 'engineNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><circle cx="19" cy="19" r="12" fill="white"/><path d="m13.5 21.5 9.5-9.5-2-2-7.5 7.5-3.5-3.5-2 2 5.5 5.5z" fill="#23272e"/></svg>',
				customTypeId: 'motor-3',
			},
		},
		{
			id: 'alta-vision',
			name: 'Alta Producto',
			subtitle: 'Alta producto',
			categoria: 'Proceso',
			description: 'Sistema de visión avanzada',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M26 8H12c-1.5 0-2.5 1-2.5 2.5v15c0 1.5 1 2.5 2.5 2.5h14c1.5 0 2.5-1 2.5-2.5v-15c0-1.5-1-2.5-2.5-2.5zm-1 15H13c-.6 0-1-.5-1-1v-9h14v9c0 .5-.4 1-1 1z" fill="white"/><path d="M15 17h2v2h-2v-2zm0-4h2v2h-2v-2z" fill="white"/><path d="M11 17h2v2h-2v-2zm0-4h2v2h-2v-2z" fill="white"/></svg>',
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
