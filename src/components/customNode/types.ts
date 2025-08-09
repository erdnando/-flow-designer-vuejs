/**
 * TypeScript interfaces for CustomNode component system
 */

export interface NodeData {
	label?: string;
	type?: string;
	subtitle?: string;
	componentVersion?: string;
	templateId?: string;
	[key: string]: any;
}

export interface NodeProps {
	data: NodeData;
}

export interface NodeEvents {
	'node-copy': [node: any];
	'node-duplicate': [node: any];
	'node-delete': [nodeId: string];
	'node-menu': [event: MouseEvent, node: any];
}

export interface NodeToolbarAction {
	name: string;
	icon: string;
	title: string;
	handler: () => void;
	class?: string;
}

export interface NodeAppearance {
	icon: string;
	label: string;
	type: string;
	version: string;
	hasError: boolean;
}

export interface NodeState {
	showToolbar: boolean;
	isHovered: boolean;
	isSelected: boolean;
	hoverTimeout: ReturnType<typeof setTimeout> | null;
}
