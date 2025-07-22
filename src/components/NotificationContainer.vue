<template>
	<Teleport to="body">
		<div class="notifications-container">
			<TransitionGroup name="notification" tag="div" class="notifications-list">
				<div
					v-for="notification in notifications"
					:key="notification.id"
					:class="[
						'notification',
						`notification--${notification.type}`,
						{ 'notification--with-actions': notification.actions && notification.actions.length > 0 }
					]"
				>
					<!-- Icono según el tipo -->
					<div class="notification__icon">
						<component :is="getIcon(notification.type)" />
					</div>

					<!-- Contenido principal -->
					<div class="notification__content">
						<div v-if="notification.title" class="notification__title">
							{{ notification.title }}
						</div>
						<div class="notification__message">
							{{ notification.message }}
						</div>
						<div v-if="notification.description" class="notification__description">
							{{ notification.description }}
						</div>

						<!-- Acciones -->
						<div v-if="notification.actions && notification.actions.length > 0" class="notification__actions">
							<button
								v-for="(action, index) in notification.actions"
								:key="index"
								:class="[
									'notification__action',
									`notification__action--${action.style || 'primary'}`
								]"
								@click="handleAction(action, notification.id)"
							>
								{{ action.label }}
							</button>
						</div>
					</div>

					<!-- Botón de cerrar -->
					<button
						v-if="notification.showCloseButton"
						class="notification__close"
						@click="removeNotification(notification.id)"
						title="Cerrar"
					>
						<!-- Siempre mostrar el símbolo × como principal -->
						<span class="notification__close-text">×</span>
					</button>
				</div>
			</TransitionGroup>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { useNotifications, type NotificationType } from '../composables/useNotifications'

// Iconos SVG como componentes
const CheckIcon = {
	template: `
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	`
}

const WarningIcon = {
	template: `
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	`
}

const DangerIcon = {
	template: `
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	`
}

const InfoIcon = {
	template: `
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 16V12M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	`
}

const DefaultIcon = {
	template: `
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	`
}

const { notifications, removeNotification } = useNotifications()

// Función para obtener el icono según el tipo
function getIcon(type: NotificationType) {
	const iconMap = {
		success: CheckIcon,
		warning: WarningIcon,
		danger: DangerIcon,
		info: InfoIcon,
		default: DefaultIcon
	}
	return iconMap[type] || DefaultIcon
}

// Manejar acciones de las notificaciones
function handleAction(action: any, notificationId: string) {
	action.action()
	removeNotification(notificationId)
}
</script>

<style scoped>
.notifications-container {
	position: fixed;
	top: 20px;
	right: 20px;
	z-index: 9999;
	pointer-events: none;
}

.notifications-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
	max-width: 400px;
}

.notification {
	background: #ffffff;
	border-radius: 12px;
	box-shadow: 
		0 4px 12px rgba(0, 0, 0, 0.08),
		0 2px 4px rgba(0, 0, 0, 0.04),
		0 0 0 1px rgba(0, 0, 0, 0.04);
	padding: 16px;
	display: flex;
	align-items: flex-start;
	gap: 12px;
	pointer-events: auto;
	transition: all 0.3s ease;
	max-width: 400px;
	min-width: 320px;
}

.notification:hover {
	transform: translateY(-2px);
	box-shadow: 
		0 8px 24px rgba(0, 0, 0, 0.12),
		0 4px 8px rgba(0, 0, 0, 0.08),
		0 0 0 1px rgba(0, 0, 0, 0.04);
}

/* Estilos por tipo */
.notification--success {
	border-left: 4px solid #10b981;
}

.notification--success .notification__icon {
	color: #10b981;
}

.notification--warning {
	border-left: 4px solid #f59e0b;
}

.notification--warning .notification__icon {
	color: #f59e0b;
}

.notification--danger {
	border-left: 4px solid #ef4444;
}

.notification--danger .notification__icon {
	color: #ef4444;
}

.notification--info {
	border-left: 4px solid #3b82f6;
}

.notification--info .notification__icon {
	color: #3b82f6;
}

.notification--default {
	border-left: 4px solid #6b7280;
}

.notification--default .notification__icon {
	color: #6b7280;
}

/* Icono */
.notification__icon {
	flex-shrink: 0;
	margin-top: 2px;
}

/* Contenido */
.notification__content {
	flex: 1;
	min-width: 0;
}

.notification__title {
	font-weight: 600;
	font-size: 14px;
	line-height: 1.4;
	color: #1f2937;
	margin-bottom: 4px;
}

.notification__message {
	font-size: 14px;
	line-height: 1.5;
	color: #4b5563;
	word-wrap: break-word;
}

.notification__description {
	font-size: 12px;
	line-height: 1.4;
	color: #6b7280;
	margin-top: 4px;
}

/* Acciones */
.notification__actions {
	display: flex;
	gap: 8px;
	margin-top: 12px;
}

.notification__action {
	padding: 6px 12px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 500;
	border: none;
	cursor: pointer;
	transition: all 0.2s ease;
}

.notification__action--primary {
	background: #3b82f6;
	color: white;
}

.notification__action--primary:hover {
	background: #2563eb;
}

.notification__action--secondary {
	background: #f3f4f6;
	color: #4b5563;
}

.notification__action--secondary:hover {
	background: #e5e7eb;
}

.notification__action--danger {
	background: #ef4444;
	color: white;
}

.notification__action--danger:hover {
	background: #dc2626;
}

/* Botón cerrar */
.notification__close {
	flex-shrink: 0;
	width: 28px;
	height: 28px;
	border-radius: 6px;
	border: none;
	background: rgba(0, 0, 0, 0.08);
	color: #6b7280;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	margin-top: -2px;
	margin-right: -4px;
	position: relative;
}

.notification__close:hover {
	background: rgba(0, 0, 0, 0.15);
	color: #374151;
}

.notification__close:active {
	background: rgba(0, 0, 0, 0.2);
	transform: scale(0.95);
}

/* Texto del botón cerrar (símbolo ×) */
.notification__close-text {
	font-size: 18px;
	font-weight: 300;
	line-height: 1;
	color: #6b7280;
	user-select: none;
}

.notification__close:hover .notification__close-text {
	color: #374151;
}

/* Animaciones */
.notification-enter-active {
	transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-leave-active {
	transition: all 0.3s ease-in;
}

.notification-enter-from {
	opacity: 0;
	transform: translateX(100%) scale(0.95);
}

.notification-leave-to {
	opacity: 0;
	transform: translateX(100%) scale(0.95);
}

.notification-move {
	transition: transform 0.3s ease;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
	.notification {
		background: #1f2937;
		color: #f9fafb;
		box-shadow: 
			0 4px 12px rgba(0, 0, 0, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.2),
			0 0 0 1px rgba(255, 255, 255, 0.1);
	}

	.notification__title {
		color: #f9fafb;
	}

	.notification__message {
		color: #d1d5db;
	}

	.notification__description {
		color: #9ca3af;
	}

	.notification__action--secondary {
		background: #374151;
		color: #d1d5db;
	}

	.notification__action--secondary:hover {
		background: #4b5563;
	}

	.notification__close:hover {
		background: #374151;
		color: #d1d5db;
	}
}
</style>
