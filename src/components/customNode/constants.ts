/**
 * Constants for CustomNode component
 * Includes SVG icons, configurations, and static values
 */

export const TOOLBAR_ICONS = {
	COPY: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI5IiB5PSI5IiB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHJ4PSIyIiByeT0iMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTUgMTVINGEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg5YTIgMiAwIDAgMSAyIDJ2MSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+',
	
	DUPLICATE: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgNGgyYTIgMiAwIDAgMSAyIDJ2MTRhMiAyIDAgMCAxLTIgMkg2YTIgMiAwIDAgMS0yLTJWNmEyIDIgMCAwIDEgMi0yaDIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjxyZWN0IHg9IjgiIHk9IjIiIHdpZHRoPSI4IiBoZWlnaHQ9IjQiIHJ4PSIxIiByeT0iMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+',
	
	DELETE: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTggNkw2IDE4TTYgNmwxMiAxMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=',
	
	MENU: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjYiIHI9IjIiIHN0cm9rZT0id2hpdGUiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMiIgc3Ryb2tlPSJ3aGl0ZSIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjE4IiByPSIyIiBzdHJva2U9IndoaXRlIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg=='
} as const;

export const NODE_CONFIG = {
	MIN_WIDTH: 200,
	MIN_HEIGHT: 64,
	PADDING: {
		LEFT: 20,
		RIGHT: 32,
		TOP: 16,
		BOTTOM: 16
	},
	HOVER_DELAY: 150,
	DEFAULT_VERSION: 'v1.0.0'
} as const;

export const TOOLBAR_CONFIG = {
	BUTTON_SIZE: 18,
	ACTIONS: [
		{
			name: 'copy',
			icon: TOOLBAR_ICONS.COPY,
			title: 'Copiar nodo',
			class: 'copy-btn'
		},
		{
			name: 'duplicate', 
			icon: TOOLBAR_ICONS.DUPLICATE,
			title: 'Duplicar nodo',
			class: 'duplicate-btn'
		},
		{
			name: 'delete',
			icon: TOOLBAR_ICONS.DELETE,
			title: 'Eliminar nodo', 
			class: 'delete-btn'
		},
		{
			name: 'menu',
			icon: TOOLBAR_ICONS.MENU,
			title: 'Más opciones',
			class: 'menu-btn'
		}
	]
} as const;
