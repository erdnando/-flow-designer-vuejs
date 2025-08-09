import type { ComponentVersion } from './types';

// SVG Icons como constantes
export const COLLAPSE_ICON_LEFT = `
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
`;

export const COLLAPSE_ICON_RIGHT = `
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
`;

// Opciones de estado del proyecto
export const PROJECT_STATUS_OPTIONS = [
	{ value: 'Activo', label: 'Activo' },
	{ value: 'Inactivo', label: 'Inactivo' },
	{ value: 'Archivado', label: 'Archivado' }
] as const;

// Opciones de tipo de conexión
export const EDGE_TYPE_OPTIONS = [
	{ value: 'default', label: 'Por defecto' },
	{ value: 'straight', label: 'Línea recta' },
	{ value: 'step', label: 'Escalones' },
	{ value: 'smoothstep', label: 'Escalones suaves' },
	{ value: 'bezier', label: 'Curva Bézier' }
] as const;

// Versiones disponibles de componentes (por ahora solo v1.0.0)
export const AVAILABLE_COMPONENT_VERSIONS: ComponentVersion[] = [
	{ value: '1.0.0', label: 'v1.0.0' }
];

// Configuración de auto-resize para textareas
export const TEXTAREA_CONFIG = {
	minRows: 1,
	maxRows: 10,
	paddingExtra: 0.2
} as const;

// Timers y delays
export const DEBOUNCE_DELAY = 300;
export const RESIZE_DELAY = 10;
