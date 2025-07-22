<template>
	<div class="flow-canvas-wrapper" @drop="onDrop" @dragover.prevent @click="onCanvasClick">
		<!-- Botones de zoom, exportar/importar y limpiar -->
		<div :class="['actions-bar', { 'actions-bar-shifted': !panelCollapsed }]">
			<button @click.stop="zoomIn" title="Acercar">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2" />
					<path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
			</button>
			<button @click.stop="zoomOut" title="Alejar">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2" />
					<path d="M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
			</button>
			<button @click.stop="centerNodes" title="Centrar nodos">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
					<circle cx="12" cy="12" r="3" fill="currentColor" />
					<path d="M12 6v2M12 16v2M6 12h2M16 12h2" stroke="currentColor" stroke-width="1" />
				</svg>
			</button>
			<button @click.stop="exportFlow" title="Exportar flujo">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path
						d="M12 3v12m0 0l-4-4m4 4l4-4"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<rect x="4" y="17" width="16" height="4" rx="2" fill="currentColor" />
				</svg>
			</button>
			<label class="import-label" title="Importar flujo" @click.stop>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path
						d="M12 21V9m0 0l-4 4m4-4l4 4"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<rect x="4" y="3" width="16" height="4" rx="2" fill="currentColor" />
				</svg>
				<input type="file" accept="application/json" @change="importFlow" style="display: none" />
			</label>
			<button @click.stop="clearFlow" title="Limpiar flujo">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2" />
					<path
						d="M8 8l8 8M16 8l-8 8"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>
		<!-- Animación de nodos con transition-group -->
		<VueFlow
			v-model:nodes="nodes"
			v-model:edges="edges"
			:fit-view="true"
			:min-zoom="0.2"
			:max-zoom="2"
			:zoom-on-scroll="true"
			:zoom-on-double-click="true"
			:pan-on-drag="true"
			class="custom-vue-flow"
			@connect="onConnect"
			:node-types="nodeTypes"
			style="width: 100%; height: 100%; min-height: 0; min-width: 0"
			@node-contextmenu="onNodeContextMenu"
			@contextmenu="onVueFlowContextMenu"
			@node-click="onNodeClick"
			@node-drag-stop="onNodeDragStop"
			@node-delete="onNodeDelete"
			@node-copy="onNodeCopy"
			@node-duplicate="onNodeDuplicate"
			@node-menu="onNodeMenu"
		>
			<Background :pattern-color="'#222'" :gap="20" />
			<MiniMap :class="['minimap-absolute', { 'minimap-shifted': !panelCollapsed }]" />
		</VueFlow>
		<ContextMenu
			:visible="contextMenu.visible"
			:x="contextMenu.x"
			:y="contextMenu.y"
			:items="contextMenu.items"
			@close="closeContextMenu"
		/>
		<Transition persisted name="slide-panel">
			<NodePropertiesPanel
				:key="selectedNode?.id || (showingProjectProps ? 'project' : 'none')"
				:node="selectedNode"
				:collapsed="panelCollapsed"
				:disabled="!selectedNode && !showingProjectProps"
				:showProject="showingProjectProps"
				:projectProps="projectProperties"
				@close="selectedNodeId = null"
				@update="updateNodeProperty"
				@toggle-collapsed="panelCollapsed = $event"
				@update-project="updateProjectProperties"
			/>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import { storeToRefs } from 'pinia';
import { useFlowStore } from '../stores/flow';
import ContextMenu from './ContextMenu.vue';
import NodePropertiesPanel from './NodePropertiesPanel.vue';
import { reactive, markRaw, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type { Connection, Node, NodeTypesObject } from '@vue-flow/core';
import CustomNode from './CustomNode.vue';
import MinimalNode from './MinimalNode.vue';
import ConditionNode from './ConditionNode.vue';
import StartNode from './StartNode.vue';
import EndNode from './EndNode.vue';
import { nodeTypeMeta } from '../utils/nodeTypeMeta';
import { ElMessageBox } from 'element-plus';

// Extender el tipo Node para incluir la propiedad selected opcional
interface ExtendedNode extends Node {
	selected?: boolean;
}

const flowStore = useFlowStore();
const { nodes, edges } = storeToRefs(flowStore);

// Auto-guardar en localStorage
const AUTOSAVE_KEY = 'n8n_standalone_flow_data';
const AUTOSAVE_DELAY_MS = 1000; // 1 segundo
let autoSaveTimer: number | null = null;

// Control para centrado automático
let autoCenterApplied = false;

// Función para verificar si hay viewport guardado
function hasSavedViewport(): boolean {
	try {
		const savedData = localStorage.getItem(AUTOSAVE_KEY);
		if (savedData) {
			const data = JSON.parse(savedData);
			return !!(data.viewport);
		}
	} catch (err) {
		console.error('Error al verificar viewport guardado:', err);
	}
	return false;
}

// Implementación directa del auto-guardado
function setupAutoSave() {
	console.log('Auto-guardado configurado para eventos manuales y cambios de viewport');
	
	// Observar cambios en el viewport (zoom y posición) 
	let lastViewport: any = null;
	const checkViewportChanges = () => {
		const currentViewport = getViewport();
		if (lastViewport && 
			(Math.abs(currentViewport.zoom - lastViewport.zoom) > 0.01 || 
			 Math.abs(currentViewport.x - lastViewport.x) > 5 || 
			 Math.abs(currentViewport.y - lastViewport.y) > 5)) {
			console.log('Viewport cambió, guardando...');
			triggerAutoSave();
		}
		lastViewport = { ...currentViewport };
	};
	
	// Verificar cambios en el viewport cada 500ms
	setInterval(checkViewportChanges, 500);
}

// Función auxiliar para programar el guardado con debounce
function triggerAutoSave() {
	if (autoSaveTimer !== null) {
		clearTimeout(autoSaveTimer);
	}
	autoSaveTimer = window.setTimeout(saveToLocalStorage, AUTOSAVE_DELAY_MS);
}

// Función para guardar el estado actual en localStorage
function saveToLocalStorage() {
	// Obtener el estado actual del viewport (zoom y posición)
	const viewport = getViewport();
	
	const dataToSave = {
		nodes: sanitizeNodesForSave(nodes.value as ExtendedNode[]),
		edges: edges.value,
		flowProps: projectProperties.value,
		viewport: viewport // Guardar zoom y posición del canvas
	};
	try {
		localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
		console.log('Estado del flujo guardado automáticamente');
		console.log('Nodos guardados:', dataToSave.nodes.length);
		console.log('Zoom guardado:', viewport.zoom.toFixed(2));
		console.log('Posiciones guardadas:', dataToSave.nodes.map(n => ({ id: n.id, x: n.position.x, y: n.position.y })));
	} catch (err) {
		console.error('Error al guardar el estado en localStorage:', err);
	}
}

// Función para cargar el estado desde localStorage
function loadFromLocalStorage() {
	try {
		const savedData = localStorage.getItem(AUTOSAVE_KEY);
		if (savedData) {
			const data = JSON.parse(savedData);
			console.log('Cargando datos desde localStorage:', data);
			if (data.nodes) {
				console.log('Nodos a cargar:', data.nodes.length);
				console.log('Posiciones a cargar:', data.nodes.map((n: any) => ({ id: n.id, x: n.position?.x, y: n.position?.y })));
				nodes.value = sanitizeNodesOnLoad(data.nodes as ExtendedNode[]);
			}
			if (data.edges) edges.value = data.edges;
			if (data.flowProps)
				projectProperties.value = { ...projectProperties.value, ...data.flowProps };
			
			// Restaurar viewport (zoom y posición) si existe
			if (data.viewport) {
				console.log('Restaurando zoom:', data.viewport.zoom.toFixed(2));
				console.log('Restaurando posición del canvas:', data.viewport.x.toFixed(0), data.viewport.y.toFixed(0));
				
				// Aplicar el viewport después de un pequeño delay para asegurar que Vue Flow esté listo
				setTimeout(() => {
					setViewport(data.viewport);
				}, 50);
			}
		} else {
			console.log('No hay datos guardados en localStorage');
		}
	} catch (err) {
		console.error('Error al cargar el estado desde localStorage:', err);
	}
}

// Configurar el ciclo de vida
onMounted(() => {
	loadFromLocalStorage();
	setupAutoSave();
	
	// Esperar múltiples ciclos para asegurar que Vue Flow esté completamente inicializado
	setTimeout(() => {
		const hasViewport = hasSavedViewport();
		
		if (nodes.value.length > 0 && !autoCenterApplied) {
			console.log(`Primera carga detectada, aplicando centrado automático para ${nodes.value.length} nodos...`);
			autoCenterApplied = true;
			
			if (hasViewport) {
				// Si hay viewport guardado, usar centrado manual preservando el zoom
				const savedData = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || '{}');
				const savedViewport = savedData.viewport;
				
				if (savedViewport && savedViewport.zoom) {
					console.log(`Aplicando centrado automático con zoom guardado: ${savedViewport.zoom}`);
					
					// Aplicar el viewport guardado primero
					setViewport(savedViewport);
					
					// Luego centrar manualmente manteniendo el zoom
					setTimeout(() => {
						centerNodes(true); // Esto ahora usará el zoom guardado
					}, 100);
				} else {
					// Si no hay zoom guardado, centrar normalmente con fitView
					fitView({ 
						padding: 50,
						includeHiddenNodes: true,
						minZoom: 0.2,
						maxZoom: 1.5,
						duration: 600
					});
				}
			} else {
				// Si no hay viewport guardado, centrar normalmente con fitView
				fitView({ 
					padding: 50,
					includeHiddenNodes: true,
					minZoom: 0.2,
					maxZoom: 1.5,
					duration: 600
				});
			}
		} else if (nodes.value.length === 0 && !hasViewport) {
			// Si no hay nodos ni viewport guardado, aplicar zoom inicial menor
			vueFlowZoomOut();
			vueFlowZoomOut();
		}
	}, 250); // Aumentar el delay para dar más tiempo a Vue Flow y al viewport
});

onBeforeUnmount(() => {
	if (autoSaveTimer !== null) {
		clearTimeout(autoSaveTimer);
	}
});

// Usar los componentes directamente y forzar el tipado para evitar el error TS2322
const nodeTypes = {
	default: markRaw(CustomNode),
	error: markRaw(CustomNode),
	minimal: markRaw(MinimalNode),
	start: markRaw(StartNode),
	end: markRaw(EndNode),
	// Primero el spread, luego sobrescribes condition:
	...Object.fromEntries(Object.keys(nodeTypeMeta).map((type) => [type, markRaw(CustomNode)])),
	condition: markRaw(ConditionNode), // Esto asegura que 'condition' SIEMPRE sea diamante
	// Asegurar que start y end usen sus componentes específicos
	start: markRaw(StartNode),
	end: markRaw(EndNode),
} as unknown as NodeTypesObject;

// Usa useVueFlow para zoom seguro y tipado
const { zoomIn: vueFlowZoomIn, zoomOut: vueFlowZoomOut, fitView, getViewport, setViewport } = useVueFlow();

function zoomIn() {
	vueFlowZoomIn();
	// Guardar el nuevo nivel de zoom después de un pequeño delay
	setTimeout(() => triggerAutoSave(), 100);
}
function zoomOut() {
	vueFlowZoomOut();
	// Guardar el nuevo nivel de zoom después de un pequeño delay
	setTimeout(() => triggerAutoSave(), 100);
}

function centerNodes(isAutomatic = false) {
	if (nodes.value.length === 0) return;
	
	const currentViewport = getViewport();
	const currentZoom = currentViewport.zoom;
	
	if (isAutomatic && currentZoom > 0.3) {
		// Si es centrado automático y ya hay un zoom significativo (viewport restaurado),
		// centrar manualmente manteniendo el zoom
		console.log('Centrado automático con zoom existente:', currentZoom);
		
		// Calcular el bounding box de todos los nodos
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		
		nodes.value.forEach(node => {
			const x = node.position.x;
			const y = node.position.y;
			const nodeWidth = 200;
			const nodeHeight = 80;
			
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x + nodeWidth);
			maxY = Math.max(maxY, y + nodeHeight);
		});
		
		// Calcular el centro de los nodos
		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;
		
		// Obtener el tamaño del canvas
		const canvasElement = document.querySelector('.custom-vue-flow') as HTMLElement;
		if (!canvasElement) return;
		
		const canvasWidth = canvasElement.clientWidth;
		const canvasHeight = canvasElement.clientHeight;
		
		// Calcular la posición del viewport para centrar los nodos
		const viewportX = (canvasWidth / 2) - (centerX * currentZoom);
		const viewportY = (canvasHeight / 2) - (centerY * currentZoom);
		
		// Aplicar la nueva posición manteniendo el zoom actual
		setViewport({
			x: viewportX,
			y: viewportY,
			zoom: currentZoom
		});
		
		console.log('Centrado automático aplicado manteniendo zoom:', currentZoom);
		
	} else if (isAutomatic) {
		// Para centrado automático sin zoom previo, usar fitView
		console.log('Centrado automático con ajuste de zoom');
		fitView({ 
			padding: 50,
			includeHiddenNodes: true,
			minZoom: 0.2,
			maxZoom: 1.5,
			duration: 600
		});
	} else {
		// Para centrado manual, detectar si el zoom es muy alto y ajustarlo si es necesario
		console.log('Zoom actual antes del centrado:', currentZoom);
		
		// Si el zoom es muy alto (mayor a 1.2), usar fitView para ajustar automáticamente
		if (currentZoom > 1.2) {
			console.log('Zoom muy alto detectado, ajustando para mostrar todos los nodos');
			fitView({ 
				padding: 50,
				includeHiddenNodes: true,
				minZoom: 0.3,
				maxZoom: 1.2, // Limitar el zoom máximo para que no sea excesivo
				duration: 800
			});
		} else {
			// Para zoom normal o bajo, mantener el zoom actual como antes
			// Calcular el bounding box de todos los nodos
			let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
			
			nodes.value.forEach(node => {
				const x = node.position.x;
				const y = node.position.y;
				const nodeWidth = 200;
				const nodeHeight = 80;
				
				minX = Math.min(minX, x);
				minY = Math.min(minY, y);
				maxX = Math.max(maxX, x + nodeWidth);
				maxY = Math.max(maxY, y + nodeHeight);
			});
			
			// Calcular el centro de los nodos
			const centerX = (minX + maxX) / 2;
			const centerY = (minY + maxY) / 2;
			
			// Obtener el tamaño del canvas
			const canvasElement = document.querySelector('.custom-vue-flow') as HTMLElement;
			if (!canvasElement) {
				console.log('No se encontró el elemento canvas');
				return;
			}
			
			const canvasWidth = canvasElement.clientWidth;
			const canvasHeight = canvasElement.clientHeight;
			
			// Calcular la posición del viewport para centrar los nodos
			const viewportX = (canvasWidth / 2) - (centerX * currentZoom);
			const viewportY = (canvasHeight / 2) - (centerY * currentZoom);
			
			console.log('Aplicando centrado manual:');
			console.log('- Centro de nodos:', centerX, centerY);
			console.log('- Tamaño canvas:', canvasWidth, canvasHeight);
			console.log('- Nueva posición viewport:', viewportX, viewportY);
			console.log('- Zoom a mantener:', currentZoom);
			
			// Aplicar la nueva posición manteniendo el zoom actual
			setViewport({
				x: viewportX,
				y: viewportY,
				zoom: currentZoom
			});
			
			// Verificar que el zoom se mantuvo
			setTimeout(() => {
				const newViewport = getViewport();
				console.log('Zoom después del centrado:', newViewport.zoom);
				if (Math.abs(newViewport.zoom - currentZoom) > 0.001) {
					console.warn('El zoom cambió inesperadamente, forzando de vuelta al original');
					setViewport({
						x: newViewport.x,
						y: newViewport.y,
						zoom: currentZoom
					});
				}
			}, 50);
		}
	}
	
	// Guardar el estado después de centrar
	setTimeout(() => {
		if (isAutomatic) {
			console.log('Centrado automático aplicado y posiciones guardadas');
		} else {
			console.log('Centrado manual aplicado, guardando posiciones...');
		}
		triggerAutoSave();
	}, isAutomatic ? 700 : 200);
}

// ---
// Agrega las funciones faltantes para el template
function clearFlow() {
	ElMessageBox.confirm(
		'¿Estás seguro de que deseas limpiar el flujo? Esta acción eliminará todos los nodos y conexiones.',
		'Confirmar limpieza',
		{
			confirmButtonText: 'Sí, limpiar',
			cancelButtonText: 'Cancelar',
			type: 'warning',
		},
	).then(() => {
		// Limpiar nodos y edges
		nodes.value = [];
		edges.value = [];

		// Limpiar selección y mostrar propiedades del proyecto
		selectedNodeId.value = null;
		selectedNode.value = null;
		showingProjectProps.value = true;

		// También limpiar localStorage
		localStorage.removeItem(AUTOSAVE_KEY);

		// Reiniciar propiedades del proyecto a valores predeterminados
		projectProperties.value = {
			name: 'Mi Flujo',
			description: 'Descripción del flujo',
			status: 'Activo',
			owner: 'Usuario',
			createdAt: new Date().toLocaleDateString(),
			updatedAt: new Date().toLocaleDateString(),
		};

		// Guardar los cambios en localStorage
		saveToLocalStorage();
	});
}

// ---

function onConnect(params: Connection) {
	flowStore.addEdge(params);
	console.log('Nueva conexión creada, guardando...');
	triggerAutoSave();
}

function onDrop(e: DragEvent) {
	// Soporta tanto nodos estándar como personalizados
	const type = e.dataTransfer?.getData('application/node-type');
	const label = e.dataTransfer?.getData('text/plain');
	const customNodeTypeRaw = e.dataTransfer?.getData('application/custom-node-type');

	const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
	const position = {
		x: e.clientX - bounds.left,
		y: e.clientY - bounds.top,
	};

	if (customNodeTypeRaw) {
		// Nodo personalizado: los datos vienen serializados en JSON
		try {
			const customType = JSON.parse(customNodeTypeRaw);
			const nodeType = customType.type || customType.id || customType.name || 'custom';
			const nodeLabel = customType.name || nodeType;
			flowStore.addNode({
				type: nodeType,
				label: nodeLabel, // Usar el nombre del tipo personalizado
				position,
				data: {
					...customType,
					isCustom: true,
					type: nodeType,
					customTypeId: nodeType,
					label: nodeLabel, // Forzar label en data
					subtitle: customType.subtitle || '', // Usar el subtítulo si existe, o cadena vacía
				},
			});
			const lastNode = nodes.value[nodes.value.length - 1];
			selectedNodeId.value = lastNode.id;
			showingProjectProps.value = false;
			if (panelCollapsed.value) {
				panelCollapsed.value = false;
			}
			// Guardar inmediatamente después de agregar nodo personalizado
			console.log('Nodo personalizado agregado, guardando...');
			triggerAutoSave();
			return;
		} catch (err) {
			console.error('Error al parsear nodo personalizado:', err);
		}
	}
	if (type) {
		// Si el tipo es 'default', usa el label del drag (nombre mostrado en el panel)
		let nodeLabel = label || type;
		flowStore.addNode({
			type: type,
			label: nodeLabel,
			position,
			data: {
				label: nodeLabel, // Forzar label en data
				type: type, // Forzar el tipo en data para que se muestre el badge
				subtitle: '', // Forzar un subtítulo vacío para que se muestre el indicador de error
			},
		});
		const lastNode = nodes.value[nodes.value.length - 1];
		selectedNodeId.value = lastNode.id;
		showingProjectProps.value = false;
		if (panelCollapsed.value) {
			panelCollapsed.value = false;
		}
		// Guardar inmediatamente después de agregar nodo estándar
		console.log('Nodo estándar agregado, guardando...');
		triggerAutoSave();
	}
}

// Context menu logic
const contextMenu = reactive({
	visible: false,
	x: 0,
	y: 0,
	items: [] as { label: string; action: () => void }[],
});

function closeContextMenu() {
	contextMenu.visible = false;
}

function onVueFlowContextMenu(e: MouseEvent) {
	// Deshabilitar menú contextual completamente
	e.preventDefault();
	return;
}

// Reemplazar computed selectedNode por ref y watchers
const selectedNodeId = ref<string | null>(null);
const selectedNode = ref<Node | null>(null);

// Sincronizar selectedNode cuando cambia el ID usando nuestra función optimizada
watch(selectedNodeId, () => {
	updateSelectedNodeFromList();
});

// Observar cambios en nodes para actualizar selectedNode solo cuando sea necesario
watch(
	nodes,
	() => {
		// Solo actualizar si hay un nodo seleccionado
		if (selectedNodeId.value) {
			updateSelectedNodeFromList();
		}
	},
	{ deep: false },
);

// Evitar observar los nodos directamente para prevenir ciclos
// En su lugar, usamos un método imperativo para actualizar selectedNode cuando sea necesario
function updateSelectedNodeFromList() {
	// Solo hacer algo si hay un ID seleccionado
	if (!selectedNodeId.value) {
		selectedNode.value = null;
		return;
	}

	// Buscar el nodo en la lista actual
	const updatedNode = nodes.value.find((n) => n.id === selectedNodeId.value) || null;

	// Si el nodo ya no existe, deseleccionar
	if (!updatedNode) {
		selectedNode.value = null;
		return;
	}

	// Evitar actualización si es la misma referencia
	if (selectedNode.value === updatedNode) return;

	// Actualizar el nodo seleccionado (referencia completa)
	selectedNode.value = updatedNode;
}

// Observar cambios en nodes para actualizar selectedNode solo cuando sea necesario
watch(
	nodes,
	() => {
		// Solo actualizar si hay un nodo seleccionado
		if (selectedNodeId.value) {
			updateSelectedNodeFromList();
		}
	},
	{ deep: false },
);

const panelCollapsed = ref(true);

// Estado para propiedades del proyecto
const projectProperties = ref({
	name: 'Mi Flujo',
	description: 'Descripción del flujo',
	status: 'Activo',
	owner: 'Usuario',
	createdAt: new Date().toLocaleDateString(),
	updatedAt: new Date().toLocaleDateString(),
});
const showingProjectProps = ref(false);

// Detectar selección de nodo (click) de forma optimizada
function onNodeClick({ node }: { node: Node }) {
	// Evitar la actualización si ya es el mismo nodo seleccionado
	if (selectedNodeId.value === node.id) {
		return;
	}

	// Actualizar en orden específico para minimizar renders
	showingProjectProps.value = false;
	selectedNodeId.value = node.id;

	// Solo expandir el panel si está colapsado
	if (panelCollapsed.value) {
		panelCollapsed.value = false;
	}
}

// Detectar cuando termina el arrastre de un nodo para guardar automáticamente
function onNodeDragStop(event: any) {
	console.log('Nodo movido, guardando posición...', event);
	console.log('Posiciones actuales de todos los nodos:', nodes.value.map(n => ({ id: n.id, x: n.position.x, y: n.position.y })));
	triggerAutoSave();
}

// Click normal en el fondo del designer
function onCanvasClick(e: MouseEvent) {
	const target = e.target as HTMLElement;
	// Si el click fue sobre el fondo (no sobre un nodo ni sobre el panel de propiedades)
	if (!target.closest('.vue-flow__node') && !target.closest('.node-properties-panel')) {
		selectedNodeId.value = null;
		showingProjectProps.value = true;
		if (panelCollapsed.value) {
			panelCollapsed.value = false;
		}
		contextMenu.visible = false;
		// Deseleccionar todos los nodos en el store
		nodes.value = (nodes.value as ExtendedNode[]).map((n) => ({ ...n, selected: false }));
	}
}

// Actualizar propiedades del proyecto de forma controlada
function updateProjectProperties(val: any) {
	if (!val) return;

	// Evitar mutaciones directas actualizando solo propiedades específicas
	if (val.name !== undefined) projectProperties.value.name = val.name;
	if (val.description !== undefined) projectProperties.value.description = val.description;
	if (val.status !== undefined) projectProperties.value.status = val.status;
	if (val.owner !== undefined) projectProperties.value.owner = val.owner;
	if (val.createdAt !== undefined) projectProperties.value.createdAt = val.createdAt;
	if (val.updatedAt !== undefined) projectProperties.value.updatedAt = val.updatedAt;
}

// Actualizar propiedades del nodo desde el panel
function updateNodeProperty({ key, value }: { key: string; value: string }) {
	if (!selectedNode.value || !selectedNode.value.id) return;

	const nodeId = selectedNode.value.id;
	const nodeIndex = nodes.value.findIndex((n) => n.id === nodeId);

	if (nodeIndex === -1) return;

	console.log(`Actualizando propiedad ${key} a "${value}" en nodo ${nodeId}`);

	// Obtenemos el nodo actual
	const currentNode = nodes.value[nodeIndex];

	// Para cambios de tipo, forzamos la recreación completa del nodo para garantizar
	// que Vue Flow vuelva a renderizar el componente con el nuevo tipo
	if (key === 'type') {
		console.log(`Cambiando tipo de nodo de ${currentNode.type} a ${value}`);

		// 1. Guardar toda la información del nodo actual
		const savedPosition = { ...currentNode.position };
		const savedId = currentNode.id;
		const savedLabel = currentNode.label;
		const savedData = { ...(currentNode.data || {}) };

		// Actualizamos el tipo en los datos guardados
		savedData.type = value;

		// Actualizar el subtítulo si es necesario
		if (nodeTypeMeta[value] && (!savedData.subtitle || savedData.subtitle === '')) {
			savedData.subtitle = nodeTypeMeta[value]?.subtitle || '';
		}

		// 2. Crear un nuevo nodo con toda la información pero con el tipo actualizado
		const newNode = {
			id: savedId,
			position: savedPosition,
			type: value,
			label: savedLabel,
			data: savedData,
		};

		// 3. Eliminar el nodo anterior
		nodes.value.splice(nodeIndex, 1);

		// 4. Limpiar la selección para evitar referencias obsoletas
		selectedNode.value = null;
		selectedNodeId.value = null;

		// 5. Esperar a que Vue termine de procesar la eliminación
		setTimeout(() => {
			// 6. Insertar el nodo nuevo
			nodes.value.push(newNode);

			// 7. Reseleccionar el nodo después de un corto tiempo para asegurar que Vue Flow lo ha renderizado
			setTimeout(() => {
				selectedNodeId.value = savedId;
				updateSelectedNodeFromList();
				console.log('Nodo recreado con nuevo tipo:', newNode);
			}, 50);
		}, 50);

		return;
	}

	// Para propiedades que no son el tipo (label y subtitle)
	// Creamos una copia del nodo para trabajar
	const nodeCopy = { ...currentNode };

	// Aseguramos que data existe
	if (!nodeCopy.data) {
		nodeCopy.data = {};
	}

	// Actualizamos según la propiedad
	if (key === 'label') {
		nodeCopy.label = value;
		nodeCopy.data.label = value;

		// Actualizamos directamente en el array
		nodes.value.splice(nodeIndex, 1, nodeCopy);

		// Actualizamos el nodo seleccionado
		selectedNode.value = nodeCopy;
	} else if (key === 'subtitle') {
		nodeCopy.data.subtitle = value;

		// Actualizamos directamente en el array
		nodes.value.splice(nodeIndex, 1, nodeCopy);

		// Actualizamos el nodo seleccionado
		selectedNode.value = nodeCopy;
	}
}

function onNodeContextMenu({ event, node }: { event: MouseEvent; node: Node }) {
	// Deshabilitar el menú contextual - ahora usamos toolbar en cada nodo
	event.preventDefault();
	event.stopPropagation();
	
	// No mostrar el menú contextual
	return;
}

// Funciones para manejar eventos de la toolbar
function onNodeDelete(nodeId: string) {
	console.log('Eliminando nodo:', nodeId);
	const nodeIndex = nodes.value.findIndex((n) => n.id === nodeId);
	if (nodeIndex !== -1) {
		nodes.value.splice(nodeIndex, 1);
		// Si el nodo eliminado era el seleccionado, limpiar selección
		if (selectedNodeId.value === nodeId) {
			selectedNodeId.value = null;
			selectedNode.value = null;
		}
		triggerAutoSave();
	}
}

function onNodeCopy(nodeData: any) {
	console.log('Copiando nodo:', nodeData);
	// Implementar funcionalidad de copiar al clipboard si es necesario
	try {
		const text = nodeData.label || nodeData.type || 'nodo';
		navigator.clipboard.writeText(text);
	} catch (error) {
		console.log('No se pudo copiar al clipboard');
	}
}

function onNodeDuplicate(nodeData: any) {
	console.log('Duplicando nodo:', nodeData);
	const newId = (nodes.value.length + 1).toString();
	const newNode = {
		id: newId,
		type: nodeData.type,
		label: nodeData.label,
		data: { ...nodeData.data },
		position: { 
			x: (nodeData.position?.x || 0) + 50, 
			y: (nodeData.position?.y || 0) + 50 
		},
	};
	nodes.value.push(newNode);
	triggerAutoSave();
}

function onNodeMenu(event: MouseEvent, node: any) {
	console.log('Menú del nodo:', node);
	// Por ahora solo prevenir el comportamiento por defecto
	// La funcionalidad del menú se puede implementar después
}

// Exportar flujo a JSON
function exportFlow() {
	const data = {
		nodes: nodes.value,
		edges: edges.value,
		flowProps: projectProperties.value,
	};
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = (projectProperties.value.name || 'flujo') + '.json';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

// Importar flujo desde JSON
function importFlow(e: Event) {
	const input = e.target as HTMLInputElement;
	if (!input.files || !input.files[0]) return;
	const file = input.files[0];
	const reader = new FileReader();
	reader.onload = (ev) => {
		try {
			const data = JSON.parse(ev.target?.result as string);
			if (data.nodes && data.edges) {
				nodes.value = data.nodes;
				edges.value = data.edges;
			}
			if (data.flowProps) {
				if (data.flowProps.name) {
					projectProperties.value.name = data.flowProps.name;
				}
				if (data.flowProps.description) {
					projectProperties.value.description = data.flowProps.description;
				}
				if (data.flowProps.status) {
					projectProperties.value.status = data.flowProps.status;
				}
				if (data.flowProps.owner) {
					projectProperties.value.owner = data.flowProps.owner;
				}
				if (data.flowProps.createdAt) {
					projectProperties.value.createdAt = data.flowProps.createdAt;
				}
				if (data.flowProps.updatedAt) {
					projectProperties.value.updatedAt = data.flowProps.updatedAt;
				}
			}
		} catch (err) {
			ElMessageBox.alert('Error al importar el flujo. Archivo inválido o dañado.', 'Error', {
				type: 'error',
			});
			console.error('Error al importar flujo:', err);
		}
	};
	reader.readAsText(file);
}

// --- SANITIZAR SELECCIÓN ANTES DE GUARDAR ---
function sanitizeNodesForSave(nodes: ExtendedNode[]) {
	return nodes.map((n: ExtendedNode) => {
		const { selected, ...rest } = n;
		return rest;
	});
}

// --- SANITIZAR SELECCIÓN AL CARGAR ---
function sanitizeNodesOnLoad(nodes: ExtendedNode[]) {
	// Si hay varios con selected, solo deja el último (o ninguno)
	let lastSelectedIdx = -1;
	nodes.forEach((n: ExtendedNode, i: number) => {
		if (n.selected) lastSelectedIdx = i;
	});
	return nodes.map((n: ExtendedNode, i: number) => ({ ...n, selected: i === lastSelectedIdx }));
}
</script>

<style scoped>
.flow-canvas-wrapper {
	flex: 1;
	background: #181c20;
	border: none;
	border-radius: 0;
	margin: 0;
	padding: 0;
	position: relative;
	width: 100%;
	height: 100%;
	min-width: 0;
	min-height: 0;
	max-width: 100vw;
	max-height: 100vh;
	overflow: hidden;
	display: flex;
	cursor: url('https://cdn.jsdelivr.net/gh/rdnando/cursors@main/material-hand.cur'), grab;
}
.custom-vue-flow {
	width: 100%;
	height: 100%;
	background: transparent;
	background-color: #2e3136;
	background-image: radial-gradient(circle, #44474d 1px, transparent 1px);
	background-size: 20px 20px;
	background-position: 0 0;
	overflow: visible;
	cursor: url('https://cdn.jsdelivr.net/gh/rdnando/cursors@main/material-hand.cur'), grab;
}
.vue-flow__node {
	pointer-events: auto !important;
	cursor: url('https://cdn.jsdelivr.net/gh/rdnando/cursors@main/material-pointer.cur'), pointer;
	transition:
		box-shadow 0.18s,
		transform 0.35s cubic-bezier(0.4, 0.8, 0.4, 1),
		opacity 0.25s;
	will-change: transform, opacity;
}
.vue-flow__node-leave-active {
	opacity: 0;
	transform: scale(0.85);
	transition:
		opacity 0.25s,
		transform 0.25s;
}
.vue-flow__node-enter-active {
	opacity: 0;
	transform: scale(1.15);
	animation: node-pop-in 0.22s cubic-bezier(0.4, 1.3, 0.6, 1);
}
@keyframes node-pop-in {
	0% {
		opacity: 0;
		transform: scale(1.15);
	}
	100% {
		opacity: 1;
		transform: scale(1);
	}
}
.vue-flow__node:hover {
	box-shadow: 0 2px 12px 0 rgba(80, 120, 255, 0.18);
	cursor: pointer;
}
.vue-flow__node:active {
	cursor: url('https://cdn.jsdelivr.net/gh/rdnando/cursors@main/material-grabbing.cur'), grabbing;
}
.minimap-absolute {
	position: absolute !important;
	bottom: 24px;
	right: 24px;
	z-index: 3000;
	background: rgba(35, 39, 46, 0.92);
	border-radius: 10px;
	box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.18);
	padding: 6px 6px 2px 6px;
	pointer-events: auto;
	transition: right 0.22s cubic-bezier(0.4, 1.3, 0.6, 1);
}
.minimap-shifted {
	right: 344px !important;
}
.actions-bar {
	position: absolute;
	top: 18px;
	right: 60px;
	z-index: 4000;
	display: flex;
	gap: 10px;
	transition: right 0.22s cubic-bezier(0.4, 1.3, 0.6, 1);
}
.actions-bar-shifted {
	right: 380px !important;
}
.actions-bar button,
.actions-bar .import-label {
	background: #23272e;
	color: #fff;
	border: none;
	border-radius: 6px;
	padding: 0;
	margin: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 40px;
	width: 40px;
	font-size: 15px;
	cursor: pointer;
	transition: background 0.2s;
	box-sizing: border-box;
}
.actions-bar button:hover,
.actions-bar .import-label:hover {
	background: #444b55;
}
.actions-bar svg {
	display: block;
	margin: 0;
	color: #fff;
	width: 22px;
	height: 22px;
	padding: 0;
}
</style>
<style>
/* Forzar fondo transparente en nodos Vue Flow para evitar fondo blanco detrás de nodos personalizados */
.vue-flow__node-default {
	background: transparent !important;
	box-shadow: none !important;
	border: none !important;
}
.vue-flow__nodes {
	pointer-events: all !important;
}
.vue-flow__node {
	pointer-events: auto !important;
}
.vue-flow__handle {
	pointer-events: auto !important;
	z-index: 1;
}
</style>
