<template>
	<div class="flow-canvas-wrapper" @drop="onDrop" @dragover.prevent @click="onCanvasClick">
		<!-- Botones para test y publicación -->
		<div :class="['actions-bar', { 'actions-bar-shifted': !panelCollapsed }]">
			<button @click.stop="testFlow" title="Ejecutar test del flujo" class="text-button test-button">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
					<path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				<span>Probar</span>
			</button>
			<button @click.stop="publishFlow" title="Publicar flujo" class="text-button publish-button">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
					<path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
					<path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				<span>Publicar</span>
			</button>
			<button @click.stop="clearFlow" title="Limpiar flujo" class="text-button clear-button">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2" />
					<path
						d="M8 8l8 8M16 8l-8 8"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
				<span>Limpiar</span>
			</button>
		</div>
		
		<!-- Título del flujo con dropdown de versiones -->
		<div 
			:class="['flow-title-label', { 'flow-title-collapsed': panelCollapsed }]"
			:title="flowTitle && flowTitle.length > 44 ? flowTitle : ''"
		>
			<span style="color: #fff; font-weight: 600; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
				{{ flowTitle && flowTitle.length > 44 ? flowTitle.substring(0, 44) + '...' : flowTitle }}
			</span>
			<!-- Dropdown de versiones -->
			<div class="version-dropdown-title" title="Seleccionar versión del flujo">
				<select v-model="selectedVersion" @change="onVersionChange" class="version-select-title">
					<option v-for="version in flowVersions" :key="version.value" :value="version.value">
						{{ version.label }}
					</option>
				</select>
				<svg width="10" height="10" viewBox="0 0 24 24" fill="none" class="dropdown-arrow-title">
					<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
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
			:edges-selectable="true"
			:default-edge-options="{ animated: true, type: 'deletable', selectable: true, focusable: true, deletable: true }"
			class="custom-vue-flow"
			@connect="onConnect"
			:node-types="nodeTypes"
			:edge-types="edgeTypes"
			style="width: 100%; height: 100%; min-height: 0; min-width: 0"
			@node-contextmenu="onNodeContextMenu"
			@contextmenu="onVueFlowContextMenu"
			@node-click="onNodeClick"
			@node-drag-stop="onNodeDragStop"
			@node-delete="onNodeDelete"
			@node-copy="onNodeCopy"
			@node-duplicate="onNodeDuplicate"
			@node-menu="onNodeMenu"
			@edge-click="onEdgeClick"
			@edge-contextmenu="onEdgeContextMenu"
			@edge-mouseenter="onEdgeMouseEnter"
			@edge-mouseleave="onEdgeMouseLeave"
		>
			<Background :pattern-color="'#222'" :gap="20" />
			<MiniMap :class="['minimap-absolute', { 'minimap-shifted': !panelCollapsed }]" />
			
			<!-- Template slot para edge personalizado -->
			<template #edge-deletable="edgeProps">
				<CustomEdge v-bind="edgeProps" @delete="onEdgeDelete" />
			</template>
		</VueFlow>
		
		<!-- Copia de la toolbar en la parte inferior izquierda -->
		<div :class="['actions-bar-bottom', { 'actions-bar-bottom-shifted': !panelCollapsed }]">
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
			<button @click.stop="() => centerNodes()" title="Centrar nodos">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
					<circle cx="12" cy="12" r="3" fill="currentColor" />
					<path d="M12 6v2M12 16v2M6 12h2M16 12h2" stroke="currentColor" stroke-width="1" />
				</svg>
			</button>
			
			<!-- Dropdown para estilo de conexiones -->
			<div class="connection-style-dropdown" title="Estilo de conexiones">
				<select v-model="connectionStyle" @change="onConnectionStyleChange" class="connection-style-select">
					<option value="bezier">Curvas</option>
					<option value="straight">Rectas</option>
					<option value="step">Escalones</option>
				</select>
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="dropdown-arrow">
					<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
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
		</div>
		
		<ContextMenu
			:visible="contextMenu.visible"
			:x="contextMenu.x"
			:y="contextMenu.y"
			:items="contextMenu.items"
			@close="closeContextMenu"
		/>
		<Transition persisted name="slide-panel">
			<NodePropertiesPanel
				:key="selectedNode?.id || selectedEdge?.id || (showingProjectProps ? 'project' : 'none')"
				:node="selectedNode"
				:edge="selectedEdge"
				:nodes="nodes"
				:collapsed="panelCollapsed"
				:disabled="!selectedNode && !selectedEdge && !showingProjectProps"
				:showProject="showingProjectProps"
				:projectProps="projectProperties"
				@close="deselectAll"
				@update="updateProperty"
				@toggle-collapsed="panelCollapsed = $event"
				@update-project="updateProjectProperties"
			/>
		</Transition>
	</div>
	
	<!-- Diálogos de confirmación -->
	<SimpleDialog 
		v-model="showClearFlowDialog"
		title="Confirmar limpieza"
		message="¿Estás seguro de que deseas limpiar el flujo? Esta acción eliminará todos los nodos y conexiones."
		type="warning"
		:show-icon="true"
		:show-cancel-button="true"
		cancel-button-text="Cancelar"
		confirm-button-text="Sí, limpiar"
		confirm-button-type="danger"
		@confirm="confirmClearFlow"
		@cancel="cancelClearFlow"
	/>
	
	<SimpleDialog 
		v-if="nodeToDelete && showDeleteNodeDialog"
		v-model="showDeleteNodeDialog"
		:title="`Eliminar nodo ${nodeToDelete?.label || nodeToDelete?.type || 'sin nombre'}`"
		message="¿Estás seguro de que deseas eliminar este nodo?"
		note="Esta acción eliminará también todas las conexiones asociadas a este nodo."
		type="error"
		:show-icon="true"
		:show-cancel-button="true"
		cancel-button-text="Cancelar"
		confirm-button-text="Eliminar"
		confirm-button-type="danger"
		@confirm="confirmDeleteNode"
		@cancel="cancelDeleteNode"
	/>
	
	<SimpleDialog 
		v-if="edgeToDelete && showDeleteEdgeDialog"
		v-model="showDeleteEdgeDialog"
		title="Eliminar conexión"
		:message="getEdgeDeleteMessage()"
		type="error"
		:show-icon="true"
		:show-cancel-button="true"
		cancel-button-text="Cancelar"
		confirm-button-text="Eliminar conexión"
		confirm-button-type="danger"
		@confirm="confirmDeleteEdge"
		@cancel="cancelDeleteEdge"
	/>
	
	<SimpleDialog 
		v-model="showPublishDialog"
		title="Confirmar publicación"
		message="¿Estás seguro de que deseas publicar este flujo?"
		warning="La publicación creará una nueva versión y hará el flujo disponible para su uso en producción."
		note="Esta acción ejecutará validaciones completas antes de proceder."
		type="warning"
		:show-icon="true"
		:show-cancel-button="true"
		cancel-button-text="Cancelar"
		confirm-button-text="Sí, publicar"
		confirm-button-type="primary"
		@confirm="confirmPublishFlow"
		@cancel="cancelPublishFlow"
	/>
	
	<!-- Diálogo de checklist del test -->
	<SimpleDialog 
		v-model="showTestChecklistDialog"
		title="Validando checklist del flujo"
		type="info"
		:show-icon="true"
		:show-cancel-button="true"
		cancel-button-text="Cancelar"
		:show-close="false"
		:close-on-click-modal="false"
		:show-confirm-button="false"
		:show-submit-button="false"
		@cancel="cancelTestFlow"
	>
		<div class="test-checklist">
			<div 
				v-for="item in testChecklistItems" 
				:key="item.id" 
				class="checklist-item"
				:class="{ 'completed': item.completed }"
			>
				<div class="checklist-icon">
					<svg v-if="item.completed" width="16" height="16" viewBox="0 0 24 24" fill="none" class="check-icon">
						<path d="M20 6L9 17l-5-5" stroke="#4caf50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<div v-else class="loading-spinner"></div>
				</div>
				<span class="checklist-text">{{ item.text }}</span>
			</div>
		</div>
	</SimpleDialog>
	
	<!-- Modal de resultados del test -->
	<div v-if="showTestResultsModal" class="test-results-modal-overlay" @click="closeTestResults">
		<div class="test-results-modal" @click.stop>
			<div class="modal-header">
				<h2 class="modal-title">
					<svg v-if="testResults?.status === 'success'" width="24" height="24" viewBox="0 0 24 24" fill="none" class="status-icon success">
						<circle cx="12" cy="12" r="10" stroke="#4caf50" stroke-width="2"/>
						<path d="M8 12l2 2 4-4" stroke="#4caf50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" class="status-icon warning">
						<path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#ff9800" stroke-width="2"/>
						<path d="M12 8v4M12 16h.01" stroke="#ff9800" stroke-width="2" stroke-linecap="round"/>
					</svg>
					Resultados del Test
				</h2>
				<button @click="closeTestResults" class="modal-close-btn">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</button>
			</div>
			
			<div class="modal-content">
				<div class="results-summary" v-if="testResults">
					<h3>Resumen</h3>
					<div class="summary-grid">
						<div class="summary-item">
							<span class="label">Total de nodos:</span>
							<span class="value">{{ testResults.summary.totalNodes }}</span>
						</div>
						<div class="summary-item">
							<span class="label">Conexiones:</span>
							<span class="value">{{ testResults.summary.totalConnections }}</span>
						</div>
						<div class="summary-item">
							<span class="label">Nodos START:</span>
							<span class="value">{{ testResults.summary.startNodes }}</span>
						</div>
						<div class="summary-item">
							<span class="label">Nodos END:</span>
							<span class="value">{{ testResults.summary.endNodes }}</span>
						</div>
						<div class="summary-item">
							<span class="label">Validaciones:</span>
							<span class="value" :class="testResults.status">{{ testResults.summary.validationsPassed }}</span>
						</div>
						<div class="summary-item">
							<span class="label">Tiempo estimado:</span>
							<span class="value">{{ testResults.details.estimatedRuntime }}</span>
						</div>
					</div>
				</div>
				
				<div class="results-details" v-if="testResults">
					<h3>Detalles del flujo</h3>
					<div class="details-content">
						<p><strong>Ruta de ejecución:</strong> {{ testResults.details.executionPath }}</p>
						<p><strong>Tipos de nodos:</strong> {{ testResults.details.nodeTypes.join(', ') }}</p>
						<p><strong>Dependencias circulares:</strong> {{ testResults.details.hasCircularDependencies ? 'Detectadas' : 'No detectadas' }}</p>
					</div>
				</div>
			</div>
			
			<div class="modal-footer">
				<button @click="closeTestResults" class="btn btn-secondary">Cerrar</button>
				<button v-if="testResults?.status === 'success'" @click="publishFlow" class="btn btn-primary">Publicar flujo</button>
			</div>
		</div>
	</div>
	
	<!-- Modal del Wizard Simulador -->
	<div v-if="showWizardModal" class="wizard-modal-overlay" @click="closeWizard">
		<div class="wizard-modal" @click.stop>
			<!-- Header del wizard -->
			<div class="wizard-header">
				<h2 class="wizard-title">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="wizard-icon">
						<path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#4caf50" stroke-width="2"/>
						<path d="M2 17l10 5 10-5" stroke="#4caf50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M2 12l10 5 10-5" stroke="#4caf50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					Simulador de Flujo
				</h2>
				<button @click="closeWizard" class="wizard-close-btn">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</button>
			</div>
			
			<!-- Progreso del wizard -->
			<div class="wizard-progress">
				<div class="progress-bar">
					<div 
						class="progress-fill" 
						:style="{ width: `${((currentWizardStep + 1) / wizardSteps.length) * 100}%` }"
					></div>
				</div>
			   <div class="progress-info">
				   <div class="progress-text">
					   Paso {{ currentWizardStep + 1 }} de {{ wizardSteps.length }}
					   <span v-if="wizardSteps[currentWizardStep]"> - {{ wizardSteps[currentWizardStep].title }}</span>
				   </div>
			   </div>
			</div>
			
			<!-- Contenido del paso actual con panel lateral -->
			<div class="wizard-main-content">
				<div class="wizard-content" :style="{ '--wizard-zoom': wizardZoomLevel }">
					<div v-if="!wizardCompleted && wizardSteps[currentWizardStep]" class="wizard-step">
						<!-- <div class="step-header">
							<h3>{{ wizardSteps[currentWizardStep].title }}</h3>
							<p class="step-description">{{ wizardSteps[currentWizardStep].description }}</p>
						</div> -->
						
						<!-- Aquí se renderizará el componente de vista específico -->
						<div class="step-content">
							

							<!-- Contenedor principal del componente -->
							<div class="component-container">
								<component 
									:is="wizardComponents[wizardSteps[currentWizardStep].component as keyof typeof wizardComponents]" 
									v-if="wizardSteps[currentWizardStep].type === 'view' && componentExists(wizardSteps[currentWizardStep].component)"
									:key="wizardSteps[currentWizardStep].id"
									:ref="wizardSteps[currentWizardStep].component === 'IframeMicrofrontendView' ? 'currentExternalComponentRef' : undefined"
									:wizard-step="wizardSteps[currentWizardStep]"
									:zoom-level="wizardZoomLevel"
									:device="selectedDevice"
									@next="nextWizardStep"
									@previous="previousWizardStep"
									@ready="handleComponentReady"
									@error="handleComponentError"
								/>
								
								<!-- Para componentes que no existen aún, mostrar placeholder -->
								<div v-if="!componentExists(wizardSteps[currentWizardStep].component)" class="step-placeholder">
									<div class="placeholder-icon">
										<!-- Mostrar ícono del nodo si está disponible, sino mostrar ícono por defecto -->
										<div v-if="wizardSteps[currentWizardStep].nodeData?.icon" 
											 v-html="wizardSteps[currentWizardStep].nodeData.icon" 
											 class="node-icon-wrapper">
										</div>
										<svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none">
											<rect x="3" y="3" width="18" height="18" rx="2" stroke="#6b7280" stroke-width="2"/>
											<path d="M9 9h6v6H9V9z" fill="#6b7280" opacity="0.3"/>
										</svg>
									</div>
									<h4>{{ wizardSteps[currentWizardStep].title }}</h4>
									<p>{{ wizardSteps[currentWizardStep].description }}</p>
									<p class="component-info">Componente: <code>{{ wizardSteps[currentWizardStep].component }}</code></p>
								</div>
							</div>
						</div>
					</div>
					
					<!-- Pantalla de completado -->
					<div v-if="wizardCompleted" class="wizard-completed">
						<div class="completion-icon">
							<svg width="64" height="64" viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="10" stroke="#4caf50" stroke-width="2"/>
								<path d="M8 12l2 2 4-4" stroke="#4caf50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						<h3>¡Proceso Completado!</h3>
						<p>El flujo se ha ejecutado exitosamente a través de todos los pasos definidos.</p>
						
						<!-- Resumen de datos capturados -->
						<div v-if="Object.keys(wizardOutputData).length > 0" class="output-data-summary">
							<h4>📋 Datos Capturados:</h4>
							
							<!-- Parámetros de tiempo -->
							<div v-if="extractTimeParameters().horaInicio || extractTimeParameters().horaFin" class="time-params">
								<h5>⏰ Parámetros de Tiempo:</h5>
								<div class="param-item" v-if="extractTimeParameters().horaInicio">
									<strong>Hora de Inicio:</strong> {{ formatDateTime(extractTimeParameters().horaInicio) }}
								</div>
								<div class="param-item" v-if="extractTimeParameters().horaFin">
									<strong>Hora de Fin:</strong> {{ formatDateTime(extractTimeParameters().horaFin) }}
								</div>
							</div>
							
							<!-- Otros parámetros por paso -->
							<div class="step-params">
								<div v-for="(stepData, stepId) in wizardOutputData" :key="stepId" class="step-data">
									<h5>📄 {{ getStepTitle(stepId) }}:</h5>
									<div class="params-grid">
										<div v-for="(value, key) in stepData.outputParameters" :key="key" class="param-item">
											<strong>{{ key }}:</strong> 
											<span v-if="typeof value === 'object'">{{ JSON.stringify(value, null, 2) }}</span>
											<span v-else>{{ value }}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						
						<div class="completion-summary">
							<p><strong>Pasos completados:</strong> {{ wizardSteps.length }}</p>
							<p><strong>Vistas procesadas:</strong> {{ wizardSteps.filter(s => s.type === 'view').length }}</p>
							<p><strong>Datos capturados:</strong> {{ Object.keys(wizardOutputData).length }} pasos con datos</p>
						</div>
					</div>
				</div>

				<!-- Panel de Variables -->
				<VariablesPanel
					:output-data="wizardOutputData"
					:time-parameters="extractTimeParameters()"
					:session-data="getSessionData()"
					:current-step="currentWizardStep"
					:total-steps="wizardSteps.length"
					:current-step-title="wizardSteps[currentWizardStep]?.title || ''"
					:current-step-data="getCurrentStepData()"
				/>
			</div>
			
			<!-- Footer con controles -->
		   <div class="wizard-footer wizard-footer-flex" :style="{ '--zoom-center': zoomCenter }">
<!-- Botón 'Anterior' oculto temporalmente -->
<!--
<button 
   v-if="!wizardCompleted"
   @click="previousWizardStep" 
   :disabled="currentWizardStep === 0"
   class="btn btn-secondary"
>
   Anterior
</button>
-->
			   <div class="zoom-controls zoom-controls-center">
				   <!-- Configuración extrema para contenido completo -->
				   <div class="device-info-footer">
					   <span style="color: #666; font-size: 12px;">Responsive Design (430x1600)</span>
				   </div>
			   </div>
<!-- Botones de la derecha ocultos temporalmente -->
<!--
<div class="wizard-footer-right">
   <button v-if="wizardCompleted" @click="restartWizard" class="btn btn-secondary">
	   Reiniciar
   </button>
   <button v-if="wizardCompleted" @click="closeWizard" class="btn btn-primary">
	   Finalizar
   </button>
   <button 
	   v-if="!wizardCompleted"
	   @click="nextWizardStep" 
	   class="btn btn-primary"
   >
	   {{ currentWizardStep === wizardSteps.length - 1 ? 'Finalizar' : 'Siguiente' }}
   </button>
</div>
-->
		   </div>
		</div>
	</div>
</template>

<script setup lang="ts">
// --- Zoom controls alignment with component view center ---
const zoomCenter = ref('50%');
function updateZoomCenter() {
  nextTick(() => {
	const container = document.querySelector('.component-container');
	const footer = document.querySelector('.wizard-footer');
	if (container && footer) {
	  const containerRect = container.getBoundingClientRect();
	  const footerRect = footer.getBoundingClientRect();
	  // Calcula el centro relativo al footer
	  const center = containerRect.left + containerRect.width / 2 - footerRect.left;
	  zoomCenter.value = `${center}px`;
	} else {
	  zoomCenter.value = '50%';
	}
  });
}
onMounted(() => {
  updateZoomCenter();
  window.addEventListener('resize', updateZoomCenter);
});
// --- Variables globales para test flow ---
const testCancelled = ref(false);
let testTimeouts: number[] = [];
import { VueFlow, useVueFlow } from '@vue-flow/core';
// Device presets para simulación móvil
// Configuración extrema para eliminar scroll completamente
const defaultDevice = {
	label: 'Responsive',
	width: 430,
	height: 1600  // Altura extrema para garantizar contenido completo
};

const selectedDevice = ref(defaultDevice);
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import { storeToRefs } from 'pinia';
import { useFlowStore } from '../stores/flow';
import ContextMenu from './ContextMenu.vue';
import NodePropertiesPanel from './nodePropertiesPanel/index.vue';
import { reactive, markRaw, ref, watch, onMounted, onBeforeUnmount, nextTick, provide } from 'vue';
import type { Connection, Node, NodeTypesObject, Edge } from '@vue-flow/core';
import CustomNode from './customNode/index.vue';
import EngineNode from './EngineNode.vue';
import MinimalNode from './MinimalNode.vue';
import ConditionNode from './ConditionNode.vue';
import StartNode from './StartNode.vue';
import EndNode from './EndNode.vue';
import CustomEdge from './CustomEdge.vue';
import VariablesPanel from './VariablesPanel.vue';
import { nodeTypeMeta } from '../utils/nodeTypeMeta';
// ElMessageBox reemplazado por CustomDialog
import { getValidationErrors, type ValidationResult } from '../utils/validation';
import { useNotifications } from '../composables/useNotifications';
import SimpleDialog from './SimpleDialog.vue';
// Importar los componentes para el simulador
import ExternalComponentView from './ExternalComponentView.vue';
import SimpleExternalComponentView from './SimpleExternalComponentView.vue';
import IframeMicrofrontendView from './IframeMicrofrontendView.vue';
import ProcessView from './ProcessView.vue';

// Interfaces para el sistema de testing
interface TestResults {
	isValid: boolean;
	summary: {
		totalNodes: number;
		totalConnections: number;
		startNodes: number;
		endNodes: number;
		validationsPassed: string;
	};
	details: {
		nodeTypes: (string | undefined)[];
		hasCircularDependencies: boolean;
		executionPath: string;
		estimatedRuntime: string;
	};
	status: 'success' | 'warning';
}

interface ChecklistItem {
	id: number;
	text: string;
	completed: boolean;
}

interface WizardStep {
	id: string;
	nodeId: string;
	title: string;
	type: 'view' | 'process';
	component: string;
	description: string;
	completed: boolean;
}

// Extender el tipo Node para incluir la propiedad selected opcional
interface ExtendedNode extends Node {
	selected?: boolean;
}

const flowStore = useFlowStore();
const { nodes, edges, flowTitle } = storeToRefs(flowStore);

// Auto-guardar en localStorage
const AUTOSAVE_KEY = 'n8n_standalone_flow_data';
const AUTOSAVE_DELAY_MS = 1000; // 1 segundo
let autoSaveTimer: number | null = null;

// Control para centrado automático
let autoCenterApplied = false;

// Estado para validaciones de nodos
const validationErrors = ref<ValidationResult[]>([]);

// Estado para el estilo de conexiones
const connectionStyle = ref<'bezier' | 'straight' | 'step'>('bezier');

// Sistema de versiones del flujo
const selectedVersion = ref('1.0.0');
const flowVersions = ref([
	{ value: '1.0.0', label: 'v1.0.0' },
	{ value: '1.0.1', label: 'v1.0.1' },
	{ value: '1.0.2', label: 'v1.0.2' },
	{ value: '1.0.3', label: 'v1.0.3' },
	{ value: '1.1.0', label: 'v1.1.0' },
	{ value: '1.1.1', label: 'v1.1.1' },
	{ value: '1.2.0', label: 'v1.2.0' },
	{ value: '2.0.0', label: 'v2.0.0' }
]);

// Sistema de notificaciones
const { showValidationError, showSuccess, showWarning, showDanger, showInfo } = useNotifications();

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
	// NO guardar el viewport - siempre usar zoom por defecto al cargar
	
	const dataToSave = {
		nodes: sanitizeNodesForSave(nodes.value as ExtendedNode[]),
		edges: edges.value,
		flowProps: projectProperties.value,
		// NO incluir viewport para mantener zoom consistente
	};
	
	localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
	console.log('Flow guardado en localStorage sin viewport (zoom por defecto al cargar)');
	
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
			// Asegurar que las conexiones tengan las propiedades necesarias
			edges.value = savedData.edges.map((edge: any) => ({
				...edge,
				animated: edge.animated !== undefined ? edge.animated : true,
				type: edge.type || 'default',
				selectable: edge.selectable !== undefined ? edge.selectable : true,
				focusable: edge.focusable !== undefined ? edge.focusable : true,
				deletable: edge.deletable !== undefined ? edge.deletable : true,
			}));
		}
		if (savedData.flowProps) {
			projectProperties.value = { ...projectProperties.value, ...savedData.flowProps };
		}
		// NO restaurar viewport - siempre usar zoom por defecto
		
		console.log('Flow cargado desde localStorage:', {
			nodes: nodes.value.length,
			edges: edges.value.length,
			viewport: 'usando zoom por defecto (no restaurado)'
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
	console.log('FlowCanvas montado');
	
	loadFromLocalStorage();
	setupAutoSave();
	
	// Configurar un event listener global para capturar clicks en edges
	setupGlobalEdgeClickDetection();
	
	// Provide de la función de delete para componentes hijos
	provide('deleteNodeFunction', onNodeDelete);
	
	// Listener para el evento DOM personalizado como fallback
	document.addEventListener('custom-node-delete', (event: any) => {
		console.log('🗑️ FlowCanvas: Evento DOM custom-node-delete recibido:', event.detail);
		if (event.detail?.nodeId) {
			onNodeDelete(event.detail.nodeId);
		}
	});
	
	// Debug: agregar algunas funciones de prueba al window para testing
	(window as any).debugFlow = {
		getNodes: () => nodes.value,
		deleteNode: onNodeDelete,
		showDialog: () => { showDeleteNodeDialog.value = true; },
		addTestNode: () => {
			const newId = (nodes.value.length + 1).toString();
			const newNode = {
				id: newId,
				type: 'minimal',
				label: 'Test Node ' + newId,
				data: { label: 'Test Node ' + newId },
				position: { x: 100 + (nodes.value.length * 50), y: 100 }
			};
			nodes.value.push(newNode);
			console.log('Nodo de prueba agregado:', newNode);
		}
	};
	console.log('Debug funciones disponibles en window.debugFlow');
	
	// Esperar múltiples ciclos para asegurar que Vue Flow esté completamente inicializado
	setTimeout(() => {
		if (nodes.value.length > 0 && !autoCenterApplied) {
			console.log(`Primera carga detectada, aplicando centrado automático para ${nodes.value.length} nodos...`);
			autoCenterApplied = true;
			
			// Ejecutar validaciones del flujo cargado
			setTimeout(() => runNodeValidations(false), 500); // Sin notificaciones al cargar
			
			// Siempre usar fitView con configuración consistente
			console.log('Aplicando centrado automático con zoom por defecto consistente');
			fitView({ 
				padding: 50,
				includeHiddenNodes: true,
				minZoom: 0.4,
				maxZoom: 1.2,
				duration: 600
			});
		} else if (nodes.value.length === 0) {
			// Si no hay nodos, establecer zoom por defecto
			console.log('Canvas vacío, estableciendo zoom por defecto');
			setViewport({
				x: 0,
				y: 0,
				zoom: 0.8 // Zoom por defecto consistente
			});
		}
		
		// Configurar event listeners directos para edges existentes
		setTimeout(() => {
			setupEdgeEventListeners();
		}, 500);
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
	processNode: markRaw(CustomNode), // Tipo de nodo para procesos
	engineNode: markRaw(EngineNode), // Nuevo tipo de nodo para motores
	// Primero el spread, luego sobrescribes condition, start y end:
	...Object.fromEntries(Object.keys(nodeTypeMeta).map((type) => [type, markRaw(CustomNode)])),
	condition: markRaw(ConditionNode), // Esto asegura que 'condition' SIEMPRE sea diamante
	// Asegurar que start y end usen sus componentes específicos
	start: markRaw(StartNode),
	end: markRaw(EndNode),
} as unknown as NodeTypesObject;

// Definir tipos de edges personalizados
const edgeTypes = {
	deletable: markRaw(CustomEdge),
} as any; // Forzar tipado para evitar errores de TypeScript

// Usa useVueFlow para zoom seguro y tipado
const { 
	zoomIn: vueFlowZoomIn, 
	zoomOut: vueFlowZoomOut, 
	fitView, 
	getViewport, 
	setViewport 
} = useVueFlow();

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

// Función para cambiar el estilo de conexiones
function onConnectionStyleChange() {
	// Actualizar todas las conexiones existentes
	edges.value = edges.value.map(edge => ({
		...edge,
		data: {
			...edge.data,
			pathType: connectionStyle.value
		}
	}));
	
	// Guardar cambios
	triggerAutoSave();
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
// Estado para el diálogo de confirmación de limpieza
const showClearFlowDialog = ref(false);

function clearFlow() {
	// Mostrar el diálogo de confirmación
	showClearFlowDialog.value = true;
}

function confirmClearFlow() {
	// Limpiar nodos y edges
	nodes.value = [];
	edges.value = [];

	// Limpiar selección y mostrar propiedades del proyecto
	selectedNodeId.value = null;
	selectedNode.value = null;
	selectedEdgeId.value = null;
	selectedEdge.value = null;
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
		version: selectedVersion.value, // Agregar la propiedad version
	};

	// Guardar los cambios en localStorage
	saveToLocalStorage();

	// Cerrar el diálogo
	showClearFlowDialog.value = false;
	
	// Mostrar notificación de éxito
	showSuccess('Flujo limpiado', {
		description: 'Se han eliminado todos los nodos y conexiones del flujo',
		duration: 3000
	});
}

function cancelClearFlow() {
	showClearFlowDialog.value = false;
}

// ---

function onConnect(params: Connection) {
	// Crear la nueva conexión temporalmente para validar
	const newEdge = {
		id: `e${params.source}-${params.target}`, // Usar el mismo formato que el store
		source: params.source!,
		target: params.target!,
		sourceHandle: params.sourceHandle,
		targetHandle: params.targetHandle,
		animated: true,
		type: 'deletable', // Usar el tipo personalizado con botón de eliminar
		selectable: true,
		focusable: true,
		deletable: true,
		data: {
			pathType: connectionStyle.value // Agregar el estilo de conexión seleccionado
		}
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
	
	// Si no hay errores de validación, crear a conexión
	// Usar el tipo correcto para evitar errores de TypeScript
	// Crear objeto básico de Connection e luego hacer cast
	const edgeBase = {
		source: newEdge.source,
		target: newEdge.target,
		sourceHandle: newEdge.sourceHandle,
		targetHandle: newEdge.targetHandle,
	};
	
	flowStore.addEdge(edgeBase);
	
	console.log('Nueva conexión creada entre:', newEdge.source, '->', newEdge.target);
	console.log('Conexiones totales después de crear:', edges.value.length);
	console.log('Array de conexiones:', edges.value.map(e => ({ id: e.id, source: e.source, target: e.target })));
	
	// Seleccionar la conexión recién creada (usar el mismo ID que ya definimos)
	setTimeout(() => {
		const createdEdge = edges.value.find(e => e.id === newEdge.id);
		if (createdEdge) {
			selectedNodeId.value = null; // Deseleccionar nodo si había uno
			selectedEdgeId.value = createdEdge.id;
			console.log('Conexión seleccionada automáticamente:', createdEdge.id);
		} else {
			console.log('No se pudo encontrar la conexión creada. ID esperado:', newEdge.id);
			console.log('Conexiones disponibles:', edges.value.map(e => ({ id: e.id, source: e.source, target: e.target })));
		}
		
		// Configurar event listeners directos para la nueva conexión
		setupEdgeEventListeners();
	}, 50);
	
	triggerAutoSave();
}

function onDrop(e: DragEvent) {
	// Soporta tanto nodos estándar como personalizados
	const typeRaw = e.dataTransfer?.getData('application/node-type');
	const type: string | null = typeRaw || null;
	
	const labelRaw = e.dataTransfer?.getData('text/plain');
	const label: string | null = labelRaw || null;
	
	const customNodeTypeRawData = e.dataTransfer?.getData('application/custom-node-type');
	const customNodeTypeRaw: string | null = customNodeTypeRawData || null;

	// Nuevos datos del catálogo de nodos
	const templateId = e.dataTransfer?.getData('application-template-id') || null;
	const defaultDataRaw = e.dataTransfer?.getData('application-default-data') || null;
	let defaultData = null;
	
	if (defaultDataRaw) {
		try {
			defaultData = JSON.parse(defaultDataRaw);
		} catch (err) {
			console.error('Error parsing default data:', err);
		}
	}

	// Calcular posición correcta considerando zoom y pan del canvas
	// Usar transformación manual más confiable
	const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
	const viewport = getViewport();
	
	// Calcular posición relativa al canvas
	const canvasX = e.clientX - bounds.left;
	const canvasY = e.clientY - bounds.top;
	
	// Transformar a coordenadas del flow considerando zoom y pan
	const position = {
		x: (canvasX - viewport.x) / viewport.zoom,
		y: (canvasY - viewport.y) / viewport.zoom,
	};

	console.log('🎯 Drop position - Client:', { x: e.clientX, y: e.clientY });
	console.log('🎯 Drop position - Canvas bounds:', bounds);
	console.log('🎯 Drop position - Canvas relative:', { x: canvasX, y: canvasY });
	console.log('🎯 Drop position - Viewport:', viewport);
	console.log('🎯 Drop position - Final flow position:', position);

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
				processNodeDrop(position, type, label, customNodeTypeRaw, templateId, defaultData);
			}, 50);
			return;
		}
	}
	
	// Procesar el nodo normalmente
	processNodeDrop(position, type, label, customNodeTypeRaw, templateId, defaultData);
}

function processNodeDrop(position: { x: number; y: number }, type: string | null, label: string | null, customNodeTypeRaw: string | null, templateId?: string | null, defaultData?: any) {

	// Si hay templateId, es un nodo del catálogo
	if (templateId && defaultData) {
		console.log('🎯 Procesando nodo del catálogo:', { templateId, type, label, defaultData });
		
		// Validar si se puede agregar este tipo de nodo
		if (!canAddNodeType(type || 'processNode')) {
			console.log(`No se puede agregar nodo del catálogo debido a reglas de validación`);
			return;
		}
		
		// Crear nodo usando los datos del catálogo
		flowStore.addNode({
			type: type || 'processNode',
			label: label || defaultData.subtitle || 'Nodo',
			position,
			data: {
				...defaultData,
				templateId: templateId,
				isFromCatalog: true
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
		
		// Guardar inmediatamente después de agregar nodo del catálogo
		console.log('Nodo del catálogo agregado, guardando...');
		triggerAutoSave();
		return;
	}

	if (customNodeTypeRaw) {
		// Nodo personalizado: los datos vienen serializados en JSON
		try {
			const customType = JSON.parse(customNodeTypeRaw);
			const nodeType = customType.type || customType.id || customType.name || 'processNode';
			
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
					componentVersion: '1.0.0', // Inicializar versión para componentes externos
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

// Estado para conexiones seleccionadas
const selectedEdgeId = ref<string | null>(null);
const selectedEdge = ref<Edge | null>(null);

// Sincronizar selectedNode cuando cambia el ID usando nuestra función optimizada
watch(selectedNodeId, () => {
	updateSelectedNodeFromList();
});

// Sincronizar selectedEdge cuando cambia el ID
watch(selectedEdgeId, () => {
	updateSelectedEdgeFromList();
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

// Función similar para conexiones
function updateSelectedEdgeFromList() {
	if (!selectedEdgeId.value) {
		selectedEdge.value = null;
		return;
	}

	const updatedEdge = edges.value.find((e) => e.id === selectedEdgeId.value) || null;
	
	if (!updatedEdge) {
		selectedEdge.value = null;
		return;
	}

	if (selectedEdge.value === updatedEdge) return;
	selectedEdge.value = updatedEdge;
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

// Observar cambios en edges para actualizar selectedEdge
watch(
	edges,
	() => {
		if (selectedEdgeId.value) {
			updateSelectedEdgeFromList();
		}
	},
	{ deep: false },
);

const panelCollapsed = ref(true);

// Estado para propiedades del proyecto
const projectProperties = ref({
	name: flowTitle.value, // Inicializar con el valor del store
	description: 'Descripción del flujo',
	status: 'Activo',
	owner: 'Usuario',
	createdAt: new Date().toLocaleDateString(),
	updatedAt: new Date().toLocaleDateString(),
	version: selectedVersion.value, // Agregar la propiedad version
});
const showingProjectProps = ref(false);

// Sincronizar projectProperties cuando cambie flowTitle
watch(flowTitle, (newTitle) => {
	projectProperties.value.name = newTitle;
});

// Detectar selección de nodo (click) de forma optimizada
function onNodeClick({ node }: { node: Node }) {
	// Evitar la actualización si ya es el mismo nodo seleccionado
	if (selectedNodeId.value === node.id) {
		return;
	}

	// Deseleccionar conexión si había una seleccionada
	selectedEdgeId.value = null;
	selectedEdge.value = null;
	
	// Deseleccionar todas las conexiones visualmente
	edges.value = edges.value.map(e => ({
		...e,
		selected: false
	}));

	// Actualizar todos los nodos para deseleccionar y luego seleccionar el clickeado
	nodes.value = nodes.value.map(n => ({
		...n,
		selected: n.id === node.id
	}));

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
	
	// Actualizar la selección al nodo que se acaba de arrastrar
	const draggedNode = event.node;
	if (draggedNode && draggedNode.id) {
		// Deseleccionar conexión si había una seleccionada
		selectedEdgeId.value = null;
		selectedEdge.value = null;
		
		// Deseleccionar todas las conexiones visualmente
		edges.value = edges.value.map(e => ({
			...e,
			selected: false
		}));

		// Actualizar todos los nodos para deseleccionar y luego seleccionar el arrastrado
		nodes.value = nodes.value.map(n => ({
			...n,
			selected: n.id === draggedNode.id
		}));

		// Actualizar la selección
		showingProjectProps.value = false;
		selectedNodeId.value = draggedNode.id;
		
		// Expandir el panel si está colapsado
		if (panelCollapsed.value) {
			panelCollapsed.value = false;
		}
	}
	
	triggerAutoSave();
}

// Click normal en el fondo del designer
function onCanvasClick(e: MouseEvent) {
	const target = e.target as HTMLElement;
	// Si el click fue sobre el fondo (no sobre un nodo, conexión ni sobre el panel de propiedades)
	if (!target.closest('.vue-flow__node') && 
		!target.closest('.vue-flow__edge') && 
		!target.closest('.node-properties-panel')) {
		selectedNodeId.value = null;
		selectedEdgeId.value = null;
		showingProjectProps.value = true;
		if (panelCollapsed.value) {
			panelCollapsed.value = false;
		}
		contextMenu.visible = false;
		// Deseleccionar todos los nodos en el store
		nodes.value = (nodes.value as ExtendedNode[]).map((n) => ({ ...n, selected: false }));
		// Deseleccionar todas las conexiones
		edges.value = edges.value.map(e => ({ ...e, selected: false }));
	}
}

// Actualizar propiedades del proyecto de forma controlada
function updateProjectProperties(val: any) {
	if (!val) return;

	// Evitar mutaciones directas actualizando solo propiedades específicas
	if (val.name !== undefined) {
		projectProperties.value.name = val.name;
		// Sincronizar con el store del flujo
		flowTitle.value = val.name;
	}
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
	} else if (key === 'componentVersion') {
		// Manejo específico para versión de componente externo
		nodeCopy.data.componentVersion = value;

		// Actualizamos directamente en el array
		nodes.value.splice(nodeIndex, 1, nodeCopy);

		// Actualizamos el nodo seleccionado
		selectedNode.value = nodeCopy;
		
		console.log(`Versión del componente actualizada a: ${value}`);
		
		// TODO: En el futuro, aquí se podría invalidar el cache del componente
		// para forzar la recarga con la nueva versión
	}
}

// Función unificada para actualizar propiedades (nodos y edges)
function updateProperty({ key, value, isEdge }: { key: string; value: any; isEdge?: boolean }) {
	if (isEdge) {
		updateEdgeProperty({ key, value });
	} else {
		updateNodeProperty({ key, value });
	}
}

// Actualizar propiedades de edge desde el panel
function updateEdgeProperty({ key, value }: { key: string; value: any }) {
	if (!selectedEdge.value || !selectedEdge.value.id) return;

	const edgeId = selectedEdge.value.id;
	const edgeIndex = edges.value.findIndex((e) => e.id === edgeId);

	if (edgeIndex === -1) return;

	console.log(`Actualizando propiedad ${key} a "${value}" en edge ${edgeId}`);

	// Crear una copia del edge
	const edgeCopy = { ...edges.value[edgeIndex] };
	
	// Actualizar la propiedad
	(edgeCopy as any)[key] = value;

	// Actualizar en el array
	edges.value.splice(edgeIndex, 1, edgeCopy);

	// Actualizar el edge seleccionado
	selectedEdge.value = edgeCopy;

	console.log('Edge actualizado:', edgeCopy);
	triggerAutoSave();
}

// Deseleccionar todo (nodos y edges)
function deselectAll() {
	selectedNodeId.value = null;
	selectedNode.value = null;
	selectedEdgeId.value = null;
	selectedEdge.value = null;
	showingProjectProps.value = false;
	
	// Deseleccionar visualmente todos los nodos
	nodes.value = nodes.value.map(n => ({
		...n,
		selected: false
	}));
	
	// Deseleccionar visualmente todas las conexiones
	edges.value = edges.value.map(e => ({
		...e,
		selected: false
	}));
}

// ===== FUNCIONES PARA MANEJO DE CONEXIONES =====

// Seleccionar una conexión al hacer click
function onEdgeClick({ edge }: { edge: Edge }) {
	console.log('🔗 EDGE CLICK DETECTADO!');
	console.log('Conexión seleccionada:', edge);
	console.log('Edge ID:', edge.id);
	console.log('Current selectedEdgeId:', selectedEdgeId.value);
	
	// Deseleccionar nodo si había uno seleccionado
	selectedNodeId.value = null;
	selectedNode.value = null;
	
	// Deseleccionar todas las conexiones primero
	edges.value = edges.value.map(e => ({
		...e,
		selected: false
	}));
	
	// Seleccionar la conexión clickeada
	selectedEdgeId.value = edge.id;
	showingProjectProps.value = false;
	
	if (panelCollapsed.value) {
		panelCollapsed.value = false;
	}
}

// Método para registrar event listeners directos en edges
function setupEdgeEventListeners() {
	console.log('⚙️ Configurando event listeners directos para edges...');
	
	nextTick(() => {
		// Buscar tanto los elementos <g> de edge como los paths directamente
		const edgeElements = document.querySelectorAll('.vue-flow__edge');
		const edgePaths = document.querySelectorAll('.vue-flow__edge-path');
		
		console.log('🔍 Encontrados', edgeElements.length, 'elementos de edges');
		console.log('🔍 Encontrados', edgePaths.length, 'paths de edges');
		
		// Registrar eventos en los elementos <g> principales
		edgeElements.forEach((edgeElement, index) => {
			console.log(`📌 Configurando edge element ${index}:`, edgeElement);
			
			// Remover listener anterior si existe
			edgeElement.removeEventListener('click', handleEdgeClick);
			edgeElement.removeEventListener('mousedown', handleEdgeClick);
			edgeElement.removeEventListener('pointerdown', handleEdgeClick);
			
			// Registrar múltiples tipos de eventos
			edgeElement.addEventListener('click', handleEdgeClick, { capture: true });
			edgeElement.addEventListener('mousedown', handleEdgeClick, { capture: true });
			edgeElement.addEventListener('pointerdown', handleEdgeClick, { capture: true });
		});
		
		// También registrar eventos directamente en los paths SVG
		edgePaths.forEach((pathElement, index) => {
			console.log(`📌 Configurando edge path ${index}:`, pathElement);
			
			// Remover listener anterior si existe
			pathElement.removeEventListener('click', handleEdgePathClick);
			pathElement.removeEventListener('mousedown', handleEdgePathClick);
			pathElement.removeEventListener('pointerdown', handleEdgePathClick);
			
			// Registrar múltiples tipos de eventos con capture
			pathElement.addEventListener('click', handleEdgePathClick, { capture: true });
			pathElement.addEventListener('mousedown', handleEdgePathClick, { capture: true });
			pathElement.addEventListener('pointerdown', handleEdgePathClick, { capture: true });
		});
	});
}

// Handler separado para el click en edges
function handleEdgeClick(event: Event) {
	console.log('🎯 Click/MouseDown/PointerDown directo en edge detectado!', event.type, event);
	event.stopPropagation();
	event.preventDefault();
	
	const edgeElement = event.currentTarget as HTMLElement;
	
	// Intentar extraer el ID del edge del DOM
	let edgeId: string | null = edgeElement.getAttribute('data-id');
	
	if (!edgeId) {
		// Buscar en elementos hijos
		const pathElement = edgeElement.querySelector('.vue-flow__edge-path');
		const pathId = pathElement?.getAttribute('data-edge-id');
		edgeId = pathId !== undefined ? pathId : null;
	}
	
	if (!edgeId && edges.value.length > 0) {
		// Como fallback, usar el primer edge disponible
		edgeId = edges.value[0].id;
		console.log('🔧 Usando edge ID de fallback:', edgeId);
	}
	
	console.log('🆔 Edge ID extraído:', edgeId);
	
	// Buscar el edge correspondiente
	const edge = edges.value.find(e => e.id === edgeId);
	if (edge) {
		console.log('✅ Edge encontrado, disparando onEdgeClick');
		onEdgeClick({ edge });
	} else {
		console.log('❌ No se pudo encontrar el edge con ID:', edgeId);
		console.log('Edges disponibles:', edges.value.map(e => e.id));
	}
}

// Handler específico para clicks en el path SVG
function handleEdgePathClick(event: Event) {
	console.log('🎯 Click/MouseDown/PointerDown directo en SVG PATH detectado!', event.type, event);
	event.stopPropagation();
	event.preventDefault();
	
	const pathElement = event.currentTarget as SVGElement;
	
	// El path está dentro del elemento <g> que tiene el data-id
	const edgeElement = pathElement.closest('.vue-flow__edge') as HTMLElement;
	
	if (edgeElement) {
		const edgeId = edgeElement.getAttribute('data-id');
		console.log('🆔 Edge ID extraído desde path:', edgeId);
		
		// Buscar el edge correspondiente
		const edge = edges.value.find(e => e.id === edgeId);
		if (edge) {
			console.log('✅ Edge encontrado desde path, disparando onEdgeClick');
			onEdgeClick({ edge });
		} else {
			console.log('❌ No se pudo encontrar el edge con ID:', edgeId);
			console.log('Edges disponibles:', edges.value.map(e => e.id));
		}
	} else {
		console.log('❌ No se pudo encontrar el elemento padre .vue-flow__edge');
	}
}

// Configurar detección global de clicks en edges y botones de eliminar
function setupGlobalEdgeClickDetection() {
	console.log('🌐 Configurando detección global de clicks en edges y botones...');
	
	// Añadir event listener al documento completo
	document.addEventListener('click', (event) => {
		const target = event.target as Element;
		console.log('🌐 Click detectado globalmente:', target);
		console.log('🔍 Clases del target:', target.classList?.toString());
		console.log('🔍 Tag name del target:', target.tagName);
		
		// NUEVA LÓGICA: Ignorar clicks dentro de diálogos
		if (target.closest('.simple-dialog') || target.classList.contains('simple-dialog')) {
			console.log('🚫 Click dentro de diálogo - ignorando detección global');
			return;
		}
		
		// NUEVA LÓGICA: Verificar usando elementsFromPoint para capturar clicks interceptados
		const elementsFromPoint = document.elementsFromPoint(event.clientX, event.clientY);
		console.log('🔍 Verificando elementos en posición del cursor:', {x: event.clientX, y: event.clientY});
		console.log('📍 Elementos en esa posición:', elementsFromPoint);
		
		// Buscar botón de eliminar conexión en la pila de elementos
		const deleteButton = elementsFromPoint.find(el => 
			el.classList.contains('edge-delete-button') || 
			el.closest('.edge-delete-button')
		);
		
		if (deleteButton) {
			console.log('🗑️ ¡Encontrado botón de eliminar conexión en elementsFromPoint!', deleteButton);
			handleEdgeDeleteButtonClick(deleteButton, event);
			return;
		}
		
		// FALLBACK: Verificar si el click fue en un botón de eliminar de conexión (método original)
		if (target && (target.classList.contains('edge-delete-button') || target.closest('.edge-delete-button'))) {
			console.log('🗑️ Click detectado en botón de eliminar conexión (método original)!');
			handleEdgeDeleteButtonClick(target, event);
			return;
		}
		
		// NUEVA LÓGICA: Verificar si el click fue en un botón de eliminar de nodo
		if (target && target.classList.contains('delete-btn') && target.classList.contains('toolbar-btn')) {
			console.log('🗑️ Click detectado en botón de eliminar nodo!');
			handleDeleteButtonClick(target, event);
			return;
		}
		
		// Verificar si el click fue directamente en un edge path
		if (target && target.classList.contains('vue-flow__edge-path')) {
			console.log('🎯 Click global detectado DIRECTAMENTE en edge path!');
			handleGlobalEdgeClick(target, event);
			return;
		}
		
		// Verificar si el click fue en un elemento edge
		if (target && target.classList.contains('vue-flow__edge')) {
			console.log('🎯 Click global detectado DIRECTAMENTE en elemento edge!');
			handleGlobalEdgeClick(target, event);
			return;
		}
		
		// Verificar si el click fue dentro de un edge (buscar hacia arriba)
		const edgeElement = target.closest('.vue-flow__edge');
		if (edgeElement) {
			console.log('🎯 Click global detectado DENTRO de elemento edge!', edgeElement);
			handleGlobalEdgeClick(edgeElement, event);
			return;
		}
		
		// Verificar si el click fue en un path SVG que podría ser un edge
		if (target.tagName === 'path' && target.getAttribute('class')?.includes('vue-flow__edge-path')) {
			console.log('🎯 Click global detectado en path SVG edge!');
			handleGlobalEdgeClick(target, event);
			return;
		}
		
		// NUEVA ESTRATEGIA: Usar elementFromPoint para encontrar todos los elementos en esa posición
		const clickX = (event as MouseEvent).clientX;
		const clickY = (event as MouseEvent).clientY;
		
		if (clickX !== undefined && clickY !== undefined) {
			console.log('🔍 Verificando elementos en posición del cursor:', { x: clickX, y: clickY });
			
			// Obtener todos los elementos en esa posición
			const elementsAtPoint = document.elementsFromPoint(clickX, clickY);
			console.log('📍 Elementos en esa posición:', elementsAtPoint);
			
			// Buscar si alguno de esos elementos es un edge path o edge
			for (const element of elementsAtPoint) {
				if (element.classList.contains('vue-flow__edge-path')) {
					console.log('🎯 ¡Encontrado edge path en elementsFromPoint!', element);
					handleGlobalEdgeClick(element, event);
					return;
				}
				if (element.classList.contains('vue-flow__edge')) {
					console.log('🎯 ¡Encontrado edge element en elementsFromPoint!', element);
					handleGlobalEdgeClick(element, event);
					return;
				}
			}
		}
		
		console.log('💭 Click no fue en un edge');
	}, true); // Use capture phase
}

// Handler centralizado para clicks globales en edges
function handleGlobalEdgeClick(element: Element, event: Event) {
	console.log('🎯 Procesando click en edge element:', element);
	
	let edgeId: string | null = null;
	
	// Si es un path, buscar el elemento padre edge
	if (element.classList.contains('vue-flow__edge-path')) {
		const edgeElement = element.closest('.vue-flow__edge') as HTMLElement;
		edgeId = edgeElement?.getAttribute('data-id') || null;
		console.log('🆔 Edge ID desde path parent:', edgeId);
	}
	// Si es el elemento edge directamente
	else if (element.classList.contains('vue-flow__edge')) {
		edgeId = element.getAttribute('data-id');
		console.log('🆔 Edge ID directo:', edgeId);
	}
	
	if (edgeId) {
		// Buscar el edge correspondiente
		const edge = edges.value.find(e => e.id === edgeId);
		if (edge) {
			console.log('✅ Edge encontrado desde click global, disparando onEdgeClick');
			event.stopPropagation();
			event.preventDefault();
			onEdgeClick({ edge });
		} else {
			console.log('❌ No se pudo encontrar el edge con ID:', edgeId);
			console.log('Edges disponibles:', edges.value.map(e => e.id));
		}
	} else {
		console.log('❌ No se pudo extraer edge ID del elemento');
	}
}

// Handler para clicks en botones de eliminar
function handleDeleteButtonClick(element: Element, event: Event) {
	console.log('🗑️ Procesando click en botón de eliminar:', element);
	
	// Buscar el nodo padre que contiene este botón
	const nodeElement = element.closest('.vue-flow__node') as HTMLElement;
	
	if (nodeElement) {
		const nodeId = nodeElement.getAttribute('data-id');
		console.log('🆔 Node ID extraído del botón de eliminar:', nodeId);
		
		if (nodeId) {
			console.log('✅ Iniciando proceso de eliminación para nodo:', nodeId);
			event.stopPropagation();
			event.preventDefault();
			onNodeDelete(nodeId);
		} else {
			console.log('❌ No se pudo extraer el ID del nodo desde el botón');
		}
	} else {
		console.log('❌ No se pudo encontrar el elemento nodo padre del botón');
	}
}

// Menú contextual para conexiones
function onEdgeContextMenu({ event, edge }: { event: MouseEvent; edge: Edge }) {
	event.preventDefault();
	console.log('Menú contextual para conexión:', edge);
	
	const sourceNode = nodes.value.find(n => n.id === edge.source);
	const targetNode = nodes.value.find(n => n.id === edge.target);
	
	contextMenu.x = event.clientX;
	contextMenu.y = event.clientY;
	contextMenu.items = [
		{
			label: `Eliminar conexión`,
			action: () => deleteEdge(edge.id)
		},
		{
			label: `Información`,
			action: () => {
				const sourceLabel = sourceNode?.label || sourceNode?.type || 'Nodo';
				const targetLabel = targetNode?.label || targetNode?.type || 'Nodo';
				showInfo('Información de conexión', {
					title: 'Detalles de la conexión',
					description: `Conecta desde "${sourceLabel}" hacia "${targetLabel}"`,
					duration: 5000
				});
			}
		}
	];
	contextMenu.visible = true;
}

// Función para manejar clicks en botones de eliminar conexión
function handleEdgeDeleteButtonClick(element: Element, event: Event) {
	console.log('🗑️ FlowCanvas: handleEdgeDeleteButtonClick ejecutado');
	event.preventDefault();
	event.stopPropagation();
	
	// Buscar el elemento foreignObject padre que contiene el edge ID
	const foreignObjectElement = element.closest('.vue-flow__edge-delete-button');
	if (!foreignObjectElement) {
		console.warn('No se encontró foreignObject padre');
		return;
	}
	
	// Buscar el elemento edge padre
	const edgeElement = foreignObjectElement.closest('.vue-flow__edge');
	if (!edgeElement) {
		console.warn('No se encontró elemento edge padre');
		return;
	}
	
	// Obtener el ID del edge
	const edgeId = edgeElement.getAttribute('data-id');
	if (!edgeId) {
		console.warn('No se encontró data-id del edge');
		return;
	}
	
	console.log('🗑️ FlowCanvas: ID del edge a eliminar:', edgeId);
	
	// Llamar a la función de eliminación
  // Llama a la función definida más abajo
  onEdgeDelete(edgeId);
}

// Hover effects para conexiones
function onEdgeMouseEnter({ edge }: { edge: Edge }) {
	// Podrías agregar efectos visuales aquí si quisieras
	console.log('Mouse enter en conexión:', edge.id);
}

function onEdgeMouseLeave({ edge }: { edge: Edge }) {
	// Podrías agregar efectos visuales aquí si quisieras  
	console.log('Mouse leave en conexión:', edge.id);
}

// Función para eliminar una conexión
function deleteEdge(edgeId: string) {
	console.log('Eliminando conexión:', edgeId);
	
	const edgeIndex = edges.value.findIndex(e => e.id === edgeId);
	if (edgeIndex !== -1) {
		const edgeToDelete = edges.value[edgeIndex];
		const sourceNode = nodes.value.find(n => n.id === edgeToDelete.source);
		const targetNode = nodes.value.find(n => n.id === edgeToDelete.target);
		const sourceLabel = sourceNode?.label || sourceNode?.type || 'Nodo';
		const targetLabel = targetNode?.label || targetNode?.type || 'Nodo';
		
		// Remover la conexión
		edges.value.splice(edgeIndex, 1);
		
		// Si la conexión eliminada era la seleccionada, limpiar selección
		if (selectedEdgeId.value === edgeId) {
			selectedEdgeId.value = null;
			selectedEdge.value = null;
		}
		
		// Mostrar notificación
		showWarning('Conexión eliminada', {
			description: `Se eliminó la conexión de "${sourceLabel}" a "${targetLabel}"`,
			duration: 4000
		});
		
		// Ejecutar validaciones después de eliminar la conexión
		setTimeout(() => runNodeValidations(false), 100);
		
		triggerAutoSave();
	}
}

// ===== FIN FUNCIONES DE CONEXIONES =====

function onNodeContextMenu({ event }: { event: MouseEvent; node: Node }) {
	// Deshabilitar el menú contextual - ahora usamos toolbar en cada nodo
	event.preventDefault();
	event.stopPropagation();
	
	// No mostrar el menú contextual
	return;
}

// Estado para el diálogo de eliminación de nodo
const showDeleteNodeDialog = ref(false);
const nodeToDelete = ref<ExtendedNode | null>(null);
const nodeIndexToDelete = ref<number>(-1);

// Estado para el diálogo de eliminación de conexión
const showDeleteEdgeDialog = ref(false);
const edgeToDelete = ref<Edge | null>(null);

// Estado para el diálogo de confirmación de publicación
const showPublishDialog = ref(false);

// Estados para el test del flujo
const showTestChecklistDialog = ref(false);
const showTestResultsModal = ref(false);
const testChecklistItems = ref<ChecklistItem[]>([
	{ id: 1, text: 'Validando estructura del flujo', completed: false },
	{ id: 2, text: 'Verificando nodos START y END', completed: false },
	{ id: 3, text: 'Comprobando conexiones', completed: false },
	{ id: 4, text: 'Ejecutando validaciones de negocio', completed: false },
	{ id: 5, text: 'Simulando flujo de datos', completed: false },
	{ id: 6, text: 'Generando reporte de resultados', completed: false }
]);
const testResults = ref<TestResults | null>(null);
// Eliminar variables no usadas

// Estados para el wizard del simulador
const showWizardModal = ref(false);
const wizardSteps = ref<WizardStep[]>([]);
const currentWizardStep = ref(0);
const wizardCompleted = ref(false);
const wizardZoomLevel = ref(1.0); // Nivel de zoom para el contenido del wizard (100% = tamaño natural)
const wizardOutputData = ref<Record<string, any>>({}); // Almacenar datos de salida de todos los pasos
// @ts-ignore - usado en template
const currentExternalComponentRef = ref<any>(null); // Referencia al componente externo actual
interface WizardStep {
	id: string;
	nodeId: string;
	title: string;
	type: 'view' | 'process';
	component: string;
	description: string;
	completed: boolean;
	nodeData?: any; // Datos del nodo original para acceder al ícono
	componentData?: {
		customTypeId?: string;
		componentVersion?: string;
		[key: string]: any;
	}; // Datos adicionales para componentes externos
}

// Proveer funciones a los componentes hijos
provide('deleteNode', onNodeDelete);
provide('copyNode', onNodeCopy);
provide('duplicateNode', onNodeDuplicate);
provide('menuNode', onNodeMenu);

console.log('FlowCanvas: Funciones provistas a componentes hijos');

// Funciones para manejar eventos de la toolbar
function onNodeDelete(nodeId: string) {
	console.log('FlowCanvas: onNodeDelete recibido con nodeId:', nodeId);
	const nodeIndex = nodes.value.findIndex((n) => n.id === nodeId);
	console.log('FlowCanvas: nodeIndex encontrado:', nodeIndex);
	if (nodeIndex !== -1) {
		// Guardar referencia del nodo e índice para usarlo cuando se confirme la eliminación
		nodeToDelete.value = nodes.value[nodeIndex] as ExtendedNode;
		nodeIndexToDelete.value = nodeIndex;
		
		console.log('FlowCanvas: Mostrando diálogo de confirmación');
		// Mostrar diálogo de confirmación
		showDeleteNodeDialog.value = true;
	} else {
		console.log('FlowCanvas: No se encontró el nodo con ID:', nodeId);
	}
}

function confirmDeleteNode() {
	console.log('🗑️ FlowCanvas: confirmDeleteNode llamado');
	console.log('🗑️ FlowCanvas: nodeToDelete =', nodeToDelete.value);
	console.log('🗑️ FlowCanvas: nodeIndexToDelete =', nodeIndexToDelete.value);
	
	if (!nodeToDelete.value || nodeIndexToDelete.value === -1) {
		console.warn('🗑️ FlowCanvas: No hay nodo para eliminar o índice inválido');
		return;
	}
	
	// Obtener datos antes de eliminar
	const nodeLabel = nodeToDelete.value.label || nodeToDelete.value.type || 'Nodo';
	const deletedNode = nodeToDelete.value;
	const nodeIndex = nodeIndexToDelete.value;
	
	console.log('🗑️ FlowCanvas: Eliminando nodo:', nodeLabel, 'en índice:', nodeIndex);
	
	// Eliminar el nodo
	nodes.value.splice(nodeIndex, 1);
	
	// Si el nodo eliminado era el seleccionado, limpiar selección
	if (selectedNodeId.value === deletedNode.id) {
		selectedNodeId.value = null;
		selectedNode.value = null;
	}
	
	// Mostrar notificación de eliminación
	showWarning('Nodo eliminado', {
		description: `Se eliminó el nodo "${nodeLabel}" del flujo`,
		duration: 4000
	});
	
	// Ejecutar validaciones después de eliminar el nodo
	setTimeout(() => runNodeValidations(false), 100); // Sin notificaciones al eliminar
	
	// Resetear variables
	nodeToDelete.value = null;
	nodeIndexToDelete.value = -1;
	
	// Guardar estado
	triggerAutoSave();
}

// Función de depuración para probar desde la consola
(window as any).testNodeDeletion = (nodeId?: string) => {
	console.log('Probando eliminación de nodo...');
	console.log('Nodos disponibles:', nodes.value.map(n => ({ id: n.id, type: n.type, label: n.label })));
	
	const targetNodeId = nodeId || (nodes.value.length > 0 ? nodes.value[0].id : null);
	if (targetNodeId) {
		console.log('Intentando eliminar nodo:', targetNodeId);
		onNodeDelete(targetNodeId);
	} else {
		console.log('No hay nodos para eliminar');
	}
};

// Función para debug de nodos desde la consola
(window as any).debugNodes = () => {
	console.log('=== DEBUG: Todos los nodos ===');
	nodes.value.forEach((node, index) => {
		console.log(`Nodo ${index + 1}:`, {
			id: node.id,
			type: node.type,
			label: node.label,
			dataLabel: node.data?.label,
			position: node.position,
			data: node.data
		});
	});
	console.log('=== FIN DEBUG ===');
	return nodes.value;
};

// Función para debug del wizard desde la consola
(window as any).debugWizard = () => {
	console.log('=== DEBUG: Creando wizard de prueba ===');
  createWizardFromFlow();
	console.log('Pasos del wizard:', wizardSteps.value);
	return wizardSteps.value;
};

// Función para debug de datos de salida desde la consola
(window as any).debugWizardOutput = () => {
	console.log('=== DEBUG: Datos de salida del wizard ===');
	console.log('Todos los datos:', wizardOutputData.value);
  console.log('Parámetros de tiempo:', extractTimeParameters());
	console.log('Todos los parámetros:', getAllOutputParameters());
	return wizardOutputData.value;
};

// Función para simular datos de salida desde la consola
(window as any).simulateOutputData = (stepId?: string) => {
	const targetStepId = stepId || `step-${currentWizardStep.value + 1}`;
	const simulatedData = {
		sessionId: `sim-${Date.now()}`,
		componentId: 'landing',
		timestamp: new Date().toISOString(),
		outputParameters: {
			horaInicio: new Date().toISOString(),
			horaFin: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutos después
			resultado: 'completado',
			datosCapturados: {
				nombre: 'Usuario Test',
				email: 'test@example.com'
			}
		},
		allData: {
			action: 'form_completed',
			status: 'success'
		}
	};
	
	console.log('🧪 Simulando datos de salida para paso:', targetStepId);
	console.log('📤 Datos simulados:', simulatedData);
	
	// Simular el evento
  nextWizardStep(simulatedData);
	
	return simulatedData;
};

console.log('Funciones de debug disponibles:');
console.log('- window.testNodeDeletion() - Probar eliminación de nodo');
console.log('- window.debugNodes() - Ver todos los nodos');
console.log('- window.debugWizard() - Crear y ver wizard de prueba');
console.log('- window.debugWizardOutput() - Ver datos de salida del wizard');
console.log('- window.simulateOutputData() - Simular datos de salida');

function cancelDeleteNode() {
	console.log('❌ FlowCanvas: cancelDeleteNode llamado');
	nodeToDelete.value = null;
	nodeIndexToDelete.value = -1;
	showDeleteNodeDialog.value = false;
}

// Funciones para eliminar conexiones
function onEdgeDelete(edgeId: string) {
	console.log('🗑️ FlowCanvas: onEdgeDelete ejecutado para edge:', edgeId);
	const edgeIndex = edges.value.findIndex(e => e.id === edgeId);
	if (edgeIndex === -1) {
		console.warn('Edge no encontrado para eliminar:', edgeId);
		return;
	}
	
	const edge = edges.value[edgeIndex];
	console.log('🗑️ FlowCanvas: Configurando diálogo para edge:', edge);
	edgeToDelete.value = edge;
	showDeleteEdgeDialog.value = true;
	console.log('🗑️ FlowCanvas: showDeleteEdgeDialog.value =', showDeleteEdgeDialog.value);
}

function confirmDeleteEdge() {
	if (!edgeToDelete.value) return;
	
	// Obtener datos antes de eliminar
	const deletedEdge = edgeToDelete.value;
	
	// Encontrar los nodos conectados para la descripción
	const sourceNode = nodes.value.find(n => n.id === deletedEdge.source);
	const targetNode = nodes.value.find(n => n.id === deletedEdge.target);
	const sourceLabel = sourceNode?.label || sourceNode?.type || deletedEdge.source;
	const targetLabel = targetNode?.label || targetNode?.type || deletedEdge.target;
	
	// Eliminar la conexión
	edges.value = edges.value.filter(e => e.id !== deletedEdge.id);
	
	// Si la conexión eliminada era la seleccionada, limpiar selección
	if (selectedEdgeId.value === deletedEdge.id) {
		selectedEdgeId.value = null;
		selectedEdge.value = null;
		showingProjectProps.value = false;
	}
	
	// Mostrar notificación de eliminación
	showWarning('Conexión eliminada', {
		description: `Se eliminó la conexión de "${sourceLabel}" a "${targetLabel}"`,
		duration: 4000
	});
	
	// Ejecutar validaciones después de eliminar la conexión
	setTimeout(() => runNodeValidations(false), 100);
	
	// Resetear variables
	edgeToDelete.value = null;
	showDeleteEdgeDialog.value = false;
	
	// Guardar estado
	triggerAutoSave();
}

function cancelDeleteEdge() {
	edgeToDelete.value = null;
	showDeleteEdgeDialog.value = false;
}

function getEdgeDeleteMessage(): string {
	if (!edgeToDelete.value) return '¿Estás seguro de que deseas eliminar esta conexión?';
	
	const sourceNode = nodes.value.find(n => n.id === edgeToDelete.value!.source);
	const targetNode = nodes.value.find(n => n.id === edgeToDelete.value!.target);
	
	const sourceName = sourceNode?.label || sourceNode?.type || 'Nodo origen';
	const targetName = targetNode?.label || targetNode?.type || 'Nodo destino';
	
	return `¿Estás seguro de que deseas eliminar la conexión entre "${sourceName}" y "${targetName}"?`;
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

function onNodeMenu(_event: MouseEvent, node: any) {
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
				// Asegurar que las conexiones tengan las propiedades necesarias
				edges.value = data.edges.map((edge: any) => ({
					...edge,
					animated: edge.animated !== undefined ? edge.animated : true,
					type: edge.type || 'default',
					selectable: edge.selectable !== undefined ? edge.selectable : true,
					focusable: edge.focusable !== undefined ? edge.focusable : true,
					deletable: edge.deletable !== undefined ? edge.deletable : true,
				}));
				
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

// Función para ejecutar test del flujo
function testFlow() {
	console.log('Iniciando test del flujo...');
	
	// Validaciones rápidas previas
	const startNodes = nodes.value.filter(n => n.type === 'start');
	const endNodes = nodes.value.filter(n => n.type === 'end');
	
	if (startNodes.length === 0) {
		showDanger('Error en el test', {
			title: 'Nodo START requerido',
			description: 'El flujo debe tener al menos un nodo START para poder ejecutar el test.',
			duration: 6000
		});
		return;
	}
	
	if (endNodes.length === 0) {
		showDanger('Error en el test', {
			title: 'Nodo END requerido',
			description: 'El flujo debe tener al menos un nodo END para poder ejecutar el test.',
			duration: 6000
		});
		return;
	}
	
	// Resetear checklist y mostrar diálogo
	testChecklistItems.value.forEach(item => item.completed = false);
	showTestChecklistDialog.value = true;
	
	// Ejecutar checklist animado
	runTestChecklist();
}

// Función para ejecutar el checklist animado
function runTestChecklist() {
	// Reiniciar estado de cancelación
	testCancelled.value = false;
	testTimeouts = [];
	
	let currentIndex = 0;
	const interval = 400; // 400ms entre cada item (6 items * 400ms = 2.4 segundos)
	
	const checkNextItem = () => {
		// Verificar si el test fue cancelado
		if (testCancelled.value) {
			console.log('Test cancelado, deteniendo checklist');
			return;
		}
		
		if (currentIndex < testChecklistItems.value.length) {
			testChecklistItems.value[currentIndex].completed = true;
			currentIndex++;
			
			if (currentIndex < testChecklistItems.value.length) {
				const timeoutId = window.setTimeout(checkNextItem, interval);
				testTimeouts.push(timeoutId);
			} else {
				// Todos los items completados, esperar un momento y mostrar resultados
				const timeoutId = window.setTimeout(() => {
					// Verificar nuevamente si fue cancelado antes de mostrar resultados
					if (!testCancelled.value) {
						showTestChecklistDialog.value = false;
						showTestResults();
					}
				}, 600);
				testTimeouts.push(timeoutId);
			}
		}
	};
	
	// Iniciar el checklist después de un pequeño delay
	const initialTimeoutId = window.setTimeout(checkNextItem, 300);
	testTimeouts.push(initialTimeoutId);
}

// Función para mostrar los resultados del test (ahora inicia el simulador wizard)
function showTestResults() {
	// Ejecutar las validaciones reales
	const isValid = runNodeValidations(false);
	
	if (!isValid) {
		// Si hay errores de validación, mostrar la modal de errores tradicional
		const startNodes = nodes.value.filter(n => n.type === 'start');
		const endNodes = nodes.value.filter(n => n.type === 'end');
		
		testResults.value = {
			isValid,
			summary: {
				totalNodes: nodes.value.length,
				totalConnections: edges.value.length,
				startNodes: startNodes.length,
				endNodes: endNodes.length,
				validationsPassed: 'Con advertencias'
			},
			details: {
				nodeTypes: [...new Set(nodes.value.map(n => n.type))],
				hasCircularDependencies: false,
				executionPath: `START → ${nodes.value.length - 2} nodos → END`,
				estimatedRuntime: '~2.3 segundos'
			},
			status: 'warning'
		};
		
		showTestResultsModal.value = true;
		return;
	}
	
	// Si es válido, crear y mostrar el wizard del simulador
	createWizardFromFlow();
	showWizardModal.value = true;
}

// Función para crear el wizard basado en el flujo de nodos
function createWizardFromFlow() {
	console.log('Creando wizard desde el flujo de nodos...');
	
	// DEBUGGING: Imprimir todos los nodos para ver sus labels exactas
	console.log('=== DEBUGGING: Todos los nodos en el flujo ===');
	nodes.value.forEach((node, index) => {
		console.log(`Nodo ${index + 1}:`, {
			id: node.id,
			type: node.type,
			label: node.label,
			dataLabel: node.data?.label,
			position: node.position
		});
	});
	console.log('=== FIN DEBUGGING ===');
	
	// Mapeo de tipos de nodos a vistas
	const nodeViewMapping: Record<string, { title: string; component: string; description: string }> = {
		'start': {
			title: 'Inicio',
			component: 'NodoInicialView',
			description: 'Inicialización del trámite'
		},
		'processNode': {
			title: 'Proceso',
			component: 'ProcessView',
			description: 'Vista de proceso'
		},
		'end': {
			title: 'Fin',
			component: 'CompletionView',
			description: 'Proceso completado exitosamente'
		}
	};
	
	// Mapeo específico por label para processNodes
	const processNodeMapping: Record<string, { title: string; component: string; description: string }> = {
		'INE': {
			title: 'Identificación (INE)',
			component: 'INECaptureView',
			description: 'Captura de fotografía de identificación oficial'
		},
		'Captura Rápida': {
			title: 'Captura Rápida',
			component: 'QuickCaptureView',
			description: 'Captura rápida de datos básicos'
		},
		'Captura rapida': {
			title: 'Captura Rápida',
			component: 'QuickCaptureView',
			description: 'Captura rápida de datos básicos'
		},
		'Firma': {
			title: 'Firma Digital',
			component: 'SignatureView',
			description: 'Captura de firma digital con cursor'
		},
		'Captura completa': {
			title: 'Datos Personales',
			component: 'PersonalDataView',
			description: 'Captura de información personal completa'
		},
		'Captura Completa': {
			title: 'Datos Personales',
			component: 'PersonalDataView',
			description: 'Captura de información personal completa'
		},
		'Captura telefonos': {
			title: 'Números Telefónicos',
			component: 'PhoneNumbersView',
			description: 'Captura de números telefónicos de contacto'
		},
		'Captura Telefonos': {
			title: 'Números Telefónicos',
			component: 'PhoneNumbersView',
			description: 'Captura de números telefónicos de contacto'
		},
		'Captura Teléfonos': {
			title: 'Números Telefónicos',
			component: 'PhoneNumbersView',
			description: 'Captura de números telefónicos de contacto'
		},
		'Alta Producto': {
			title: 'Producto Asignado',
			component: 'ProductAssignmentView',
			description: 'Visualización de tarjeta de crédito asignada'
		}
	};
	
	// Función para encontrar el siguiente nodo en el flujo
	function findNextNode(currentNodeId: string, visitedNodes: Set<string>): Node | null {
		// Buscar conexiones que salgan del nodo actual
		const outgoingEdges = edges.value.filter(edge => edge.source === currentNodeId);
		
		for (const edge of outgoingEdges) {
			const nextNode = nodes.value.find(node => node.id === edge.target);
			if (nextNode && !visitedNodes.has(nextNode.id)) {
				return nextNode;
			}
		}
		
		return null;
	}
	
	// Función para construir la secuencia del flujo siguiendo las conexiones
	function buildFlowSequence(): Node[] {
		const sequence: Node[] = [];
		const visitedNodes = new Set<string>();
		
		// Encontrar el nodo START
		const startNode = nodes.value.find(node => node.type === 'start');
		if (!startNode) {
			console.warn('No se encontró nodo START en el flujo');
			return [];
		}
		
		// Comenzar desde el nodo START
		let currentNode: Node | null = startNode;
		
		while (currentNode) {
			// Solo agregar nodos que representen vistas del usuario (omitir engineNodes)
			if (currentNode.type === 'start' || currentNode.type === 'processNode' || currentNode.type === 'end') {
				sequence.push(currentNode);
			}
			
			visitedNodes.add(currentNode.id);
			currentNode = findNextNode(currentNode.id, visitedNodes);
			
			// Evitar bucles infinitos
			if (sequence.length > 20) {
				console.warn('Secuencia muy larga, posible bucle detectado');
				break;
			}
		}
		
		console.log('Secuencia del flujo construida:', sequence.map(n => ({ 
			id: n.id, 
			type: n.type, 
			label: n.data?.label || n.label 
		})));
		
		return sequence;
	}
	
	// Construir la secuencia correcta del flujo
	const flowSequence = buildFlowSequence();
	
	// Crear los pasos del wizard basados en la secuencia del flujo
	const steps: WizardStep[] = [];
	
	flowSequence.forEach((node, index) => {
		let stepInfo;
		
		console.log(`Procesando nodo ${index + 1}:`, {
			id: node.id,
			type: node.type,
			label: node.label,
			dataLabel: node.data?.label,
			allData: node.data
		});
		
		if (node.type === 'processNode') {
			// Para processNodes, usar el mapeo específico basado en el label para el componente y descripción
			const nodeLabel = node.data?.label || node.label || 'Proceso';
			console.log(`Buscando mapeo para label: "${nodeLabel}"`);
			
			// Verificar si es un componente externo
			if (node.data?.customTypeId) {
				console.log(`Detectado componente externo con customTypeId: ${node.data.customTypeId}`);
				stepInfo = {
					title: nodeLabel,
					component: 'IframeMicrofrontendView', // Cambiar a usar iframe
					description: 'Microfrontend cargado via iframe',
					// Pasar información adicional para cargar el componente externo
					componentData: {
						customTypeId: node.data.customTypeId,
						componentVersion: node.data.componentVersion || '1.0.0'
					}
				};
			} else {
				const mapping = processNodeMapping[nodeLabel];
				if (mapping) {
					console.log(`Mapeo encontrado:`, mapping);
					stepInfo = {
						title: nodeLabel, // Usar el label original del nodo como título
						component: mapping.component,
						description: mapping.description
					};
				} else {
					console.warn(`No se encontró mapeo para el label: "${nodeLabel}". Labels disponibles:`, Object.keys(processNodeMapping));
					stepInfo = {
						title: nodeLabel, // Usar el label original como título
						component: 'ProcessView',
						description: 'Vista de proceso'
					};
				}
			}
		} else {
			// Para start y end, usar el label del nodo como título
			const nodeLabel = node.data?.label || node.label || node.type;
			const mapping = nodeViewMapping[node.type as keyof typeof nodeViewMapping];
			
			stepInfo = {
				title: nodeLabel, // Usar el label original del nodo como título
				component: mapping ? mapping.component : 'DefaultView',
				description: mapping ? mapping.description : 'Vista por defecto'
			};
		}
		
		steps.push({
			id: `step-${index + 1}`,
			nodeId: node.id,
			title: stepInfo.title,
			type: 'view',
			component: stepInfo.component,
			description: stepInfo.description,
			completed: false,
			nodeData: node.data, // Incluir datos del nodo para acceder al ícono
			componentData: (stepInfo as any).componentData // Incluir datos adicionales para componentes externos si existen
		});
	});
	
	console.log('Pasos del wizard creados en orden correcto:', steps);
	
   // Filtrar el paso de INICIO si existe (por label o tipo)
   let startIndex = 0;
   if (steps.length > 0 && (steps[0].title?.toUpperCase() === 'INICIO' || steps[0].component === 'NodoInicialView')) {
	   startIndex = 1;
   }
   const filteredSteps = steps.slice(startIndex);
   console.log('Pasos del wizard creados en orden correcto (sin INICIO):', filteredSteps);
   // Configurar el estado del wizard
   wizardSteps.value = filteredSteps;
   currentWizardStep.value = 0;
   wizardCompleted.value = false;
}

// Función para cerrar la modal de resultados
function closeTestResults() {
	showTestResultsModal.value = false;
	testResults.value = null;
}

// Funciones para controlar el wizard
function nextWizardStep(outputData?: any) {
	const currentStep = wizardSteps.value[currentWizardStep.value];
	
	// Almacenar datos de salida si se proporcionan
	if (outputData && currentStep) {
		wizardOutputData.value[currentStep.id] = outputData;
		console.log(`📋 Datos almacenados para paso ${currentStep.id}:`, outputData);
		
		// Log específico para parámetros de tiempo
		if (outputData.outputParameters?.horaInicio || outputData.outputParameters?.horaFin) {
			console.log(`⏰ Parámetros de tiempo capturados:`, {
				horaInicio: outputData.outputParameters.horaInicio,
				horaFin: outputData.outputParameters.horaFin
			});
		}
	}
	
	if (currentWizardStep.value < wizardSteps.value.length - 1) {
		// Marcar el paso actual como completado
		wizardSteps.value[currentWizardStep.value].completed = true;
		
		// Avanzar al siguiente paso
		currentWizardStep.value++;
		
		console.log(`Avanzando al paso ${currentWizardStep.value + 1}:`, wizardSteps.value[currentWizardStep.value]);
	} else {
		// Último paso completado
		wizardSteps.value[currentWizardStep.value].completed = true;
		wizardCompleted.value = true;
		
		// Log de todos los datos capturados
		console.log('🎉 Wizard completado con todos los datos:');
		console.log('📊 Resumen de datos capturados:', wizardOutputData.value);
		console.log('⏰ Todos los parámetros de tiempo:', extractTimeParameters());
	}
}

function previousWizardStep() {
	if (currentWizardStep.value > 0) {
		currentWizardStep.value--;
		console.log(`Retrocediendo al paso ${currentWizardStep.value + 1}:`, wizardSteps.value[currentWizardStep.value]);
	}
}

function closeWizard() {
	showWizardModal.value = false;
	currentWizardStep.value = 0;
	wizardCompleted.value = false;
	wizardSteps.value = [];
	wizardOutputData.value = {}; // Limpiar datos de salida
	
	console.log('Wizard cerrado y reseteado');
}

// function restartWizard() {
// 	currentWizardStep.value = 0;
// 	wizardCompleted.value = false;
// 	wizardOutputData.value = {}; // Limpiar datos de salida
// 	
// 	// Resetear todos los pasos como no completados
// 	wizardSteps.value.forEach(step => {
// 		step.completed = false;
// 	});
// 	
// 	console.log('Wizard reiniciado');
// }

// Funciones auxiliares para manejo de datos
function extractTimeParameters() {
	const timeParams: any = {};
	
	Object.values(wizardOutputData.value).forEach((stepData: any) => {
		if (stepData?.outputParameters?.horaInicio) {
			timeParams.horaInicio = stepData.outputParameters.horaInicio;
		}
		if (stepData?.outputParameters?.horaFin) {
			timeParams.horaFin = stepData.outputParameters.horaFin;
		}
	});
	
	return timeParams;
}

function getAllOutputParameters() {
	const allParams: any = {};
	
	Object.entries(wizardOutputData.value).forEach(([stepId, stepData]: [string, any]) => {
		if (stepData?.outputParameters) {
			allParams[stepId] = stepData.outputParameters;
		}
	});
	
	return allParams;
}

// Función para generar IDs únicos
function generateId() {
	return 'sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Funciones para el panel de variables
function getSessionData() {
	return {
		sessionId: generateId(), // Podríamos usar un ID de sesión real si está disponible
		userId: 'user-demo', // Podríamos usar un ID de usuario real
		startTime: new Date().toISOString() // Tiempo de inicio de la sesión del wizard
	};
}

function getCurrentStepData() {
	const currentStep = wizardSteps.value[currentWizardStep.value];
	if (!currentStep) return {};
	
	return {
		component: currentStep.component,
		stepId: currentStep.id,
		startTime: new Date().toISOString(), // Podríamos rastrear cuándo se inició este paso
		lastInteraction: new Date().toISOString() // Última interacción del usuario
	};
}

// Manejadores de eventos del wizard
function handleComponentReady(event: any) {
	console.log('🎉 Componente del wizard listo:', event);
	
	// Si es un componente externo, almacenar la referencia
	if (wizardSteps.value[currentWizardStep.value]?.component === 'IframeMicrofrontendView') {
		console.log('📝 Microfrontend iframe del wizard está listo');
	}
}

function handleComponentError(event: any) {
	console.error('🚨 Error en componente del wizard:', event);
	showDanger('Error en el componente', {
		title: 'Error del componente',
		description: event?.message || 'Se produjo un error en el componente externo',
		duration: 6000
	});
}

// Funciones auxiliares para la pantalla de completado
function formatDateTime(dateString: string) {
	if (!dateString) return 'N/A';
	
	try {
		const date = new Date(dateString);
		return date.toLocaleString('es-ES', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	} catch (error) {
		return dateString; // Devolver el string original si no se puede parsear
	}
}

function getStepTitle(stepId: string) {
	const step = wizardSteps.value.find(s => s.id === stepId);
	return step?.title || stepId;
}



// Definir componentes para el sistema de Wizard
const wizardComponents = {
  ProcessView,
  ExternalComponentView,
  SimpleExternalComponentView,
  IframeMicrofrontendView
};

// Función para verificar si un componente existe
function componentExists(componentName: string): boolean {
	return componentName in wizardComponents;
}

// Función para cancelar el test en progreso
function cancelTestFlow() {
	console.log('Test cancelado por el usuario');
	
	// Marcar como cancelado
	testCancelled.value = true;
	
	// Limpiar todos los timeouts pendientes
	testTimeouts.forEach(timeoutId => {
		clearTimeout(timeoutId);
	});
	testTimeouts = [];
	
	// Cerrar diálogo
	showTestChecklistDialog.value = false;
	
	// Resetear items del checklist para futuro uso
	testChecklistItems.value = [
		{ id: 1, text: 'Validando estructura del flujo', completed: false },
		{ id: 2, text: 'Verificando nodos START y END', completed: false },
		{ id: 3, text: 'Comprobando conexiones', completed: false },
		{ id: 4, text: 'Ejecutando validaciones de negocio', completed: false },
		{ id: 5, text: 'Simulando flujo de datos', completed: false },
		{ id: 6, text: 'Generando reporte de resultados', completed: false }
	];
	
	showInfo('Test cancelado', {
		description: 'El proceso de validación ha sido cancelado.',
		duration: 3000
	});
}

// Función para publicar el flujo
function publishFlow() {
	console.log('Solicitando confirmación para publicar flujo...');
	
	// Mostrar diálogo de confirmación antes de publicar
	showPublishDialog.value = true;
}

// Función para confirmar la publicación
function confirmPublishFlow() {
	console.log('Confirmando publicación del flujo...');
	
	// Validar que el flujo esté completo antes de publicar
	const isValid = runNodeValidations(false);
	
	if (!isValid) {
		showDanger('Error al publicar', {
			title: 'Flujo incompleto',
			description: 'El flujo tiene errores de validación que deben corregirse antes de publicar.',
			duration: 6000,
			actions: [
				{
					label: 'Ejecutar test',
					action: () => testFlow(),
					style: 'primary'
				}
			]
		});
		return;
	}
	
	// Simular proceso de publicación
	showInfo('Publicando flujo...', {
		title: 'Proceso de publicación',
		description: 'Preparando el flujo para publicación...',
		duration: 2000
	});
	
	// Simular delay de publicación
	setTimeout(() => {
		// Crear nueva versión automáticamente al publicar
		const newVersion = createNewVersion();
		
		showSuccess('Flujo publicado exitosamente', {
			title: 'Publicación completada',
			description: `El flujo "${projectProperties.value.name}" v${newVersion} ha sido publicado correctamente.`,
			duration: 5000,
			actions: [
				{
					label: 'Ver detalles',
					action: () => {
						console.log('Flujo publicado:', {
							name: projectProperties.value.name,
							nodes: nodes.value.length,
							edges: edges.value.length,
							publishedAt: new Date().toISOString()
						});
					},
					style: 'primary'
				}
			]
		});
		
		// Actualizar fecha de actualización
		projectProperties.value.updatedAt = new Date().toLocaleDateString();
		triggerAutoSave();
	}, 2500);
}

// Función para cancelar la publicación
function cancelPublishFlow() {
	showPublishDialog.value = false;
}

// Función para manejar cambio de versión
function onVersionChange() {
	console.log('Cambiando a versión:', selectedVersion.value);
	
	showInfo('Cambiando versión', {
		title: 'Versión del flujo',
		description: `Cambiando a la versión ${selectedVersion.value}`,
		duration: 3000
	});
	
	// Aquí podrías implementar la lógica para cargar una versión específica
	// Por ejemplo, cargar desde localStorage con un key que incluya la versión
	// loadVersionFromLocalStorage(selectedVersion.value);
	
	// Actualizar propiedades del proyecto con la nueva versión
	if (!projectProperties.value.version) {
		// Si no existe la propiedad version, la agregamos
		projectProperties.value = {
			...projectProperties.value,
			version: selectedVersion.value
		};
	} else {
		projectProperties.value.version = selectedVersion.value;
	}
	
	triggerAutoSave();
}

// Función para crear una nueva versión (llamada desde publishFlow)
function createNewVersion() {
	const currentVersions = flowVersions.value.map(v => v.value);
	const lastVersion = currentVersions[currentVersions.length - 1];
	
	// Generar siguiente versión automáticamente
	const versionParts = lastVersion.split('.').map(Number);
	versionParts[2]++; // Incrementar patch version
	
	const newVersion = versionParts.join('.');
	const newVersionItem = {
		value: newVersion,
		label: `v${newVersion}`
	};
	
	// Agregar nueva versión a la lista
	flowVersions.value.push(newVersionItem);
	selectedVersion.value = newVersion;
	
	console.log('Nueva versión creada:', newVersion);
	return newVersion;
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
	bottom: 0px;
	right: 20px;
	z-index: 3000;
	background: rgba(35, 39, 46, 0.92);
	border-radius: 10px;
	box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.18);
	padding: 6px 6px 2px 6px;
	pointer-events: auto;
	transition: right 0.22s cubic-bezier(0.4, 1.3, 0.6, 1);
}
.minimap-shifted {
	right: 340px !important;
}
.actions-bar {
	position: absolute;
	top: 20px;
	right: 60px;
	z-index: 4000;
	display: flex;
	gap: 10px;
	transition: right 0.22s cubic-bezier(0.4, 1.3, 0.6, 1);
	align-items: center;
}
.actions-bar-shifted {
	right: 380px !important;
}
.actions-bar button,
.actions-bar .import-label {
	background: #23272e;
	color: #fff;
	border: none;
	border-radius: 8px;
	padding: 0;
	margin: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 44px;
	width: 44px;
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

/* Estilos para botones con texto en la toolbar superior */
.actions-bar .text-button {
	display: flex !important;
	align-items: center !important;
	gap: 8px !important;
	padding: 8px 16px !important;
	width: auto !important;
	height: 44px !important;
	font-size: 14px !important;
	font-weight: 500 !important;
	border-radius: 8px !important;
	transition: all 0.2s ease !important;
}

.actions-bar .text-button svg {
	width: 18px !important;
	height: 18px !important;
	flex-shrink: 0 !important;
}

.actions-bar .text-button span {
	color: #fff !important;
	font-weight: 500 !important;
	white-space: nowrap !important;
}

/* Estilos específicos para botón de probar */
.actions-bar .test-button {
	background: #d46f26 !important;
	border: 1px solid #c2b1a5 !important;
}

.actions-bar .test-button:hover {
	background: #e86600 !important;
	box-shadow: 0 2px 8px rgba(255, 107, 0, 0.3) !important;
	
}

/* Estilos específicos para botón de publicar */
.actions-bar .publish-button {
	background: #1a4480 !important;
	border: 1px solid #2196f3 !important;
}

.actions-bar .publish-button:hover {
	background: #2557a6 !important;
	box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3) !important;
}

/* Estilos específicos para botón de limpiar */
.actions-bar .clear-button {
	background: #dc3545 !important;
	border: 1px solid #dc3545 !important;
}

.actions-bar .clear-button:hover {
	background: #c82333 !important;
	box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3) !important;
}

/* Estilos para la toolbar inferior izquierda */
.actions-bar-bottom {
	position: absolute;
	bottom: 20px;
	left: 20px;
	z-index: 4000;
	display: flex;
	gap: 10px;
	align-items: center;
}
.actions-bar-bottom-shifted {
	left: 20px !important; /* Mantener siempre alineada a la izquierda */
}
.actions-bar-bottom button,
.actions-bar-bottom .import-label {
	background: #23272e;
	color: #fff;
	border: none;
	border-radius: 8px;
	padding: 0;
	margin: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 44px;
	width: 44px;
	font-size: 15px;
	cursor: pointer;
	transition: background 0.2s;
	box-sizing: border-box;
}
.actions-bar-bottom button:hover,
.actions-bar-bottom .import-label:hover {
	background: #444b55;
}
.actions-bar-bottom svg {
	display: block;
	margin: 0;
	color: #fff;
	width: 22px;
	height: 22px;
	padding: 0;
}

/* Ocultar los botones de zoom del wizard */
.zoom-controls .zoom-btn {
  display: none;
}
.zoom-controls .zoom-level {
  display: none;
}

/* Estilos para la información de dispositivo en el footer */
.device-info-footer {
  display: flex;
  align-items: center;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

/* Estilos para el dropdown de estilo de conexiones */
.connection-style-dropdown {
	position: relative;
	background: #23272e;
	border-radius: 8px;
	height: 44px;
	display: flex;
	align-items: center;
	padding: 0 12px;
	cursor: pointer;
	transition: background 0.2s;
}

.connection-style-dropdown:hover {
	background: #444b55;
}

.connection-style-select {
	background: transparent;
	color: #fff;
	border: none;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	outline: none;
	appearance: none;
	padding-right: 20px;
	min-width: 70px;
}

.connection-style-select option {
	background: #23272e;
	color: #fff;
	padding: 8px;
}

.dropdown-arrow {
	position: absolute;
	right: 8px;
	top: 50%;
	transform: translateY(-50%);
	pointer-events: none;
	color: #fff;
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

/* Animaciones para conexiones */
@keyframes dash {
	from {
		stroke-dashoffset: 0;
	}
	to {
		stroke-dashoffset: -13;
	}
}

@keyframes dash-selected {
	from {
		stroke-dashoffset: 0;
	}
	to {
		stroke-dashoffset: -13;
	}
}

/* Estilos básicos y funcionales para conexiones */
.vue-flow__edge {
	cursor: pointer !important;
	pointer-events: all !important;
	z-index: 100 !important;
}

.vue-flow__edge-path {
	stroke: #5078ff !important;
	stroke-width: 3px !important;
	fill: none !important;
	cursor: pointer !important;
	animation: dash 2s linear infinite;
	stroke-dasharray: 8 5;
	transition: stroke-width 0.3s ease, stroke 0.3s ease;
	filter: drop-shadow(0 1px 2px rgba(80, 120, 255, 0.3));
	pointer-events: all !important;
	stroke-linecap: round;
	stroke-linejoin: round;
	z-index: 104 !important;
}

.vue-flow__edge svg {
	pointer-events: all !important;
	cursor: pointer !important;
	z-index: 102 !important;
}

.vue-flow__edge g {
	pointer-events: all !important;
	cursor: pointer !important;
	z-index: 103 !important;
}

/* CURSOR ESPECÍFICO - Mayor especificidad para sobrescribir cursor global */
.flow-canvas-wrapper .vue-flow__edge-path {
	cursor: pointer !important;
}

.flow-canvas-wrapper .vue-flow__edge {
	cursor: pointer !important;
}

.flow-canvas-wrapper .vue-flow__edge svg {
	cursor: pointer !important;
}

.flow-canvas-wrapper .vue-flow__edge g {
	cursor: pointer !important;
}

.vue-flow__edge-path:hover {
	stroke: #6b8aff !important;
	stroke-width: 4px !important;
	filter: drop-shadow(0 2px 4px rgba(80, 120, 255, 0.5));
	z-index: 105 !important;
	cursor: pointer !important;
}

.vue-flow__edge.selected .vue-flow__edge-path {
	stroke: #ffd700 !important;
	stroke-width: 5px !important;
	stroke-dasharray: 8 5;
	animation: dash-selected 1.0s linear infinite;
	filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.6));
	cursor: pointer !important;
}

/* Estilo para conexión seleccionada en hover */
.vue-flow__edge.selected .vue-flow__edge-path:hover {
	stroke: #ffed4e !important;
	stroke-width: 6px !important;
	filter: drop-shadow(0 3px 6px rgba(255, 215, 0, 0.8));
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
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
	transform-origin: center center !important;
	position: relative !important;
}

/* Posicionamiento correcto para handlers globales */
.vue-flow__handle[data-handlepos="left"] {
	left: -5px !important; /* Mitad del ancho del handler (10px/2) */
}

.vue-flow__handle[data-handlepos="right"] {
	right: -5px !important; /* Mitad del ancho del handler (10px/2) */
}

.vue-flow__handle:hover {
	background: #6b8aff !important;
	width: 14px !important;
	height: 14px !important;
	border: 3px solid #ffffff !important;
	box-shadow: 0 0 12px rgba(107, 138, 255, 0.8) !important;
	/* Sin transform scale para evitar movimientos */
}

/* Ajustar posición en hover para mantener centrado */
.vue-flow__handle[data-handlepos="left"]:hover {
	left: -7px !important; /* Mitad del ancho hover (14px/2) */
}

.vue-flow__handle[data-handlepos="right"]:hover {
	right: -7px !important; /* Mitad del ancho hover (14px/2) */
}

.vue-flow__handle.connectingfrom,
.vue-flow__handle.connectingto {
	background: #7c9eff !important;
	width: 16px !important;
	height: 16px !important;
	border: 4px solid #ffffff !important;
	box-shadow: 
		0 0 0 3px rgba(124, 158, 255, 0.3),
		0 0 16px rgba(124, 158, 255, 0.8) !important;
}

/* Ajustar posición durante conexión */
.vue-flow__handle[data-handlepos="left"].connectingfrom,
.vue-flow__handle[data-handlepos="left"].connectingto {
	left: -8px !important; /* Mitad del ancho conectando (16px/2) */
}

.vue-flow__handle[data-handlepos="right"].connectingfrom,
.vue-flow__handle[data-handlepos="right"].connectingto {
	right: -8px !important; /* Mitad del ancho conectando (16px/2) */
}

/* Estilos para el diálogo de confirmación */
.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
}

/* Estilos del título del flujo - CSS global para evitar interferencias */
.flow-title-label {
	position: absolute !important;
	top: 20px !important;
	left: 20px !important;
	z-index: 1000 !important;
	color: #fff !important;
	font-size: 1.1rem !important;
	font-weight: 600 !important;
	padding: 0 20px !important;
	height: 44px !important;
	display: flex !important;
	align-items: center !important;
	justify-content: space-between !important;
	background: rgba(35, 39, 46, 0.9) !important;
	border: 1px solid rgba(255, 255, 255, 0.1) !important;
	border-radius: 8px !important;
	backdrop-filter: blur(8px) !important;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
	letter-spacing: 0.3px !important;
	text-align: left !important;
	min-width: 200px !important;
	max-width: 420px !important;
	width: auto !important;
	user-select: none !important;
	pointer-events: auto !important;
	transition: left 0.22s cubic-bezier(0.4, 1.3, 0.6, 1) !important;
	white-space: nowrap !important;
	overflow: hidden !important;
	cursor: default !important;
	gap: 12px !important;
}

.flow-title-collapsed {
	left: 20px !important;
	max-width: 320px !important;
}

/* Estilos para dropdown de versiones en el título */
.version-dropdown-title {
	position: relative;
	display: flex;
	align-items: center;
	background: #2d5016;
	border: 1px solid #4caf50;
	border-radius: 4px;
	height: 28px;
	padding: 0 8px;
	margin-left: 12px;
	min-width: 60px;
	cursor: pointer;
	font-size: 11px;
	font-weight: 600;
	flex-shrink: 0;
}

.version-dropdown-title:hover {
	background: #3d6b1f;
	border-color: #66bb6a;
	box-shadow: 0 1px 4px rgba(76, 175, 80, 0.25);
}

.version-select-title {
	background: transparent;
	border: none;
	color: #fff;
	font-size: 11px;
	font-weight: 600;
	cursor: pointer;
	outline: none;
	appearance: none;
	padding-right: 12px;
	width: 100%;
	letter-spacing: 0.3px;
}

.version-select-title option {
	background: #2d5016;
	color: #fff;
	padding: 4px;
	font-weight: 500;
}

.dropdown-arrow-title {
	position: absolute;
	right: 4px;
	pointer-events: none;
	color: #a5d6a7;
	width: 8px;
	height: 8px;
}

.version-dropdown-title:hover .dropdown-arrow-title {
	color: #c8e6c9;
}

/* Estilos para el checklist del test */
.test-checklist {
	padding: 16px 0;
}

.checklist-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 8px 0;
	transition: all 0.3s ease;
	opacity: 0.6;
}

.checklist-item.completed {
	opacity: 1;
}

.checklist-icon {
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-icon {
	animation: checkmark-appear 0.3s ease-in-out;
}

@keyframes checkmark-appear {
	0% {
		opacity: 0;
		transform: scale(0.8);
	}
	100% {
		opacity: 1;
		transform: scale(1);
	}
}

.loading-spinner {
	width: 16px;
	height: 16px;
	border: 2px solid #e0e0e0;
	border-top: 2px solid #2196f3;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.checklist-text {
	color: #e0e0e0;
	font-size: 14px;
	transition: color 0.3s ease;
}

.checklist-item.completed .checklist-text {
	color: #4caf50;
	font-weight: 500;
}

/* Estilos para la modal de resultados del test */
.test-results-modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 5000;
	backdrop-filter: blur(4px);
}

.test-results-modal {
	background: #2c2c2c;
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
	width: 80%;
	max-width: 900px;
	max-height: 80%;
	overflow: hidden;
	animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideIn {
	0% {
		opacity: 0;
		transform: scale(0.9) translateY(-20px);
	}
	100% {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 24px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	background: #333;
}

.modal-title {
	display: flex;
	align-items: center;
	gap: 12px;
	margin: 0;
	color: #fff;
	font-size: 20px;
	font-weight: 600;
}

.status-icon.success {
	color: #4caf50;
}

.status-icon.warning {
	color: #ff9800;
}

.modal-close-btn {
	background: transparent;
	border: none;
	color: #999;
	cursor: pointer;
	padding: 4px;
	border-radius: 4px;
	transition: all 0.2s ease;
}

.modal-close-btn:hover {
	background: rgba(255, 255, 255, 0.1);
	color: #fff;
}

.modal-content {
	padding: 24px;
	max-height: calc(80vh - 140px);
	overflow-y: auto;
}

.results-summary {
	margin-bottom: 24px;
}

.results-summary h3 {
	color: #fff;
	margin-bottom: 16px;
	font-size: 16px;
	font-weight: 600;
}

.summary-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 12px;
}

.summary-item {
	display: flex;
	justify-content: space-between;
	padding: 8px 12px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 6px;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item .label {
	color: #bbb;
	font-size: 14px;
}

.summary-item .value {
	color: #fff;
	font-weight: 500;
	font-size: 14px;
}

.summary-item .value.success {
	color: #4caf50;
}

.summary-item .value.warning {
	color: #ff9800;
}

.results-details h3 {
	color: #fff;
	margin-bottom: 16px;
	font-size: 16px;
	font-weight: 600;
}

.details-content {
	background: rgba(255, 255, 255, 0.05);
	padding: 16px;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.details-content p {
	color: #e0e0e0;
	margin-bottom: 8px;
	font-size: 14px;
	line-height: 1.5;
}

.details-content strong {
	color: #fff;
	font-weight: 500;
}

.modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	padding: 20px 24px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	background: #333;
}

.btn {
	padding: 8px 16px;
	border-radius: 6px;
	border: none;
	cursor: pointer;
	font-size: 14px;
	font-weight: 500;
	transition: all 0.2s ease;
}

.btn-secondary {
	background: #555;
	color: #fff;
	border: 1px solid #666;
}

.btn-secondary:hover {
	background: #666;
	transform: translateY(-1px);
}

.btn-primary {
	background: linear-gradient(135deg, #1a4480 0%, #2196f3 100%);
	color: #fff;
	border: 1px solid #2196f3;
}

.btn-primary:hover {
	background: linear-gradient(135deg, #2557a6 0%, #42a5f5 100%);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

/* Estilos para el wizard simulador */
.wizard-modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.85);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 6000;
	backdrop-filter: blur(4px);
}

.wizard-modal {
	background: #2c2c2c;
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
	width: 90vw; /* Aumentar el ancho para mejor uso del espacio */
	max-width: 1400px; /* Aumentar el ancho máximo */
	height: 98vh; /* Usar casi toda la altura de la pantalla */
	max-height: 98vh;
	min-height: 800px; /* Asegurar altura mínima adecuada */
	overflow: hidden;
	animation: wizardSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	display: flex;
	flex-direction: column;
}

@keyframes wizardSlideIn {
	0% {
		opacity: 0;
		transform: scale(0.9) translateY(-30px);
	}
	100% {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

.wizard-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 20px; /* Reducir aún más el padding vertical a 8px */
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	background: linear-gradient(135deg, #333 0%, #2a2a2a 100%);
	flex-shrink: 0; /* Evitar que se comprima */
	min-height: 48px; /* Altura mínima controlada */
}

.wizard-title {
	display: flex;
	align-items: center;
	gap: 12px;
	margin: 0;
	color: #fff;
	font-size: 20px; /* Reducir tamaño del título */
	font-weight: 600;
}

.wizard-icon {
	color: #4caf50;
}

.wizard-close-btn {
	background: transparent;
	border: none;
	color: #999;
	cursor: pointer;
	padding: 6px;
	border-radius: 6px;
	transition: all 0.2s ease;
}

.wizard-close-btn:hover {
	background: rgba(255, 255, 255, 0.1);
	color: #fff;
}

.wizard-progress {
	padding: 6px 20px; /* Reducir aún más el padding a 6px */
	background: #333;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	flex-shrink: 0; /* Evitar que se comprima */
	min-height: 42px; /* Altura mínima controlada */
}

.progress-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16px;
}

.zoom-controls {
	display: flex;
	align-items: center;
	gap: 8px;
	background: rgba(255, 255, 255, 0.05);
	padding: 6px 8px;
	border-radius: 6px;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.zoom-btn {
	background: transparent;
	border: none;
	color: #e0e0e0;
	cursor: pointer;
	padding: 4px;
	border-radius: 4px;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.zoom-btn:hover:not(:disabled) {
	background: rgba(255, 255, 255, 0.1);
	color: #4caf50;
}

.zoom-btn:disabled {
	opacity: 0.3;
	cursor: not-allowed;
	transform: none !important;
}

.zoom-level {
	color: #4caf50;
	font-size: 12px;
	font-weight: 600;
	min-width: 35px;
	text-align: center;
}

.progress-bar {
	width: 100%;
	height: 8px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 4px;
	overflow: hidden;
	margin-bottom: 12px;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
	border-radius: 4px;
	transition: width 0.4s ease;
}

.progress-text {
	color: #e0e0e0;
	font-size: 14px;
	font-weight: 500;
}

.wizard-main-content {
	display: flex;
	flex: 1;
	min-height: 0;
	position: relative;
}

.wizard-content {
	   flex: 1;
	   padding: 8px 0 8px 20px; /* Quitar padding derecho para alinear con VariablesPanel */
	   overflow: hidden; /* Cambiar de auto a hidden */
	   min-height: 0; /* Permitir que se comprima */
	   display: flex;
	   flex-direction: column;
	   transition: all 0.3s ease;
	   /* NO aplicar zoom aquí - se aplica solo al componente */
}

/* El panel de variables ya no necesita margin porque está en el flex layout */

.wizard-step {
	height: 100%;
	display: flex;
	flex-direction: column;
	min-height: 0; /* Permitir que se comprima */
	flex: 1; /* Asegurar que use todo el espacio disponible */
}

.step-header {
	   margin-bottom: 0px; /* Reducir aún más el margen */
	   flex-shrink: 0;
	   padding-top: 0px;
	   padding-bottom: 0px;
}

.step-header h3 {
	   color: #fff;
	   font-size: 15px; /* Más pequeño */
	   font-weight: 600;
	   margin-bottom: 2px; /* Menor margen */
	   line-height: 1.1;
}

.step-description {
	   color: #bbb;
	   font-size: 12px; /* Más pequeño */
	   line-height: 1.2;
	   margin: 0;
}

.step-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 0; /* Permitir que se comprima */
	overflow: hidden; /* Evitar scrollbars */
}

.step-notes {
	background: rgba(76, 175, 80, 0.1);
	border: 1px solid rgba(76, 175, 80, 0.3);
	border-radius: 8px;
	padding: 8px 12px; /* Reducir padding */
	margin-bottom: 12px;
	flex-shrink: 0;
}

.note-item {
	display: flex;
	align-items: center;
	gap: 8px;
	color: #e0e0e0;
	font-size: 12px; /* Reducir tamaño de fuente */
	margin-bottom: 4px; /* Reducir margen entre items */
}

.note-item:last-child {
	margin-bottom: 0;
}

.note-icon {
	flex-shrink: 0;
}

.component-container {
	flex: 1;
	display: flex;
	align-items: flex-start;
	justify-content: flex-start;
	min-height: 0;
	overflow: hidden;
	padding: 20px;
}

.step-placeholder {
	text-align: center;
	padding: 40px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	border: 2px dashed rgba(255, 255, 255, 0.2);
	max-width: 500px;
	margin: auto; /* Centrar horizontalmente */
}

.placeholder-icon {
	margin-bottom: 20px;
	opacity: 0.6;
}

.node-icon-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	transform: scale(1.7); /* Hacer el ícono más grande */
}

.step-placeholder h4 {
	color: #fff;
	font-size: 20px;
	margin-bottom: 12px;
}

.step-placeholder p {
	color: #bbb;
	margin-bottom: 8px;
	line-height: 1.5;
}

.component-info {
	color: #999 !important;
	font-size: 14px;
	margin-top: 16px;
}

.component-info code {
	background: rgba(255, 255, 255, 0.1);
	padding: 2px 6px;
	border-radius: 4px;
	font-family: 'Monaco', 'Menlo', monospace;
	color: #4caf50;
}

.wizard-completed {
	text-align: center;
	padding: 40px;
}

.completion-icon {
	margin-bottom: 24px;
}

.wizard-completed h3 {
	color: #4caf50;
	font-size: 28px;
	margin-bottom: 16px;
}

.wizard-completed > p {
	color: #e0e0e0;
	font-size: 16px;
	margin-bottom: 24px;
	line-height: 1.6;
}

.completion-summary {
	background: rgba(76, 175, 80, 0.1);
	border: 1px solid rgba(76, 175, 80, 0.3);
	border-radius: 8px;
	padding: 20px;
	margin-top: 24px;
	text-align: left;
	max-width: 400px;
	margin-left: auto;
	margin-right: auto;
}

.completion-summary p {
	color: #e0e0e0;
	margin-bottom: 8px;
	font-size: 14px;
}

.completion-summary strong {
	color: #4caf50;
}

.output-data-summary {
	background: rgba(33, 150, 243, 0.1);
	border: 1px solid rgba(33, 150, 243, 0.3);
	border-radius: 8px;
	padding: 16px;
	margin: 20px 0;
	text-align: left;
	max-width: 600px;
	margin-left: auto;
	margin-right: auto;
	max-height: 300px;
	overflow-y: auto;
}

.output-data-summary h4 {
	color: #2196F3;
	font-size: 16px;
	margin-bottom: 12px;
	margin-top: 0;
}

.output-data-summary h5 {
	color: #fff;
	font-size: 14px;
	margin: 12px 0 6px 0;
	padding-bottom: 4px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.time-params, .step-params {
	margin-bottom: 16px;
}

.step-data {
	margin-bottom: 12px;
	padding-bottom: 8px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.step-data:last-child {
	border-bottom: none;
	margin-bottom: 0;
}

.params-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 4px;
	margin-left: 12px;
}

.param-item {
	color: #e0e0e0;
	font-size: 12px;
	padding: 2px 0;
}

.param-item strong {
	color: #4caf50;
	margin-right: 8px;
}

.param-item span {
	font-family: monospace;
	background: rgba(255, 255, 255, 0.1);
	padding: 1px 4px;
	border-radius: 3px;
	font-size: 11px;
}

/* Footer siempre visible y por encima de otros elementos */
.wizard-footer {
   padding: 8px 20px;
   border-top: 1px solid rgba(255, 255, 255, 0.1);
   background: #333;
   flex-shrink: 0;
   position: fixed;
   left: 0;
   right: 0;
   bottom: 0;
   z-index: 100;
   width: 100vw;
   height: 30px;
   box-shadow: 0 -2px 12px 0 rgba(0,0,0,0.18);
}
.wizard-footer-flex {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 12px;
   position: relative;
   width: 100%;
   max-width: 1400px;
   margin: 0 auto;
}
.zoom-controls-center {
   position: absolute;
   left: 40%;
   top: 60%;
   transform: translate(-50%, -50%);
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 8px;
   z-index: 10;
   background: rgba(34,34,34,0.98);
   border-radius: 8px;
   box-shadow: 0 2px 8px 0 rgba(0,0,0,0.18);
   padding: 6px 16px;
   border: 1px solid rgba(255,255,255,0.08);
}

.wizard-footer-right {
	display: flex;
	gap: 12px;
	padding-right: 32px;
}

.wizard-footer .btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none !important;
}

.wizard-footer .btn:disabled:hover {
	transform: none !important;
	box-shadow: none !important;
}
</style>
