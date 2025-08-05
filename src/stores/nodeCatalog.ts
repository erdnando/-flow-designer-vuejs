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
			id: 'landing',
			name: 'Landing',
			subtitle: 'Landing page',
			categoria: 'Proceso',
			description: 'Página de inicio del proceso',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M10 8h18c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H10c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill="white"/><rect x="12" y="12" width="14" height="3" fill="#23272e"/><rect x="12" y="17" width="10" height="2" fill="#23272e"/><rect x="12" y="21" width="8" height="2" fill="#23272e"/><circle cx="16" cy="26" r="1.5" fill="#23272e"/><circle cx="22" cy="26" r="1.5" fill="#23272e"/></svg>',
				customTypeId: 'landing',
			},
		},
		{
			id: 'basicos',
			name: 'Básicos',
			subtitle: 'Datos básicos',
			categoria: 'Proceso',
			description: 'Captura de datos básicos como teléfono y email',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M12 10h14c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2z" fill="white"/><circle cx="14" cy="13" r="1" fill="#23272e"/><path d="M16 13h8v1h-8v-1zm0 2h6v1h-6v-1z" fill="#23272e"/><path d="M21 20c-1.2 0-2-.2-2.8-.5-.3-.1-.6 0-.8.2l-1.2 1.6c-2.2-1-4.4-3.1-5.5-5.4l1.6-1.4c.2-.2.3-.5.2-.8-.3-.9-.4-1.8-.4-2.8 0-.4-.4-.8-.8-.8h-2.7c-.4 0-.8.2-.8.8 0 7.4 6.2 13.6 13.6 13.6.6 0 .8-.5.8-1v-2.7c0-.4-.4-.8-.8-.8z" fill="white"/></svg>',
				customTypeId: 'basicos',
			},
		},
		{
			id: 'legales',
			name: 'Legales',
			subtitle: 'Términos legales',
			categoria: 'Proceso',
			description: 'Aceptación de términos y condiciones de privacidad',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M12 8h14c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill="white"/><path d="M15 12h8v1.5h-8v-1.5zm0 3h8v1h-8v-1zm0 2.5h6v1h-6v-1zm0 2.5h7v1h-7v-1z" fill="#23272e"/><path d="M19 23c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="#23272e"/><path d="M19 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="white"/><rect x="14" y="26" width="10" height="2" rx="1" fill="#23272e"/></svg>',
				customTypeId: 'legales',
			},
		},
		{
			id: 'sms',
			name: 'SMS',
			subtitle: 'Verificación SMS',
			categoria: 'Proceso',
			description: 'Verificación por código SMS',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><rect x="8" y="10" width="22" height="16" rx="3" fill="white"/><path d="M10 14h16v1.5h-16v-1.5zm0 3h14v1h-14v-1zm0 2.5h10v1h-10v-1z" fill="#23272e"/><circle cx="12" cy="23" r="1" fill="#23272e"/><circle cx="16" cy="23" r="1" fill="#23272e"/><circle cx="20" cy="23" r="1" fill="#23272e"/><path d="M6 16c0-1.1.9-2 2-2h1v8h-1c-1.1 0-2-.9-2-2v-4z" fill="white"/><path d="M30 16c0-1.1-.9-2-2-2h-1v8h1c1.1 0 2-.9 2-2v-4z" fill="white"/></svg>',
				customTypeId: 'sms',
			},
		},
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
			id: 'selfie',
			name: 'Selfie',
			subtitle: 'Captura selfie',
			categoria: 'Proceso',
			description: 'Captura de fotografía selfie para verificación',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><rect x="8" y="8" width="22" height="16" rx="2" fill="white"/><circle cx="19" cy="15" r="4" fill="#23272e"/><circle cx="19" cy="15" r="2.5" fill="white"/><circle cx="17.5" cy="13.5" r="0.8" fill="#23272e"/><path d="M15 19.5c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#23272e" stroke-width="1" fill="none"/><circle cx="26" cy="11" r="1.5" fill="#23272e"/><rect x="12" y="26" width="14" height="3" rx="1.5" fill="white"/><circle cx="16" cy="27.5" r="0.8" fill="#23272e"/><circle cx="22" cy="27.5" r="0.8" fill="#23272e"/></svg>',
				customTypeId: 'selfie',
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
			id: 'alta-producto',
			name: 'Alta Producto',
			subtitle: 'Alta producto',
			categoria: 'Proceso',
			description: 'alta del producto',
			version: '1.0.0',
			type: 'processNode',
			data: {
				icon: '<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M26 8H12c-1.5 0-2.5 1-2.5 2.5v15c0 1.5 1 2.5 2.5 2.5h14c1.5 0 2.5-1 2.5-2.5v-15c0-1.5-1-2.5-2.5-2.5zm-1 15H13c-.6 0-1-.5-1-1v-9h14v9c0 .5-.4 1-1 1z" fill="white"/><path d="M15 17h2v2h-2v-2zm0-4h2v2h-2v-2z" fill="white"/><path d="M11 17h2v2h-2v-2zm0-4h2v2h-2v-2z" fill="white"/></svg>',
				customTypeId: 'alta-producto',
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
