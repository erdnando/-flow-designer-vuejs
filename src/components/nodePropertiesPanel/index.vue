<template>
	<div
		class="node-properties-panel"
		:class="[{ collapsed }, { disabled: disabled && !showProject }]"
	>
		<PanelHeader
			:collapsed="collapsed"
			:title="panelTitle"
			@toggle-collapse="toggleCollapse"
			@header-click="collapsed = false"
		/>
		
		<transition name="slide-panel">
			<div class="panel-body" v-show="!collapsed">
				<!-- Propiedades del proyecto -->
				<ProjectPropertiesForm
					v-if="showProject"
					:project-props="projectProps"
					:disabled="disabled ?? false"
					@update-project-prop="updateProjectProp"
					@auto-resize="autoResize"
				/>
				
				<!-- Propiedades de conexiones -->
				<EdgePropertiesForm
					v-else-if="!disabled && edge && edgeProperties"
					:edge-properties="edgeProperties"
					:source-node-info="sourceNodeInfo"
					:target-node-info="targetNodeInfo"
					:source-position="sourcePosition"
					:target-position="targetPosition"
					@edge-type-change="onEdgeTypeChange"
					@edge-animated-change="onEdgeAnimatedChange"
					@edge-selectable-change="onEdgeSelectableChange"
				/>
				
				<!-- Propiedades de nodos -->
				<template v-else-if="!disabled && node">
					<NodePropertiesForm
						:node-properties="nodeProperties"
						:node-icon="nodeIcon"
						:all-node-types="allNodeTypes"
						@label-change="onLabelChange"
						@type-change="onTypeChange"
						@subtitle-change="onSubtitleChange"
					/>
					
					<!-- Componente externo si aplica -->
					<ExternalComponentForm
						v-if="isExternalComponent"
						:custom-type-id="nodeProperties.customTypeId"
						:component-version="nodeProperties.componentVersion"
						:available-versions="availableVersions"
						:component-status="componentStatus"
						:component-status-text="componentStatusText"
						@component-version-change="onComponentVersionChange"
					/>
				</template>
				
				<!-- Estado vacío -->
				<EmptyPanelState v-else />
			</div>
		</transition>
	</div>
</template>

<script setup lang="ts">
import type { NodePropertiesPanelProps, NodePropertiesPanelEmits } from './types';

// Componentes
import PanelHeader from './components/PanelHeader.vue';
import ProjectPropertiesForm from './components/ProjectPropertiesForm.vue';
import EdgePropertiesForm from './components/EdgePropertiesForm.vue';
import NodePropertiesForm from './components/NodePropertiesForm.vue';
import ExternalComponentForm from './components/ExternalComponentForm.vue';
import EmptyPanelState from './components/EmptyPanelState.vue';

// Composables
import { usePanelState } from './composables/usePanelState';
import { useNodeProperties } from './composables/useNodeProperties';
import { useEdgeProperties } from './composables/useEdgeProperties';
import { useProjectProperties } from './composables/useProjectProperties';
import { useFormHandlers } from './composables/useFormHandlers';

const props = defineProps<NodePropertiesPanelProps>();
const emit = defineEmits<NodePropertiesPanelEmits>();

// Composables
const { collapsed, panelTitle, toggleCollapse } = usePanelState(props, emit);

const {
	nodeProperties,
	nodeIcon,
	isExternalComponent,
	availableVersions,
	componentStatus,
	componentStatusText,
	allNodeTypes
} = useNodeProperties(props);

const {
	edgeProperties,
	sourceNodeInfo,
	targetNodeInfo,
	sourcePosition,
	targetPosition
} = useEdgeProperties(props);

const { updateProjectProp, autoResize } = useProjectProperties(props, emit);

const {
	onLabelChange,
	onTypeChange,
	onSubtitleChange,
	onComponentVersionChange,
	onEdgeTypeChange,
	onEdgeAnimatedChange,
	onEdgeSelectableChange
} = useFormHandlers(emit);
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

.panel-body {
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
}

.panel-body::-webkit-scrollbar {
	width: 6px;
}

.panel-body::-webkit-scrollbar-track {
	background: #1a1d23;
}

.panel-body::-webkit-scrollbar-thumb {
	background: #33373e;
	border-radius: 3px;
}

.panel-body::-webkit-scrollbar-thumb:hover {
	background: #484f58;
}

/* Transiciones para el panel */
.slide-panel-enter-active,
.slide-panel-leave-active {
	transition: all 0.22s cubic-bezier(0.4, 1.3, 0.6, 1);
	overflow: hidden;
}

.slide-panel-enter-from,
.slide-panel-leave-to {
	opacity: 0;
	transform: translateX(10px);
}
</style>
