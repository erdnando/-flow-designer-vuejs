<template>
	<div class="node-panel" :class="{ collapsed }">
		<div v-if="collapsed" class="collapsed-top">
			<button class="collapse-btn" @click.stop="toggle">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
					<g>
						<path
							d="M10.5 7L14.5 12L10.5 17"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M7 7L11 12L7 17"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</g>
				</svg>
			</button>
		</div>
		<div v-else class="panel-header" @click="toggle">
			<span>Nodos</span>
			<button class="collapse-btn">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
					<g>
						<path
							d="M13.5 7L9.5 12L13.5 17"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M17 7L13 12L17 17"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</g>
				</svg>
			</button>
		</div>
		<div v-if="!collapsed" class="panel-content">
			<input v-model="search" class="search" placeholder="Buscar nodo..." />
			<div class="accordion-container">
				<div v-for="cat in filteredCategories" :key="cat.name" class="accordion-section">
					<div 
						class="accordion-header"
						@click="toggleCategory(cat.name)"
						:class="{ 'active': isCategoryExpanded(cat.name) }"
					>
						<div class="accordion-title">
							<span class="category-icon">{{ getCategoryIcon(cat.name) }}</span>
							<span class="category-name">{{ cat.name }}</span>
							<span class="node-count">({{ cat.nodes.length }})</span>
						</div>
						<div class="accordion-arrow" :class="{ 'expanded': isCategoryExpanded(cat.name) }">
							<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
								<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					</div>
					<div 
						class="accordion-content"
						:class="{ 'expanded': isCategoryExpanded(cat.name) }"
					>
						<div class="node-grid">
							<div
								v-for="node in cat.nodes"
								:key="(node as any).templateId || node.type"
								class="node-card"
								draggable="true"
								@dragstart="onDragStart(node as any, $event)"
							>
								<div class="node-card-icon">
									<span 
										v-html="(node as any).icon || (nodeTypeMeta[node.type]?.icon || nodeTypeMeta.default.icon)"
									></span>
								</div>
								<div class="node-card-label">{{ node.label }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { nodeTypeMeta } from '../utils/nodeTypeMeta';
import { useNodeCatalogStore } from '../stores/nodeCatalog';

const collapsed = ref(false);
const search = ref('');

// Estado del acordeón - categorías expandidas
const expandedCategories = ref<Set<string>>(new Set(['Control de flujo', 'Captura', 'Motores de decisión', 'Alta Producto'])); // Categorías principales expandidas por defecto

// Usar el store del catálogo de nodos
const nodeCatalogStore = useNodeCatalogStore();

// Inicializar el catálogo cuando se monta el componente
onMounted(() => {
	nodeCatalogStore.initializeCatalog();
});

// Estructura de categorías (combinando estáticos + dinámicos del catálogo)
const nodeCategories = computed(() => {
	const staticCategories = [
		{
			name: 'Control de flujo',
			nodes: [
				{ type: 'start', label: 'START' },
				{ type: 'condition', label: 'Condición (If)' },
				{ type: 'end', label: 'END' },
			],
		},
	];

	// Agregar categorías dinámicas del catálogo
	const dynamicCategories = Object.entries(nodeCatalogStore.nodesByCategory).map(([categoryName, templates]) => ({
		name: categoryName,
		nodes: templates.map(template => ({
			type: template.type,
			label: template.name,
			templateId: template.id,
			icon: template.icon,
			defaultData: template.defaultData
		}))
	}));

	return [...staticCategories, ...dynamicCategories];
});

const filteredCategories = computed(() => {
	if (!search.value) return nodeCategories.value;
	return nodeCategories.value
		.map((cat) => ({
			...cat,
			nodes: cat.nodes.filter((n) => n.label.toLowerCase().includes(search.value.toLowerCase())),
		}))
		.filter((cat) => cat.nodes.length > 0);
});

function toggle() {
	collapsed.value = !collapsed.value;
}

// Funciones del acordeón
function toggleCategory(categoryName: string) {
	if (expandedCategories.value.has(categoryName)) {
		expandedCategories.value.delete(categoryName);
	} else {
		expandedCategories.value.add(categoryName);
	}
}

function isCategoryExpanded(categoryName: string): boolean {
	return expandedCategories.value.has(categoryName);
}

function getCategoryIcon(categoryName: string): string {
	const iconMap: Record<string, string> = {
		'Control de flujo': '🔀',
		'Captura': '📋',
		'Procesamiento': '⚙️',
		'Motores de decisión': '⚙️',
		'Documentos': '📑',
		'Sistema': '🔧',
		'Control': '🖥️',
		'Análisis': '📊',
		'Producción': '🏭',
		'Alta Producto': '💳'
	};
	return iconMap[categoryName] || '📁';
}

function onDragStart(
	node: {
		type: string;
		label: string;
		templateId?: string;
		icon?: string;
		defaultData?: any;
	},
	e: DragEvent,
) {
	e.dataTransfer?.setData('application/node-type', node.type);
	e.dataTransfer?.setData('text/plain', node.label);
	
	// Para nodos del catálogo, pasar información adicional
	if (node.templateId) {
		e.dataTransfer?.setData('application-template-id', node.templateId);
		e.dataTransfer?.setData('application-default-data', JSON.stringify(node.defaultData || {}));
	}
}
</script>

<style scoped>
.node-panel {
	width: 100%;
	height: 100vh;
	background: #23272e;
	color: #fff;
	border-right: 1.5px solid #23272e;
	box-shadow: 2px 0 12px 0 rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
	transition: width 0.2s;
	z-index: 20;
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}
.node-panel.collapsed {
	width: 36px;
	min-width: 36px;
}
.collapsed-top {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 12px;
	height: 100%;
}
.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 12px;
	font-weight: bold;
	background: #23272e;
	cursor: pointer;
	border-bottom: 1px solid #23272e;
}
.collapse-btn {
	background: none;
	border: none;
	color: #fff;
	font-size: 1.2rem;
	cursor: pointer;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
	margin-left: 8px;
	transition: background 0.15s;
}
.collapse-btn:hover {
	background: rgba(255, 255, 255, 0.06);
}
.collapse-btn svg {
	width: 18px;
	height: 18px;
	display: block;
}
.panel-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 10px 8px 0 8px;
	overflow: hidden; /* Evitar overflow en el contenedor padre */
	min-height: 0; /* Permitir que flex funcione correctamente */
}
.search {
	width: 100%;
	box-sizing: border-box;
	padding: 6px 10px;
	border-radius: 6px;
	border: 1.5px solid #fff2;
	background: #23272e;
	color: #fff;
	margin-bottom: 10px;
	font-size: 1rem;
	outline: none;
	transition: border 0.2s;
}
.search:focus {
	border: 1.5px solid #ffb84d;
}

/* Estilos del Acordeón */
.accordion-container {
	margin: 0;
	padding: 0;
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	min-height: 0; /* Permitir que flex funcione correctamente */
}

/* Personalizar scrollbar para mejor apariencia */
.accordion-container::-webkit-scrollbar {
	width: 6px;
}

.accordion-container::-webkit-scrollbar-track {
	background: #1a1d23;
	border-radius: 3px;
}

.accordion-container::-webkit-scrollbar-thumb {
	background: #404040;
	border-radius: 3px;
}

.accordion-container::-webkit-scrollbar-thumb:hover {
	background: #555;
}

.accordion-section {
	margin-bottom: 4px;
	border-radius: 8px;
	border: 1px solid #333;
	background: #2a2d35;
	overflow: hidden;
}

.accordion-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	background: #2a2d35;
	cursor: pointer;
	transition: all 0.2s ease;
	border-bottom: 1px solid transparent;
}

.accordion-header:hover {
	background: #31353c;
}

.accordion-header.active {
	background: #31353c;
	border-bottom: 1px solid #404040;
}

.accordion-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 600;
	font-size: 0.95rem;
	color: #fff;
}

.category-icon {
	font-size: 1.1rem;
}

.category-name {
	color: #ffb84d;
}

.node-count {
	font-size: 0.85rem;
	color: #999;
	font-weight: 400;
}

.accordion-arrow {
	transition: transform 0.2s ease;
	color: #999;
}

.accordion-arrow.expanded {
	transform: rotate(180deg);
}

.accordion-content {
	max-height: 0;
	overflow: hidden;
	transition: max-height 0.3s ease;
	background: #23272e;
}

.accordion-content.expanded {
	max-height: 1000px; /* Valor más alto para manejar categorías con muchos nodos */
}

/* Grid de nodos mejorado - 2 columnas */
.node-grid {
	display: grid;
	grid-template-columns: 1fr 1fr; /* Forzar exactamente 2 columnas */
	gap: 4px;
	padding: 6px 10px 10px 10px;
}

.node-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 3px;
	padding: 6px 3px;
	border-radius: 4px;
	background: transparent;
	border: 0px solid #404040;
	cursor: grab;
	transition: all 0.2s ease;
	min-height: 55px;
	justify-content: center;
	font-size: 0.8rem;
}

.node-card:hover {
	background: #31353c;
	border-color: #555;
	transform: translateY(-1px);
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.node-card:active {
	cursor: grabbing;
	transform: translateY(0);
}

.node-card-icon {
	font-size: 1.1rem;
	line-height: 1;
}

.node-card-icon svg {
	width: 16px;
	height: 16px;
	fill: #ffb84d;
}

.node-card-label {
	font-size: 0.65rem;
	font-weight: 500;
	color: #fff;
	text-align: center;
	line-height: 0.9;
	word-break: break-word;
	hyphens: auto;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	max-height: 2.4em; /* Limitar a máximo 2 líneas */
}
.add-node-type-btn {
	width: 100%;
	margin-bottom: 10px;
	background: #ffb84d;
	color: #23272e;
	border: none;
	border-radius: 6px;
	padding: 7px 0;
	font-weight: bold;
	cursor: pointer;
	font-size: 1rem;
	transition: background 0.18s;
}
.add-node-type-btn:hover {
	background: #ffcb7d;
}
.edit-btn,
.delete-btn {
	background: none;
	border: none;
	color: #ffb84d;
	font-size: 1.1em;
	margin-left: 6px;
	cursor: pointer;
}
.delete-btn {
	color: #e14d43;
}
</style>
