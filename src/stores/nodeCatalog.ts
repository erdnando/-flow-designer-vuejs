import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';

// Interface para definir un template de nodo del catálogo
export interface NodeTemplate {
	id: string;
	name: string;
	type: 'custom'; // Siempre será custom (que se mapea a customnode)
	icon: string;
	color?: string;
	defaultData?: any;
	description?: string;
	category?: string;
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
			type: 'custom',
			icon: '🪪',
			description: 'Nodo para validación de INE',
			category: 'Proceso',
			defaultData: {
				subtitle: 'Validación de INE',
				config: {
					type: 'ine_validation'
				}
			}
		},
		{
			id: 'captura-rapida',
			name: 'Captura Rápida',
			type: 'custom',
			icon: '📋',
			description: 'Captura rápida de datos',
			category: 'Proceso',
			defaultData: {
				subtitle: 'Captura rápida',
				config: {
					type: 'quick_capture'
				}
			}
		},
		{
			id: 'firma',
			name: 'Firma',
			type: 'custom',
			icon: '📝',
			description: 'Captura de firma digital',
			category: 'Proceso',
			defaultData: {
				subtitle: 'Firma digital',
				config: {
					type: 'signature_capture'
				}
			}
		},
		{
			id: 'captura-completa',
			name: 'Captura Completa',
			type: 'custom',
			icon: '📊',
			description: 'Captura completa de información',
			category: 'Proceso',
			defaultData: {
				subtitle: 'Captura completa',
				config: {
					type: 'full_capture'
				}
			}
		},
		{
			id: 'captura-telefonos',
			name: 'Captura Teléfonos',
			type: 'custom',
			icon: '☎️',
			description: 'Captura de números telefónicos',
			category: 'Proceso',
			defaultData: {
				subtitle: 'Captura teléfonos',
				config: {
					type: 'phone_capture'
				}
			}
		},
		{
			id: 'cargadocs',
			name: 'CargaDocs',
			type: 'custom',
			icon: '📄',
			description: 'Carga de documentos alternativa',
			category: 'Proceso',
			defaultData: {
				subtitle: 'Carga docs',
				config: {
					type: 'docs_upload'
				}
			}
		},
		{
			id: 'motor-1',
			name: 'Motor 1',
			type: 'custom',
			icon: '⚙️',
			description: 'Motor de procesamiento 1',
			category: 'Motores de decisión',
			defaultData: {
				subtitle: 'Motor 1',
				config: {
					type: 'engine_1'
				}
			}
		},
		{
			id: 'motor-2',
			name: 'Motor 2',
			type: 'custom',
			icon: '⚙️',
			description: 'Motor de procesamiento 2',
			category: 'Motores de decisión',
			defaultData: {
				subtitle: 'Motor 2',
				config: {
					type: 'engine_2'
				}
			}
		},
		{
			id: 'motor-3',
			name: 'Motor 3',
			type: 'custom',
			icon: '⚙️',
			description: 'Motor de procesamiento 3',
			category: 'Motores de decisión',
			defaultData: {
				subtitle: 'Motor 3',
				config: {
					type: 'engine_3'
				}
			}
		},
		{
			id: 'alta-vision',
			name: 'Alta Producto',
			type: 'custom',
			icon: '🏦',
			description: 'Sistema de visión avanzada',
			category: 'Proceso',
			defaultData: {
				subtitle: 'Alta producto',
				config: {
					type: 'high_vision'
				}
			}
		}
	];

	// Computed para obtener nodos por categoría
	const nodesByCategory = computed(() => {
		const categories: Record<string, NodeTemplate[]> = {};
		nodeTemplates.value.forEach(template => {
			const category = template.category || 'Sin categoría';
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
		return nodeTemplates.value.filter(template => template.category === category);
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
