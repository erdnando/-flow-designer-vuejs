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
import { validateAllRules, getValidationErrors, isFlowValid, type ValidationResult } from '../utils/nodeValidationRules';
import { useNotifications } from '../composables/useNotifications';

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

// Estado para validaciones de nodos
const validationErrors = ref<ValidationResult[]>([]);

// Sistema de notificaciones
const { showValidationError, showValidationWarning, showSuccess, showWarning, showDanger, showInfo } = useNotifications();

// Función para ejecutar validaciones y mostrar notificaciones
function runNodeValidations(showNotifications: boolean = true) {
	const errors = getValidationErrors(nodes.value, edges.value);
	validationErrors.value = errors;
	
	if (showNotifications && errors.length > 0) {
		// Agrupar errores por tipo para mostrar un resumen
		const errorSummary = errors.reduce((acc, error) => {
			acc[error.ruleId] = acc[error.ruleId] || [];
			acc[error.ruleId].push(error.message!);
			return acc;
		}, {} as Record<string, string[]>);
		
		// Mostrar una notificación por cada tipo de error
		Object.entries(errorSummary).forEach(([ruleId, messages]) => {
			const isStartRule = ruleId === 'single-start-node';
			const isEndRule = ruleId === 'single-end-node';
			
			showValidationError(
				isStartRule ? 'Múltiples nodos START detectados' : 
				isEndRule ? 'Múltiples nodos END detectados' : 
				'Error de validación',
				{
					title: 'Regla de validación violada',
					description: messages[0],
					duration: 8000,
					actions: [
						{
							label: 'Entendido',
							action: () => {},
							style: 'primary'
						}
					]
				}
			);
		});
	}
	
	return errors.length === 0;
}

// Función para verificar si se puede agregar un nodo de un tipo específico
function canAddNodeType(nodeType: string): boolean {
	// Crear un nodo temporal para la validación
	const tempNode = {
		id: 'temp-validation',
		type: nodeType,
		position: { x: 0, y: 0 },
		data: {}
	};
	
	// Crear lista temporal con el nuevo nodo
	const tempNodes = [...nodes.value, tempNode as any];
	
	// Validar reglas específicas para este tipo de nodo
	const errors = getValidationErrors(tempNodes, edges.value);
	
	// Si hay errores, mostrar notificaciones de validación
	if (errors.length > 0) {
		errors.forEach(error => {
			showValidationError('No se puede agregar el nodo', {
				title: 'Regla de validación violada',
				description: error.message!,
				duration: 6000,
				actions: [
					{
						label: 'Entendido',
						action: () => {},
						style: 'primary'
					}
				]
			});
		});
		return false;
	}
	
	return true;
}

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
		viewport
	};
	
	localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
	console.log('Flow guardado en localStorage con viewport:', viewport);
	
	// Ejecutar validaciones silenciosamente para actualizar estado
	runNodeValidations(false);
}

// Función para cargar el estado desde localStorage
function loadFromLocalStorage() {
	try {
		const savedDataString = localStorage.getItem(AUTOSAVE_KEY);
		if (!savedDataString) return;
		
		const savedData = JSON.parse(savedDataString);
		
		if (savedData.nodes && Array.isArray(savedData.nodes)) {
			nodes.value = sanitizeNodesOnLoad(savedData.nodes as ExtendedNode[]);
		}
		if (savedData.edges && Array.isArray(savedData.edges)) {
			edges.value = savedData.edges;
		}
		if (savedData.flowProps) {
			projectProperties.value = { ...projectProperties.value, ...savedData.flowProps };
		}
		if (savedData.viewport) {
			// Restaurar el viewport después de un delay para asegurar que Vue Flow esté listo
			setTimeout(() => {
				setViewport(savedData.viewport);
			}, 50);
		}
		
		console.log('Flow cargado desde localStorage:', {
			nodes: nodes.value.length,
			edges: edges.value.length,
			viewport: savedData.viewport || 'no viewport'
		});
		
		// Después de cargar, verificar validaciones y mostrar resumen si hay errores
		setTimeout(() => {
			const errors = getValidationErrors(nodes.value, edges.value);
			if (errors.length > 0) {
				// Mostrar notificación de resumen de validación
				const startErrors = errors.filter(e => e.ruleId === 'single-start-node').length;
				const endErrors = errors.filter(e => e.ruleId === 'single-end-node').length;
				
				let description = 'El flujo cargado tiene las siguientes violaciones de reglas:';
				if (startErrors > 0) description += `\n• ${startErrors > 1 ? 'Múltiples' : 'Falta'} nodo START`;
				if (endErrors > 0) description += `\n• ${endErrors > 1 ? 'Múltiples' : 'Falta'} nodo END`;
				
				showWarning('Validaciones pendientes en el flujo', {
					title: 'Flujo cargado con advertencias',
					description,
					showCloseButton: true,
					actions: [
						{
							label: 'Entendido',
							action: () => {},
							style: 'primary'
						}
					]
				});
			}
		}, 1000);
		
	} catch (err) {
		console.error('Error al cargar el flow desde localStorage:', err);
		showDanger('Error al cargar el flujo', {
			description: 'No se pudo restaurar el estado guardado. Se iniciará con un flujo vacío.',
			duration: 6000
		});
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
			
			// Ejecutar validaciones del flujo cargado
			setTimeout(() => runNodeValidations(false), 500); // Sin notificaciones al cargar
			
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
	// Crear la nueva conexión temporalmente para validar
	const newEdge = {
		id: `temp-edge-${Date.now()}`,
		source: params.source!,
		target: params.target!,
		sourceHandle: params.sourceHandle,
		targetHandle: params.targetHandle
	};
	
	// Crear lista temporal de edges con la nueva conexión
	const tempEdges = [...edges.value, newEdge];
	
	// Validar con todas las reglas de validación
	const errors = getValidationErrors(nodes.value, tempEdges);
	
	if (errors.length > 0) {
		// Mostrar todas las notificaciones de error
		errors.forEach(error => {
			let title = 'Conexión no permitida';
			let description = error.message!;
			
			// Personalizar el título según el tipo de error
			if (error.ruleId === 'no-circular-connections') {
				title = 'Conexión circular detectada';
			} else if (error.ruleId === 'valid-handler-connections') {
				title = 'Conexión de handler inválida';
			}
			
			showValidationError(title, {
				title,
				description,
				actions: [
					{
						label: 'Entendido',
						action: () => {},
						style: 'primary'
					}
				]
			});
		});
		return; // No crear la conexión
	}
	
	// Si no hay errores de validación, crear la conexión
	flowStore.addEdge(params);
	console.log('Nueva conexión creada, guardando...');
	
	triggerAutoSave();
}

function onDrop(e: DragEvent) {
	// Soporta tanto nodos estándar como personalizados
	const type = e.dataTransfer?.getData('application/node-type');
	const label = e.dataTransfer?.getData('text/plain');
	const customNodeTypeRaw = e.dataTransfer?.getData('application/custom-node-type');

	// Calcular posición antes de cualquier operación asíncrona
	const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
	const position = {
		x: e.clientX - bounds.left,
		y: e.clientY - bounds.top,
	};

	// Verificar si será el primer nodo
	const isFirstNode = nodes.value.length === 0;
	
	// Si será el primer nodo y el canvas está descentrado, centrarlo
	if (isFirstNode) {
		const currentViewport = getViewport();
		// Considerar que el canvas está descentrado si la posición está muy alejada del origen
		const isOffCenter = Math.abs(currentViewport.x) > 200 || Math.abs(currentViewport.y) > 200;
		
		if (isOffCenter) {
			console.log('Canvas descentrado detectado, centrando antes de agregar primer nodo');
			// Centrar el canvas antes de agregar el nodo
			setViewport({
				x: 0,
				y: 0,
				zoom: currentViewport.zoom // Mantener el zoom actual
			});
			// Pequeño delay para que el viewport se actualice
			setTimeout(() => {
				processNodeDrop(position, type, label, customNodeTypeRaw);
			}, 50);
			return;
		}
	}
	
	// Procesar el nodo normalmente
	processNodeDrop(position, type, label, customNodeTypeRaw);
}

function processNodeDrop(position: { x: number; y: number }, type: string | null, label: string | null, customNodeTypeRaw: string | null) {

	if (customNodeTypeRaw) {
		// Nodo personalizado: los datos vienen serializados en JSON
		try {
			const customType = JSON.parse(customNodeTypeRaw);
			const nodeType = customType.type || customType.id || customType.name || 'custom';
			
			// Validar si se puede agregar este tipo de nodo
			if (!canAddNodeType(nodeType)) {
				console.log(`No se puede agregar nodo de tipo ${nodeType} debido a reglas de validación`);
				return;
			}
			
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
			
			// Ejecutar validaciones después de agregar el nodo
			setTimeout(() => runNodeValidations(), 100);
			
			// Guardar inmediatamente después de agregar nodo personalizado
			console.log('Nodo personalizado agregado, guardando...');
			triggerAutoSave();
			return;
		} catch (err) {
			console.error('Error al parsear nodo personalizado:', err);
		}
	}
	if (type) {
		// Validar si se puede agregar este tipo de nodo
		if (!canAddNodeType(type)) {
			console.log(`No se puede agregar nodo de tipo ${type} debido a reglas de validación`);
			return;
		}
		
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
		
		// Ejecutar validaciones después de agregar el nodo
		setTimeout(() => runNodeValidations(), 100);
		
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

		// Validar si se puede cambiar a este tipo
		// Crear una lista temporal sin el nodo actual
		const tempNodesWithoutCurrent = nodes.value.filter(n => n.id !== nodeId);
		// Crear nodo temporal con el nuevo tipo
		const tempNode = {
			id: 'temp-validation',
			type: value,
			position: { x: 0, y: 0 },
			data: {}
		};
		const tempNodes = [...tempNodesWithoutCurrent, tempNode as any];
		const errors = getValidationErrors(tempNodes, edges.value);
		
		if (errors.length > 0) {
			// Mostrar error y cancelar el cambio
			errors.forEach(error => {
				showValidationError('No se puede cambiar el tipo de nodo', {
					title: 'Cambio de tipo bloqueado',
					description: error.message!,
					duration: 7000,
					actions: [
						{
							label: 'Entendido',
							action: () => {},
							style: 'primary'
						},
						{
							label: 'Ver reglas',
							action: () => {
								showInfo('Reglas de validación activas', {
									title: 'Sistema de validación',
									description: 'Las reglas actuales son: Solo un nodo START y solo un nodo END por flujo.',
									duration: 8000,
									persistent: false
								});
							},
							style: 'secondary'
						}
					]
				});
			});
			return;
		}

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
				
				// 8. Ejecutar validaciones después del cambio
				runNodeValidations();
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
		const nodeToDelete = nodes.value[nodeIndex];
		const nodeLabel = nodeToDelete.label || nodeToDelete.type || 'Nodo';
		
		nodes.value.splice(nodeIndex, 1);
		
		// Si el nodo eliminado era el seleccionado, limpiar selección
		if (selectedNodeId.value === nodeId) {
			selectedNodeId.value = null;
			selectedNode.value = null;
		}
		
		// Mostrar notificación de eliminación
		showWarning('Nodo eliminado', {
			description: `Se eliminó el nodo "${nodeLabel}" del flujo`,
			duration: 4000,
			actions: [
				{
					label: 'Deshacer',
					action: () => {
						// Restaurar el nodo eliminado
						nodes.value.splice(nodeIndex, 0, nodeToDelete);
						triggerAutoSave();
					},
					style: 'primary'
				}
			]
		});
		
		// Ejecutar validaciones después de eliminar el nodo
		setTimeout(() => runNodeValidations(false), 100); // Sin notificaciones al eliminar
		
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
	
	// Validar si se puede duplicar este tipo de nodo
	if (!canAddNodeType(nodeData.type)) {
		console.log(`No se puede duplicar nodo de tipo ${nodeData.type} debido a reglas de validación`);
		return;
	}
	
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
	try {
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
		
		showSuccess('Flujo exportado exitosamente', {
			description: `Se descargó el archivo: ${(projectProperties.value.name || 'flujo')}.json`,
			duration: 4000
		});
	} catch (error) {
		showDanger('Error al exportar el flujo', {
			description: 'No se pudo generar el archivo de exportación.',
			duration: 6000
		});
		console.error('Error al exportar flujo:', error);
	}
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
				
				showSuccess('Flujo importado exitosamente', {
					description: `Se cargaron ${data.nodes.length} nodos y ${data.edges.length} conexiones`,
					duration: 5000
				});
				
				// Ejecutar validaciones del flujo importado
				setTimeout(() => runNodeValidations(true), 500);
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
			showDanger('Error al importar el flujo', {
				description: 'El archivo seleccionado es inválido o está dañado.',
				duration: 6000,
				actions: [
					{
						label: 'Seleccionar otro archivo',
						action: () => {
							const input = document.querySelector('input[type="file"]') as HTMLInputElement;
							input?.click();
						},
						style: 'primary'
					}
				]
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
}

/* Estilos para conexiones animadas y más gruesas */
.vue-flow__edge-path {
	stroke: #5078ff !important;
	stroke-width: 3px !important;
	animation: dash 20s linear infinite;
	stroke-dasharray: 15 10;
	filter: drop-shadow(0 2px 4px rgba(80, 120, 255, 0.3));
	transition: stroke-width 0.3s ease, stroke 0.3s ease;
}

.vue-flow__edge-path:hover {
	stroke: #6b8aff !important;
	stroke-width: 4px !important;
	filter: drop-shadow(0 3px 6px rgba(80, 120, 255, 0.5));
}

.vue-flow__edge.selected .vue-flow__edge-path {
	stroke: #7c9eff !important;
	stroke-width: 4px !important;
	stroke-dasharray: 12 8;
	animation: dash 15s linear infinite;
}

/* Animación de las líneas punteadas */
@keyframes dash {
	to {
		stroke-dashoffset: -200;
	}
}

/* Estilos para las puntas de flecha */
.vue-flow__arrowhead {
	fill: #5078ff !important;
	transition: fill 0.3s ease;
}

.vue-flow__edge:hover .vue-flow__arrowhead {
	fill: #6b8aff !important;
}

.vue-flow__edge.selected .vue-flow__arrowhead {
	fill: #7c9eff !important;
}

/* Estilos para conexiones en proceso de creación */
.vue-flow__connection-path {
	stroke: #5078ff !important;
	stroke-width: 3px !important;
	stroke-dasharray: 10 5;
	animation: connection-pulse 1.5s ease-in-out infinite;
}

@keyframes connection-pulse {
	0%, 100% {
		opacity: 0.7;
		stroke-width: 3px;
	}
	50% {
		opacity: 1;
		stroke-width: 4px;
	}
}

/* Mejorar la visibilidad de los handles de conexión */
.vue-flow__handle {
	background: #5078ff !important;
	border: 2px solid #ffffff !important;
	width: 10px !important;
	height: 10px !important;
	transition: all 0.2s ease !important;
}

.vue-flow__handle:hover {
	background: #6b8aff !important;
	transform: scale(1.2) !important;
	box-shadow: 0 0 8px rgba(107, 138, 255, 0.6) !important;
}

.vue-flow__handle.connectingfrom,
.vue-flow__handle.connectingto {
	background: #7c9eff !important;
	transform: scale(1.4) !important;
	box-shadow: 0 0 12px rgba(124, 158, 255, 0.8) !important;
}
</style>
