// Mapa de tipos de nodo a icono SVG y subtítulo
export const nodeTypeMeta: Record<string, { icon: string; subtitle: string }> = {
	start: {
		icon: `<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M15 11l12 8-12 8V11z" fill="white"/></svg>`,
		subtitle: 'Inicio solicitud',
	},
	end: {
		icon: `<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><rect x="13" y="13" width="12" height="12" rx="2" fill="white"/></svg>`,
		subtitle: 'Fin proceso',
	},
	condition: {
		icon: `<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><path d="M19 8l8 11-8 11-8-11z" fill="white"/><path d="M19 14v2m-3-1h6" stroke="#23272e" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
		subtitle: 'Decisión crediticia',
	},
	engineNode: {
		icon: `<svg width="28" height="28" viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="10" fill="#23272e"/><g transform="translate(19,19)"><circle r="6" fill="white"/><circle r="3" fill="#23272e"/><path d="M0,-8 L2,-6 L0,-4 L-2,-6 Z" fill="white"/><path d="M8,0 L6,2 L4,0 L6,-2 Z" fill="white"/><path d="M0,8 L-2,6 L0,4 L2,6 Z" fill="white"/><path d="M-8,0 L-6,-2 L-4,0 L-6,2 Z" fill="white"/><path d="M5.7,-5.7 L7.1,-4.3 L5.7,-2.9 L4.3,-4.3 Z" fill="white"/><path d="M5.7,5.7 L4.3,7.1 L2.9,5.7 L4.3,4.3 Z" fill="white"/><path d="M-5.7,5.7 L-7.1,4.3 L-5.7,2.9 L-4.3,4.3 Z" fill="white"/><path d="M-5.7,-5.7 L-4.3,-7.1 L-2.9,-5.7 L-4.3,-4.3 Z" fill="white"/></g></svg>`,
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
