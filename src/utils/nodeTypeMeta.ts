// Mapa de tipos de nodo a icono SVG y subtítulo
export const nodeTypeMeta: Record<string, { icon: string; subtitle: string }> = {
	start: {
		icon: `<svg width="28" height="28" viewBox="0 0 38 38"><circle cx="19" cy="19" r="16" fill="#4CAF50" stroke="#2E7D32" stroke-width="3"/><polygon points="15,11 25,19 15,27" fill="white"/></svg>`,
		subtitle: 'Inicio solicitud',
	},
	end: {
		icon: `<svg width="28" height="28" viewBox="0 0 38 38"><circle cx="19" cy="19" r="16" fill="#F44336" stroke="#C62828" stroke-width="3"/><rect x="13" y="13" width="12" height="12" fill="white" rx="2"/></svg>`,
		subtitle: 'Fin proceso',
	},
	condition: {
		icon: `<svg width="28" height="28" viewBox="0 0 38 38"><polygon points="19,4 32,19 19,34 6,19" fill="#FF9800" stroke="#E65100" stroke-width="3"/><path d="M19 9v4m0 4v8m-6-8h12M13 13l3-3m6 6l3 3m-6 6h-6m6 0h6" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
		subtitle: 'Decisión crediticia',
	},
	engineNode: {
		icon: `<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><circle cx="19" cy="19" r="12" fill="none"/><path d="m13.5 21.5 9.5-9.5-2-2-7.5 7.5-3.5-3.5-2 2 5.5 5.5z" fill="white"/></svg>`,
		subtitle: 'Motor de negocio',
	},
	processNode: {
		icon: `<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><circle cx="19" cy="19" r="12" fill="none"/><path d="m14 19 3 3 6-6" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
		subtitle: 'Proceso',
	},
	default: {
		icon: `<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e" stroke="#e14d43" stroke-width="2.5"/><circle cx="19" cy="19" r="12" stroke="#4285F4" stroke-width="2.5" fill="none"/></svg>`,
		subtitle: 'default',
	},
};
