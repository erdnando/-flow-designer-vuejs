import { ref, reactive } from 'vue'

// Tipos para las notificaciones
export type NotificationType = 'default' | 'success' | 'warning' | 'danger' | 'info'

export interface Notification {
	id: string
	type: NotificationType
	title?: string
	message: string
	description?: string
	duration?: number
	persistent?: boolean
	showCloseButton?: boolean
	actions?: NotificationAction[]
	createdAt: number
}

export interface NotificationAction {
	label: string
	action: () => void
	style?: 'primary' | 'secondary' | 'danger'
}

// Estado global de las notificaciones
const notifications = ref<Notification[]>([])
let notificationId = 0

// Función para generar IDs únicos
function generateId(): string {
	return `notification-${++notificationId}-${Date.now()}`
}

// Configuración por defecto para cada tipo
const defaultConfig: Record<NotificationType, Partial<Notification>> = {
	default: {
		duration: 4000,
		showCloseButton: true
	},
	success: {
		duration: 4000,
		showCloseButton: true
	},
	warning: {
		duration: 6000,
		showCloseButton: true
	},
	danger: {
		duration: 8000,
		showCloseButton: true,
		persistent: false
	},
	info: {
		duration: 5000,
		showCloseButton: true
	}
}

// Función principal para mostrar notificaciones
function showNotification(options: Partial<Notification> & { message: string, type?: NotificationType }): string {
	const type = options.type || 'default'
	const config = defaultConfig[type]
	
	const notification: Notification = {
		id: generateId(),
		type,
		message: options.message,
		title: options.title,
		description: options.description,
		duration: options.duration ?? config.duration ?? 4000,
		persistent: options.persistent ?? config.persistent ?? false,
		showCloseButton: options.showCloseButton ?? config.showCloseButton ?? true,
		actions: options.actions || [],
		createdAt: Date.now()
	}

	notifications.value.push(notification)

	// Auto-remover después del duration especificado
	if (!notification.persistent && notification.duration > 0) {
		setTimeout(() => {
			removeNotification(notification.id)
		}, notification.duration)
	}

	return notification.id
}

// Función para remover una notificación
function removeNotification(id: string) {
	const index = notifications.value.findIndex(n => n.id === id)
	if (index > -1) {
		notifications.value.splice(index, 1)
	}
}

// Función para limpiar todas las notificaciones
function clearAllNotifications() {
	notifications.value = []
}

// Funciones de conveniencia para cada tipo
function showSuccess(message: string, options?: Partial<Notification>): string {
	return showNotification({ ...options, message, type: 'success' })
}

function showWarning(message: string, options?: Partial<Notification>): string {
	return showNotification({ ...options, message, type: 'warning' })
}

function showDanger(message: string, options?: Partial<Notification>): string {
	return showNotification({ ...options, message, type: 'danger' })
}

function showInfo(message: string, options?: Partial<Notification>): string {
	return showNotification({ ...options, message, type: 'info' })
}

function showDefault(message: string, options?: Partial<Notification>): string {
	return showNotification({ ...options, message, type: 'default' })
}

// Funciones específicas para validaciones
function showValidationError(message: string, options?: Partial<Notification>): string {
	return showDanger(message, {
		title: 'Error de validación',
		duration: 7000, // Errores de validación necesitan más tiempo para leer
		...options
	})
}

function showValidationWarning(message: string, options?: Partial<Notification>): string {
	return showWarning(message, {
		title: 'Advertencia de validación',
		duration: 6000, // Mantener 6 segundos para advertencias
		...options
	})
}

// Composable principal
export function useNotifications() {
	return {
		// Estado
		notifications: notifications,
		
		// Funciones principales
		showNotification,
		removeNotification,
		clearAllNotifications,
		
		// Funciones de conveniencia por tipo
		showSuccess,
		showWarning,
		showDanger,
		showInfo,
		showDefault,
		
		// Funciones específicas
		showValidationError,
		showValidationWarning
	}
}
