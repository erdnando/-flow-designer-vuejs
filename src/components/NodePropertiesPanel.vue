<template>
	<div
		class="node-properties-panel"
		:class="[{ collapsed }, { disabled: disabled && !showProject }]"
	>
		<div v-if="collapsed" class="collapsed-top">
			<button class="collapse-btn" @click.stop="toggleCollapse">
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
		<div v-else class="panel-header" @click="collapsed = false" :tabindex="-1">
			<span class="panel-title">{{
				showProject ? 'Propiedades del flujo' : 
				edge ? 'Propiedades de la conexión' : 'Propiedades del nodo'
			}}</span>
			<button class="collapse-btn" @click.stop="toggleCollapse">
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
		<transition name="slide-panel">
			<div class="panel-body" v-show="!collapsed">
				<template v-if="showProject">
					<label>
						Nombre del flujo
						<textarea
							:value="projectProps.name"
							@input="(e) => { updateProjectProp('name', (e.target as HTMLTextAreaElement).value); autoResize(e) }"
							:disabled="disabled"
							rows="1"
							class="flow-title-input auto-resize"
							ref="titleTextarea"
						/>
					</label>
					<label>
						Descripción
						<textarea
							:value="projectProps.description"
							@input="
								(e) => { updateProjectProp('description', (e.target as HTMLTextAreaElement).value); autoResize(e) }
							"
							:disabled="disabled"
							rows="3"
							class="flow-description-input auto-resize"
							ref="descriptionTextarea"
						/>
					</label>
					<label>
						Estatus
						<select
							:value="projectProps.status"
							@change="(e) => updateProjectProp('status', (e.target as HTMLSelectElement).value)"
							:disabled="disabled"
						>
							<option value="Activo">Activo</option>
							<option value="Inactivo">Inactivo</option>
							<option value="Archivado">Archivado</option>
						</select>
					</label>
					<label>
						Propietario
						<input
							:value="projectProps.owner"
							@input="(e) => updateProjectProp('owner', (e.target as HTMLInputElement).value)"
							:disabled="disabled"
						/>
					</label>
					<div class="project-meta">
						<span>Creado: {{ projectProps?.createdAt || '' }}</span>
						<span>Actualizado: {{ projectProps?.updatedAt || '' }}</span>
					</div>
				</template>
				<template v-else-if="!disabled && edge">
					<label>
						ID de la conexión
						<input :value="edge.id" disabled />
					</label>
					<label>
						Tipo de conexión
						<select :value="edge.type || 'default'" @change="onEdgeTypeChange($event)">
							<option value="default">Por defecto</option>
							<option value="straight">Línea recta</option>
							<option value="step">Escalones</option>
							<option value="smoothstep">Escalones suaves</option>
							<option value="bezier">Curva Bézier</option>
						</select>
					</label>
					<label>
						Nodo origen
						<input :value="`${edge.source} (${getNodeLabel(edge.source)})`" disabled />
					</label>
					<label>
						Nodo destino
						<input :value="`${edge.target} (${getNodeLabel(edge.target)})`" disabled />
					</label>
					<label>
						Handle origen
						<input :value="edge.sourceHandle || 'output'" disabled />
					</label>
					<label>
						Handle destino
						<input :value="edge.targetHandle || 'input'" disabled />
					</label>
					<div class="edge-properties">
						<label class="checkbox-label">
							<input
								type="checkbox"
								:checked="edge.animated || false"
								@change="onEdgeAnimatedChange($event)"
							/>
							Animación habilitada
						</label>
						<label class="checkbox-label">
							<input
								type="checkbox"
								:checked="edge.selectable !== false"
								@change="onEdgeSelectableChange($event)"
							/>
							Seleccionable
						</label>
					</div>
					<div class="edge-meta">
						<span>Posición origen: ({{ Math.round(edge.sourceX || 0) }}, {{ Math.round(edge.sourceY || 0) }})</span>
						<span>Posición destino: ({{ Math.round(edge.targetX || 0) }}, {{ Math.round(edge.targetY || 0) }})</span>
					</div>
				</template>
				<template v-else-if="!disabled && node">
					<!-- Icono y título del nodo -->
					<div class="node-header">
						<div class="node-icon-display">
							<span v-html="nodeIcon"></span>
						</div>
						<div class="node-info">
							<h3 class="node-name">{{ nodeProperties.label || 'Nodo sin nombre' }}</h3>
							<span class="node-type-label">{{ nodeProperties.type }}</span>
						</div>
					</div>
					
					<label>
						Nombre
						<input :value="nodeProperties.label" @input="onLabelChange($event)" />
					</label>
					<label>
						Tipo
						<select
							:value="nodeProperties.type === 'if' ? 'condition' : nodeProperties.type"
							@change="onTypeChange($event)"
						>
							<option
								v-for="typeKey in allNodeTypes.filter((t) => t !== 'if')"
								:key="typeKey"
								:value="typeKey === 'condition' ? 'condition' : typeKey"
							>
								{{ typeKey === 'condition' ? 'Condición (If)' : typeKey }}
							</option>
						</select>
					</label>
					<label>
						Subtítulo
						<input
							:value="nodeProperties.subtitle"
							@input="onSubtitleChange($event)"
							placeholder="Ingrese un subtítulo"
						/>
					</label>
					
					<!-- Selector de versión para componentes externos -->
					<template v-if="isExternalComponent">
						<div class="external-component-section">
							<h4 class="section-title">🔧 Componente Externo</h4>
							<label>
								Versión del Componente
								<select
									:value="nodeProperties.componentVersion"
									@change="onComponentVersionChange($event)"
								>
									<option 
										v-for="version in availableVersions"
										:key="version.value"
										:value="version.value"
									>
										{{ version.label }}
									</option>
								</select>
							</label>
							<div class="component-info">
								<span class="component-id">ID: {{ nodeProperties.customTypeId }}</span>
								<span class="component-status" :class="componentStatus">
									{{ componentStatusText }}
								</span>
							</div>
						</div>
					</template>
				</template>
				<template v-else>
					<div class="empty-panel">
						Selecciona un nodo o haz click en el fondo para ver propiedades del flujo
					</div>
				</template>
			</div>
		</transition>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, toRefs, computed } from 'vue';
import { nodeTypeMeta } from '../utils/nodeTypeMeta';
import { useNodeTypesStore } from '../stores/nodeTypes';
import { useNodeCatalogStore } from '../stores/nodeCatalog';

const props = defineProps<{
	node: any;
	edge?: any;
	nodes?: any[];
	collapsed?: boolean;
	disabled?: boolean;
	showProject?: boolean;
	projectProps?: any;
}>();

const emit = defineEmits(['close', 'update', 'toggle-collapsed', 'update-project']);

// Referencias para los textareas
const titleTextarea = ref<HTMLTextAreaElement | null>(null);
const descriptionTextarea = ref<HTMLTextAreaElement | null>(null);

// Store del catálogo de nodos
const nodeCatalogStore = useNodeCatalogStore();

const { collapsed: collapsedProp, disabled, showProject, projectProps } = toRefs(props);
const collapsed = ref(collapsedProp?.value ?? false);

// Objeto reactivo para manejar las propiedades del nodo
// Usar computed para las propiedades del nodo seleccionado para mejorar la reactividad
const nodeProperties = computed(() => {
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

// Función computada para obtener el icono del nodo
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

// Computed para determinar si es un componente externo
const isExternalComponent = computed(() => {
	return !!(props.node?.data?.customTypeId);
});

// Computed para obtener versiones disponibles del componente
const availableVersions = computed(() => {
	// Por el momento, todos los componentes externos solo tienen v1.0.0 disponible
	// En el futuro esto vendrá del ComponentRegistry real con múltiples versiones
	return [
		{ value: '1.0.0', label: 'v1.0.0' }
	];
});

// Computed para el estado del componente
const componentStatus = computed(() => {
	if (!isExternalComponent.value) return 'unknown';
	
	// Por el momento, la versión 1.0.0 se considera estable para todos los componentes
	return 'stable';
});

// Computed para el texto del estado del componente
const componentStatusText = computed(() => {
	switch (componentStatus.value) {
		case 'stable': return '✅ Estable';
		default: return '❓ Desconocido';
	}
});

// Solo observar el estado de collapsed
watch(
	() => props.node,
	() => {
		collapsed.value = collapsedProp?.value ?? false;
	},
	{ immediate: true },
);

watch(collapsedProp, (val) => {
	if (typeof val === 'boolean') collapsed.value = val;
});

// Función para actualizar propiedades individuales del proyecto
function updateProjectProp(propName: string, value: any) {
	if (projectProps.value) {
		// Actualizar la propiedad individual en el objeto reactivo
		modifiedProjectProps.value[propName] = value;
	}
}

// Handlers para los eventos de input/change
function onLabelChange(event: Event) {
	const value = (event.target as HTMLInputElement).value;
	emit('update', { key: 'label', value });
}

function onTypeChange(event: Event) {
	let value = (event.target as HTMLSelectElement).value;
	if (value === 'if') value = 'condition'; // Forzar que 'if' se guarde como 'condition'
	if (value === 'condition') value = 'condition'; // Siempre guardar como 'condition'
	emit('update', { key: 'type', value });
}

function onSubtitleChange(event: Event) {
	const value = (event.target as HTMLInputElement).value;
	// Importante: asegurarse que el valor se pasa correctamente para subtitle
	console.log('Actualizando subtítulo:', value);
	emit('update', { key: 'subtitle', value });
}

// Handler para cambio de versión del componente externo
function onComponentVersionChange(event: Event) {
	const value = (event.target as HTMLSelectElement).value;
	console.log('Actualizando versión del componente:', value);
	emit('update', { key: 'componentVersion', value });
}

// Handlers para las propiedades de edges/conexiones
function onEdgeTypeChange(event: Event) {
	const value = (event.target as HTMLSelectElement).value;
	emit('update', { key: 'type', value, isEdge: true });
}

function onEdgeAnimatedChange(event: Event) {
	const value = (event.target as HTMLInputElement).checked;
	emit('update', { key: 'animated', value, isEdge: true });
}

function onEdgeSelectableChange(event: Event) {
	const value = (event.target as HTMLInputElement).checked;
	emit('update', { key: 'selectable', value, isEdge: true });
}

// Helper para obtener el label de un nodo por su ID
function getNodeLabel(nodeId: string): string {
	if (!props.nodes) return `Nodo ${nodeId}`;
	
	const node = props.nodes.find((n: any) => n.id === nodeId);
	return node?.label || `Nodo ${nodeId}`;
}

function toggleCollapse() {
	collapsed.value = !collapsed.value;
	emit('toggle-collapsed', collapsed.value);
}

// Función para auto-redimensionar textareas
function autoResize(event: Event) {
	const textarea = event.target as HTMLTextAreaElement;
	if (!textarea) return;
	
	// Resetear la altura para obtener la altura real del contenido
	textarea.style.height = 'auto';
	
	// Calcular la nueva altura basada en el scrollHeight
	// Agregar solo 1px de padding extra para evitar el scroll sin que se vea excesivo
	const newHeight = textarea.scrollHeight + 0.2;
	
	// Aplicar la nueva altura
	textarea.style.height = newHeight + 'px';
}

// Función auxiliar para redimensionar un textarea específico
function resizeTextarea(textarea: HTMLTextAreaElement) {
	if (!textarea) return;
	
	// Resetear la altura para obtener la altura real del contenido
	textarea.style.height = 'auto';
	
	// Calcular la nueva altura basada en el scrollHeight
	const newHeight = textarea.scrollHeight + 1;
	
	// Aplicar la nueva altura
	textarea.style.height = newHeight + 'px';
}

// Observar cambios en las propiedades del proyecto para redimensionar
watch(
	() => props.projectProps?.name,
	() => {
		if (titleTextarea.value) {
			setTimeout(() => resizeTextarea(titleTextarea.value!), 10);
		}
	}
);

watch(
	() => props.projectProps?.description,
	() => {
		if (descriptionTextarea.value) {
			setTimeout(() => resizeTextarea(descriptionTextarea.value!), 10);
		}
	}
);

// Objeto para mantener un seguimiento de las propiedades modificadas
const modifiedProjectProps = ref<Record<string, any>>({});

// Watchers independientes para cada propiedad del proyecto
watch(
	() => projectProps.value?.name,
	(newVal) => {
		if (newVal !== undefined) modifiedProjectProps.value.name = newVal;
	},
);

watch(
	() => projectProps.value?.description,
	(newVal) => {
		if (newVal !== undefined) modifiedProjectProps.value.description = newVal;
	},
);

watch(
	() => projectProps.value?.status,
	(newVal) => {
		if (newVal !== undefined) modifiedProjectProps.value.status = newVal;
	},
);

watch(
	() => projectProps.value?.owner,
	(newVal) => {
		if (newVal !== undefined) modifiedProjectProps.value.owner = newVal;
	},
);

// Notificamos cambios debounced para evitar ciclos
let projectUpdateTimer: number | null = null;
watch(
	modifiedProjectProps,
	() => {
		if (projectUpdateTimer !== null) {
			clearTimeout(projectUpdateTimer);
		}

		projectUpdateTimer = window.setTimeout(() => {
			if (Object.keys(modifiedProjectProps.value).length > 0) {
				emit('update-project', { ...modifiedProjectProps.value });
				modifiedProjectProps.value = {}; // Reiniciar después de emitir
			}
		}, 300);
	},
	{ deep: true },
);

const nodeTypesStore = useNodeTypesStore();

const allNodeTypes = computed(() => {
	// Combina tipos estándar y personalizados
	const customTypes = nodeTypesStore.customNodeTypes.map((n) => n.id);
	return [...Object.keys(nodeTypeMeta), ...customTypes];
});
</script>

<style scoped>
.node-properties-panel {
	position: absolute;
	top: 0;
	right: 0;
	width: 320px;
	height: 100%;
	background: #23272e;
	color: #fff;
	box-shadow: -2px 0 12px 0 rgba(0, 0, 0, 0.18);
	z-index: 100;
	display: flex;
	flex-direction: column;
	transition: width 0.22s cubic-bezier(0.4, 1.3, 0.6, 1);
}
.node-properties-panel.collapsed {
	width: 48px;
	min-width: 48px;
	max-width: 48px;
	cursor: pointer;
}
.node-properties-panel.disabled {
	opacity: 0.6;
	pointer-events: none;
}
.collapsed-top {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 32px;
	height: 100%;
}
.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 12px 0 20px;
	min-height: 44px;
	height: 44px;
	border-bottom: 1px solid #363a40;
	background: transparent;
	box-sizing: border-box;
	margin-top: 20px;
}
.panel-title {
	font-size: 1.08rem;
	font-weight: 600;
	color: #fff;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.collapse-btn {
	background: transparent;
	border: none;
	outline: none;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
	margin-left: 8px;
	color: #fff;
	cursor: pointer;
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
.panel-body {
	padding: 20px;
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 18px;
}
label {
	display: flex;
	flex-direction: column;
	font-size: 0.98rem;
	gap: 6px;
}
input,
select,
textarea {
	background: #181c20;
	color: #fff;
	border: 1px solid #363a40;
	border-radius: 6px;
	padding: 7px 10px;
	font-size: 1rem;
	resize: none;
	font-family: inherit;
}

/* Estilo específico para el campo del título del flujo */
.flow-title-input {
	min-height: 38px;
	resize: none;
	overflow-y: hidden;
	line-height: 1.4;
	background: #181c20 !important;
	border: 1px solid #363a40 !important;
	border-radius: 8px !important;
	padding: 10px 12px !important;
	font-size: 1rem !important;
	font-weight: 600 !important;
	color: #fff !important;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
	transition: border-color 0.2s ease, box-shadow 0.2s ease, height 0.1s ease !important;
}

.flow-title-input:focus {
	border-color: #5078ff !important;
	box-shadow: 0 0 0 2px rgba(80, 120, 255, 0.2) !important;
	outline: none !important;
}

/* Estilo específico para el campo de descripción */
.flow-description-input {
	background: #181c20 !important;
	border: 1px solid #363a40 !important;
	border-radius: 8px !important;
	padding: 10px 12px !important;
	font-size: 0.95rem !important;
	color: #fff !important;
	line-height: 1.5 !important;
	resize: none !important;
	min-height: 84px !important;
	overflow-y: hidden !important;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
	transition: border-color 0.2s ease, box-shadow 0.2s ease, height 0.1s ease !important;
}

.flow-description-input:focus {
	border-color: #5078ff !important;
	box-shadow: 0 0 0 2px rgba(80, 120, 255, 0.2) !important;
	outline: none !important;
}

/* Estilo común para textareas con auto-resize */
.auto-resize {
	transition: height 0.1s ease !important;
}
.empty-panel {
	color: #b0b0b0;
	font-size: 1.08rem;
	text-align: center;
	margin-top: 40px;
	user-select: none;
}
.project-meta {
	margin-top: 12px;
	font-size: 0.92rem;
	color: #b0b0b0;
	display: flex;
	gap: 18px;
}
.slide-panel-enter-active,
.slide-panel-leave-active {
	transition:
		opacity 0.18s,
		transform 0.18s;
}
.slide-panel-enter-from,
.slide-panel-leave-to {
	opacity: 0;
	transform: translateX(30px);
}

/* Estilos específicos para propiedades de edges */
.edge-properties {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin: 12px 0;
}

.checkbox-label {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
	margin: 0;
}

.edge-meta {
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin-top: 12px;
	padding: 8px;
	background-color: rgba(255, 255, 255, 0.05);
	border-radius: 4px;
	font-size: 12px;
	color: #999;
}

/* Estilos para el header del nodo con icono */
.node-header {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 20px;
	padding: 12px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	border-left: 3px solid #ffb84d;
}

.node-icon-display {
	width: 42px;
	height: 42px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #23272e;
	border-radius: 8px;
	font-size: 1.8rem;
	flex-shrink: 0;
}

.node-info {
	flex: 1;
	min-width: 0;
}

.node-name {
	margin: 0 0 4px 0;
	font-size: 1.1rem;
	font-weight: 600;
	color: #fff;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.node-type-label {
	display: inline-block;
	background: #363a40;
	color: #ffb84d;
	font-size: 0.75rem;
	font-weight: 600;
	border-radius: 4px;
	padding: 2px 6px;
	letter-spacing: 0.02em;
	text-transform: uppercase;
}

/* Estilos para la sección de componente externo */
.external-component-section {
	margin-top: 24px;
	padding: 16px;
	background: rgba(24, 144, 255, 0.1);
	border-radius: 8px;
	border-left: 3px solid #1890ff;
}

.section-title {
	margin: 0 0 16px 0;
	font-size: 1rem;
	font-weight: 600;
	color: #1890ff;
	display: flex;
	align-items: center;
	gap: 8px;
}

.component-info {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-top: 12px;
	padding: 8px;
	background: rgba(0, 0, 0, 0.2);
	border-radius: 4px;
	font-size: 12px;
}

.component-id {
	color: #b0b0b0;
	font-family: 'Courier New', monospace;
}

.component-status {
	font-weight: 600;
	font-size: 11px;
}

.component-status.stable {
	color: #52c41a;
}

.component-status.unknown {
	color: #999;
}
</style>
```
