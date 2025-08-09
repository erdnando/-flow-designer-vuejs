import { ref, watch } from 'vue';
import type { ProjectProperties } from '../types';
import { DEBOUNCE_DELAY, RESIZE_DELAY } from '../constants';

export function useProjectProperties(props: any, emit: any) {
	// Referencias para los textareas
	const titleTextarea = ref<HTMLTextAreaElement | null>(null);
	const descriptionTextarea = ref<HTMLTextAreaElement | null>(null);

	// Objeto para mantener un seguimiento de las propiedades modificadas
	const modifiedProjectProps = ref<Record<string, any>>({});

	// Propiedades computadas del proyecto
	const projectProperties = ref<ProjectProperties>({
		name: '',
		description: '',
		status: 'Activo',
		owner: '',
		createdAt: '',
		updatedAt: ''
	});

	// Función para actualizar propiedades individuales del proyecto
	function updateProjectProp(propName: string, value: any) {
		if (props.projectProps) {
			// Actualizar la propiedad individual en el objeto reactivo
			modifiedProjectProps.value[propName] = value;
		}
	}

	// Función para auto-redimensionar textareas
	function autoResize(event: Event) {
		const textarea = event.target as HTMLTextAreaElement;
		if (!textarea) return;
		
		// Resetear la altura para obtener la altura real del contenido
		textarea.style.height = 'auto';
		
		// Calcular la nueva altura basada en el scrollHeight
		// Agregar solo 1px de padding extra para evitar el scroll sin que se vea excesivo
		const newHeight = textarea.scrollHeight + 0.2;
		
		// Aplicar la nueva altura
		textarea.style.height = newHeight + 'px';
	}

	// Función auxiliar para redimensionar un textarea específico
	function resizeTextarea(textarea: HTMLTextAreaElement) {
		if (!textarea) return;
		
		// Resetear la altura para obtener la altura real del contenido
		textarea.style.height = 'auto';
		
		// Calcular la nueva altura basada en el scrollHeight
		const newHeight = textarea.scrollHeight + 1;
		
		// Aplicar la nueva altura
		textarea.style.height = newHeight + 'px';
	}

	// Observar cambios en las propiedades del proyecto para redimensionar
	watch(
		() => props.projectProps?.name,
		() => {
			if (titleTextarea.value) {
				setTimeout(() => resizeTextarea(titleTextarea.value!), RESIZE_DELAY);
			}
		}
	);

	watch(
		() => props.projectProps?.description,
		() => {
			if (descriptionTextarea.value) {
				setTimeout(() => resizeTextarea(descriptionTextarea.value!), RESIZE_DELAY);
			}
		}
	);

	// Watchers independientes para cada propiedad del proyecto
	watch(
		() => props.projectProps?.name,
		(newVal) => {
			if (newVal !== undefined) modifiedProjectProps.value.name = newVal;
		},
	);

	watch(
		() => props.projectProps?.description,
		(newVal) => {
			if (newVal !== undefined) modifiedProjectProps.value.description = newVal;
		},
	);

	watch(
		() => props.projectProps?.status,
		(newVal) => {
			if (newVal !== undefined) modifiedProjectProps.value.status = newVal;
		},
	);

	watch(
		() => props.projectProps?.owner,
		(newVal) => {
			if (newVal !== undefined) modifiedProjectProps.value.owner = newVal;
		},
	);

	// Notificamos cambios debounced para evitar ciclos
	let projectUpdateTimer: number | null = null;
	watch(
		modifiedProjectProps,
		() => {
			if (projectUpdateTimer !== null) {
				clearTimeout(projectUpdateTimer);
			}

			projectUpdateTimer = window.setTimeout(() => {
				if (Object.keys(modifiedProjectProps.value).length > 0) {
					emit('update-project', { ...modifiedProjectProps.value });
					modifiedProjectProps.value = {}; // Reiniciar después de emitir
				}
			}, DEBOUNCE_DELAY);
		},
		{ deep: true },
	);

	return {
		titleTextarea,
		descriptionTextarea,
		projectProperties,
		updateProjectProp,
		autoResize,
		resizeTextarea
	};
}
