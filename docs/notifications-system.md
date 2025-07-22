# Sistema de Notificaciones y Alertas Visuales

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tipos de Notificaciones](#tipos-de-notificaciones)
4. [API del Composable](#api-del-composable)
5. [Uso desde Otros Módulos](#uso-desde-otros-módulos)
6. [Componente Visual](#componente-visual)
7. [Configuración y Personalización](#configuración-y-personalización)
8. [Ejemplos Prácticos](#ejemplos-prácticos)
9. [Mejores Prácticas](#mejores-prácticas)

---

## Descripción General

El sistema de notificaciones y alertas visuales proporciona una interfaz elegante y consistente para mostrar información, advertencias, errores y confirmaciones al usuario. Está diseñado como un sistema modular y reutilizable que puede ser utilizado desde cualquier componente de la aplicación.

### Características Principales:
- **Modular**: Composable Vue 3 reutilizable
- **Tipado**: Full TypeScript con interfaces bien definidas
- **Personalizable**: Múltiples tipos, duraciones, acciones y estilos
- **Accesible**: Soporte para acciones de teclado y lectores de pantalla
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla
- **Animaciones**: Transiciones suaves y modernas

---

## Arquitectura del Sistema

### Componentes Principales:

1. **Composable**: `src/composables/useNotifications.ts`
2. **Componente Visual**: `src/components/NotificationContainer.vue`
3. **Integración Global**: `src/App.vue`

### Flujo de Datos:
```
Módulo → useNotifications() → Estado Global → NotificationContainer → UI
```

---

## Tipos de Notificaciones

### 5 Tipos Predefinidos:

```typescript
export type NotificationType = 'default' | 'success' | 'warning' | 'danger' | 'info'
```

| Tipo | Uso Principal | Color | Duración Default | Icono |
|------|---------------|-------|------------------|-------|
| `default` | Información general | Gris | 4s | ℹ️ |
| `success` | Operaciones exitosas | Verde | 4s | ✅ |
| `warning` | Advertencias | Amarillo | 6s | ⚠️ |
| `danger` | Errores críticos | Rojo | 8s | ❌ |
| `info` | Información contextual | Azul | 5s | 💡 |

---

## API del Composable

### Estructura de la Notificación
```typescript
export interface Notification {
    id: string;                    // ID único generado automáticamente
    type: NotificationType;        // Tipo de notificación
    title?: string;                // Título opcional
    message: string;               // Mensaje principal (requerido)
    description?: string;          // Descripción adicional
    duration?: number;             // Duración en milisegundos
    persistent?: boolean;          // Si debe permanecer hasta cierre manual
    showCloseButton?: boolean;     // Mostrar botón de cierre
    actions?: NotificationAction[]; // Acciones personalizadas
    createdAt: number;             // Timestamp de creación
}
```

### Acciones Personalizadas
```typescript
export interface NotificationAction {
    label: string;                 // Texto del botón
    action: () => void;           // Función a ejecutar
    style?: 'primary' | 'secondary' | 'danger'; // Estilo visual
}
```

### Función Principal
```typescript
function showNotification(options: Partial<Notification> & { 
    message: string, 
    type?: NotificationType 
}): string
```

### Funciones de Conveniencia
```typescript
// Funciones básicas
showSuccess(message: string, options?: Partial<Notification>): string
showWarning(message: string, options?: Partial<Notification>): string
showDanger(message: string, options?: Partial<Notification>): string
showInfo(message: string, options?: Partial<Notification>): string
showDefault(message: string, options?: Partial<Notification>): string

// Funciones especializadas para validaciones
showValidationError(message: string, options?: Partial<Notification>): string
showValidationWarning(message: string, options?: Partial<Notification>): string

// Funciones de gestión
removeNotification(id: string): void
clearAllNotifications(): void
```

---

## Uso desde Otros Módulos

### Importación Básica
```typescript
import { useNotifications } from '@/composables/useNotifications'

export default {
    setup() {
        const { showSuccess, showDanger, showWarning } = useNotifications()
        
        return {
            showSuccess,
            showDanger,
            showWarning
        }
    }
}
```

### Ejemplo en Composition API
```typescript
<script setup lang="ts">
import { useNotifications } from '@/composables/useNotifications'

const { showSuccess, showDanger, showInfo, removeNotification } = useNotifications()

// Función simple
function handleSave() {
    try {
        // Lógica de guardado
        showSuccess('Datos guardados correctamente')
    } catch (error) {
        showDanger('Error al guardar los datos', {
            description: error.message,
            persistent: true
        })
    }
}

// Función con acciones
function handleDelete() {
    let deletedItem = null
    
    const notificationId = showWarning('Elemento eliminado', {
        title: 'Acción realizada',
        description: 'El elemento ha sido eliminado permanentemente',
        duration: 10000,
        actions: [
            {
                label: 'Deshacer',
                action: () => {
                    // Restaurar elemento
                    restoreItem(deletedItem)
                    showSuccess('Elemento restaurado')
                    removeNotification(notificationId)
                },
                style: 'primary'
            },
            {
                label: 'Confirmar',
                action: () => {
                    removeNotification(notificationId)
                },
                style: 'secondary'
            }
        ]
    })
}
</script>
```

### Ejemplo en Options API
```typescript
import { useNotifications } from '@/composables/useNotifications'

export default {
    data() {
        return {
            notifications: useNotifications()
        }
    },
    methods: {
        async handleSubmit() {
            try {
                await this.submitForm()
                this.notifications.showSuccess('Formulario enviado exitosamente')
            } catch (error) {
                this.notifications.showDanger('Error en el envío', {
                    description: 'Verifica los datos e intenta nuevamente',
                    duration: 8000,
                    persistent: true
                })
            }
        }
    }
}
```

---

## Componente Visual

### Ubicación y Renderizado
El `NotificationContainer` se renderiza globalmente usando `Teleport`:

```vue
<!-- En src/components/NotificationContainer.vue -->
<template>
    <Teleport to="body">
        <div class="notification-container">
            <TransitionGroup name="notification" tag="div">
                <div 
                    v-for="notification in notifications" 
                    :key="notification.id"
                    :class="['notification', `notification--${notification.type}`]"
                >
                    <!-- Contenido de la notificación -->
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>
```

### Estilos y Animaciones
```scss
// Posición fija en la esquina superior derecha
.notification-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    max-width: 400px;
}

// Animaciones de entrada/salida
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
}
```

---

## Configuración y Personalización

### Configuración por Defecto
```typescript
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
```

### Personalización Avanzada
```typescript
// Notificación personalizada con múltiples acciones
showWarning('¿Estás seguro de eliminar este flujo?', {
    title: 'Confirmar eliminación',
    description: 'Esta acción no se puede deshacer',
    persistent: true,
    actions: [
        {
            label: 'Eliminar',
            action: () => {
                deleteFlow()
                showSuccess('Flujo eliminado correctamente')
            },
            style: 'danger'
        },
        {
            label: 'Cancelar',
            action: () => {},
            style: 'secondary'
        },
        {
            label: 'Hacer copia de seguridad',
            action: () => {
                backupFlow()
                showInfo('Copia de seguridad creada')
            },
            style: 'primary'
        }
    ]
})
```

---

## Ejemplos Prácticos

### 1. Notificación Simple
```typescript
// Éxito básico
showSuccess('Configuración guardada')

// Error con descripción
showDanger('Error de conexión', {
    description: 'No se pudo conectar con el servidor'
})
```

### 2. Notificación con Acciones
```typescript
// Confirmación con deshacer
const notificationId = showWarning('Nodo eliminado', {
    description: 'El nodo ha sido eliminado del flujo',
    actions: [
        {
            label: 'Deshacer',
            action: () => {
                restoreNode()
                removeNotification(notificationId)
            },
            style: 'primary'
        }
    ]
})
```

### 3. Notificación Persistente
```typescript
// Error crítico que requiere atención
showDanger('Error crítico del sistema', {
    title: 'Atención requerida',
    description: 'Se ha detectado un error que requiere intervención manual',
    persistent: true,
    actions: [
        {
            label: 'Ver detalles',
            action: () => {
                openErrorDetails()
            },
            style: 'primary'
        },
        {
            label: 'Reportar problema',
            action: () => {
                openBugReport()
            },
            style: 'secondary'
        }
    ]
})
```

### 4. Notificación de Progreso
```typescript
// Notificación que se actualiza
let progressId = showInfo('Procesando flujo...', {
    persistent: true,
    showCloseButton: false
})

// Simular progreso
setTimeout(() => {
    removeNotification(progressId)
    showSuccess('Flujo procesado correctamente')
}, 3000)
```

---

## Integración con Otros Sistemas

### Con Sistema de Validación
```typescript
// En FlowCanvas.vue - Validación automática
function runNodeValidations(showNotifications: boolean = true) {
    const errors = getValidationErrors(nodes.value)
    
    if (showNotifications && errors.length > 0) {
        errors.forEach(error => {
            showValidationError(error.message!, {
                title: 'Regla de validación violada',
                description: `Regla "${error.ruleId}": ${error.message}`,
                actions: [
                    {
                        label: 'Ver reglas',
                        action: () => openValidationRules(),
                        style: 'primary'
                    }
                ]
            })
        })
    }
}
```

### Con Operaciones Asíncronas
```typescript
async function saveFlow() {
    const loadingId = showInfo('Guardando flujo...', {
        persistent: true,
        showCloseButton: false
    })
    
    try {
        await api.saveFlow(flowData)
        removeNotification(loadingId)
        showSuccess('Flujo guardado correctamente')
    } catch (error) {
        removeNotification(loadingId)
        showDanger('Error al guardar', {
            description: error.message,
            actions: [
                {
                    label: 'Reintentar',
                    action: () => saveFlow(),
                    style: 'primary'
                }
            ]
        })
    }
}
```

---

## Estado Global y Reactividad

### Acceso al Estado
```typescript
import { useNotifications } from '@/composables/useNotifications'

const { notifications } = useNotifications()

// notifications es reactivo - se puede usar en computed, watchers, etc.
const hasErrors = computed(() => 
    notifications.value.some(n => n.type === 'danger')
)

const errorCount = computed(() => 
    notifications.value.filter(n => n.type === 'danger').length
)
```

### Limpieza y Gestión
```typescript
// Limpiar todas las notificaciones
clearAllNotifications()

// Limpiar solo errores
notifications.value = notifications.value.filter(n => n.type !== 'danger')

// Limpiar notificaciones antiguas (más de 1 minuto)
const oneMinuteAgo = Date.now() - 60000
notifications.value = notifications.value.filter(n => n.createdAt > oneMinuteAgo)
```

---

## Mejores Prácticas

### 1. **Mensajes Efectivos**
```typescript
// ❌ Malo - mensaje vago
showDanger('Error')

// ✅ Bueno - mensaje descriptivo con contexto
showDanger('Error al conectar con el servidor', {
    description: 'Verifica tu conexión a internet e intenta nuevamente'
})
```

### 2. **Duración Apropiada**
```typescript
// Para éxito - duración corta
showSuccess('Guardado', { duration: 2000 })

// Para errores - duración larga o persistente
showDanger('Error crítico', { 
    duration: 10000, 
    persistent: true 
})
```

### 3. **Acciones Útiles**
```typescript
// Proporcionar acciones que ayuden al usuario
showWarning('El flujo tiene errores de validación', {
    actions: [
        {
            label: 'Ver errores',
            action: () => showValidationDetails(),
            style: 'primary'
        },
        {
            label: 'Ignorar por ahora',
            action: () => {},
            style: 'secondary'
        }
    ]
})
```

### 4. **Gestión de IDs**
```typescript
// Guardar IDs para poder gestionar notificaciones
const saveNotificationId = showInfo('Guardando...')

// Más tarde, reemplazar con resultado
removeNotification(saveNotificationId)
showSuccess('Guardado completamente')
```

### 5. **Evitar Spam**
```typescript
// Limitar notificaciones duplicadas
let lastErrorTime = 0
const ERROR_COOLDOWN = 3000

function showErrorWithCooldown(message: string) {
    const now = Date.now()
    if (now - lastErrorTime > ERROR_COOLDOWN) {
        showDanger(message)
        lastErrorTime = now
    }
}
```

---

## Extensibilidad Futura

### Nuevos Tipos de Notificación
```typescript
// Agregar nuevos tipos al enum
export type NotificationType = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'loading' | 'progress'

// Agregar configuración correspondiente
const defaultConfig = {
    // ... configuración existente
    loading: {
        duration: 0,
        persistent: true,
        showCloseButton: false
    },
    progress: {
        duration: 0,
        persistent: true,
        showCloseButton: true
    }
}
```

### Notificaciones con Progreso
```typescript
interface ProgressNotification extends Notification {
    progress?: number; // 0-100
    progressText?: string;
}

function showProgress(message: string, progress: number): string {
    return showNotification({
        message,
        type: 'progress',
        progress,
        persistent: true
    })
}
```

### Notificaciones Posicionables
```typescript
interface PositionedNotification extends Notification {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
}
```

---

## Debugging y Desarrollo

### Logs de Desarrollo
```typescript
// En modo desarrollo, loggear todas las notificaciones
if (process.env.NODE_ENV === 'development') {
    console.log('🔔 Notification:', {
        type: notification.type,
        message: notification.message,
        id: notification.id
    })
}
```

### Herramientas de Desarrollo
```typescript
// Función para testing en consola del navegador
if (process.env.NODE_ENV === 'development') {
    window.testNotifications = {
        success: (msg) => showSuccess(msg || 'Test success'),
        error: (msg) => showDanger(msg || 'Test error'),
        warning: (msg) => showWarning(msg || 'Test warning'),
        info: (msg) => showInfo(msg || 'Test info'),
        clear: () => clearAllNotifications()
    }
}
```

---

El sistema de notificaciones proporciona una base sólida y extensible para toda la comunicación visual con el usuario en la aplicación, manteniéndose simple de usar pero poderoso en sus capacidades.
