export interface NodePropertiesPanelProps {
	node: any;
	edge?: any;
	nodes?: any[];
	collapsed?: boolean;
	disabled?: boolean;
	showProject?: boolean;
	projectProps?: any;
}

export interface NodePropertiesPanelEmits {
	close: [];
	update: [{ key: string; value: any; isEdge?: boolean }];
	'toggle-collapsed': [boolean];
	'update-project': [Record<string, any>];
}

export interface NodeProperties {
	label: string;
	type: string;
	subtitle: string;
	customTypeId: string;
	componentVersion: string;
}

export interface EdgeProperties {
	id: string;
	type: string;
	source: string;
	target: string;
	sourceHandle?: string;
	targetHandle?: string;
	animated?: boolean;
	selectable?: boolean;
	sourceX?: number;
	sourceY?: number;
	targetX?: number;
	targetY?: number;
}

export interface ProjectProperties {
	name: string;
	description: string;
	status: 'Activo' | 'Inactivo' | 'Archivado';
	owner: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface ComponentVersion {
	value: string;
	label: string;
}

export type ComponentStatus = 'stable' | 'beta' | 'deprecated' | 'unknown';

export interface PanelState {
	collapsed: boolean;
	disabled: boolean;
	showProject: boolean;
}
