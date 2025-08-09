export function useFormHandlers(emit: any) {
	// Handlers para las propiedades de nodos
	function onLabelChange(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		emit('update', { key: 'label', value });
	}

	function onTypeChange(event: Event) {
		let value = (event.target as HTMLSelectElement).value;
		if (value === 'if') value = 'condition'; // Forzar que 'if' se guarde como 'condition'
		if (value === 'condition') value = 'condition'; // Siempre guardar como 'condition'
		emit('update', { key: 'type', value });
	}

	function onSubtitleChange(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		// Importante: asegurarse que el valor se pasa correctamente para subtitle
		console.log('Actualizando subtítulo:', value);
		emit('update', { key: 'subtitle', value });
	}

	// Handler para cambio de versión del componente externo
	function onComponentVersionChange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		console.log('Actualizando versión del componente:', value);
		emit('update', { key: 'componentVersion', value });
	}

	// Handlers para las propiedades de edges/conexiones
	function onEdgeTypeChange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		emit('update', { key: 'type', value, isEdge: true });
	}

	function onEdgeAnimatedChange(event: Event) {
		const value = (event.target as HTMLInputElement).checked;
		emit('update', { key: 'animated', value, isEdge: true });
	}

	function onEdgeSelectableChange(event: Event) {
		const value = (event.target as HTMLInputElement).checked;
		emit('update', { key: 'selectable', value, isEdge: true });
	}

	return {
		onLabelChange,
		onTypeChange,
		onSubtitleChange,
		onComponentVersionChange,
		onEdgeTypeChange,
		onEdgeAnimatedChange,
		onEdgeSelectableChange
	};
}
