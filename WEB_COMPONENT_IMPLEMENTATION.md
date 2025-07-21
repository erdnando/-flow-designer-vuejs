# Flow Designer - Web Component Implementation Guide

## 📋 Índice
1. [Introducción](#introducción)
2. [Arquitectura del Web Component](#arquitectura-del-web-component)
3. [Preparación del proyecto actual](#preparación-del-proyecto-actual)
4. [Implementación del Web Component](#implementación-del-web-component)
5. [API del Web Component](#api-del-web-component)
6. [Wrapper para React](#wrapper-para-react)
7. [Build y empaquetado](#build-y-empaquetado)
8. [Publicación como paquete NPM](#publicación-como-paquete-npm)
9. [Documentación de uso](#documentación-de-uso)
10. [Consideraciones y limitaciones](#consideraciones-y-limitaciones)

---

## 🎯 Introducción

Este documento detalla el proceso para convertir el **Flow Designer Vue.js** en un **Web Component** reutilizable que puede ser integrado en aplicaciones React, Angular, Vanilla JS o cualquier framework moderno.

### Beneficios del Web Component:
- ✅ **Framework agnóstico** - funciona en cualquier entorno web
- ✅ **Encapsulación completa** - CSS y funcionalidad aislados
- ✅ **API estándar** - eventos y propiedades nativas del DOM
- ✅ **Performance óptimo** - no overhead de frameworks adicionales
- ✅ **Future-proof** - basado en estándares web nativos

---

## 🏗️ Arquitectura del Web Component

```
flow-designer-package/
├── src/
│   ├── vue-app/                     # App Vue actual
│   │   ├── components/
│   │   ├── stores/
│   │   ├── utils/
│   │   └── main.ts
│   ├── web-component/               # Configuración Web Component
│   │   ├── FlowDesignerElement.ts   # Definición del Custom Element
│   │   ├── vue-app-wrapper.ts      # Wrapper para Vue App
│   │   └── types.ts                # Tipos del Web Component
│   └── wrappers/                    # Wrappers específicos
│       ├── react-wrapper.tsx       # Wrapper React
│       ├── angular-wrapper.ts      # Wrapper Angular (futuro)
│       └── vanilla-wrapper.js      # Helper Vanilla JS
├── dist/                            # Builds de salida
│   ├── web-component.js            # Web Component bundle
│   ├── react-wrapper.js            # React wrapper bundle
│   └── types/                      # TypeScript definitions
├── examples/                        # Ejemplos de integración
│   ├── react-example/
│   ├── vue-example/
│   └── vanilla-example/
└── docs/                           # Documentación
    ├── api.md
    ├── integration-guide.md
    └── examples.md
```

---

## 🔧 Preparación del proyecto actual

### 1. Refactorización de componentes principales

#### 1.1 Crear un componente raíz unificado
```typescript
// src/components/FlowDesignerRoot.vue
<template>
  <div class="flow-designer-root">
    <NodePanel v-if="!hideNodePanel" />
    <FlowCanvas />
  </div>
</template>

<script setup lang="ts">
interface Props {
  initialData?: FlowData
  hideNodePanel?: boolean
  readonly?: boolean
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  hideNodePanel: false,
  readonly: false,
  theme: 'dark'
})

// Exponer métodos públicos
defineExpose({
  exportFlow,
  importFlow,
  clearFlow,
  addNode,
  removeNode,
  getFlowData
})
</script>
```

#### 1.2 Crear tipos unificados
```typescript
// src/types/flow-designer.ts
export interface FlowData {
  nodes: Node[]
  edges: Edge[]
  flowProps: FlowProperties
}

export interface FlowDesignerEvents {
  'flow-save': FlowData
  'flow-load': FlowData
  'node-add': Node
  'node-remove': string
  'node-select': Node | null
  'connection-add': Edge
  'connection-remove': string
}

export interface FlowDesignerMethods {
  exportFlow(): FlowData
  importFlow(data: FlowData): void
  clearFlow(): void
  addNode(nodeData: Partial<Node>): Node
  removeNode(nodeId: string): void
  getFlowData(): FlowData
  setReadonly(readonly: boolean): void
}
```

### 2. Modificaciones al sistema de stores

#### 2.1 Hacer stores independientes del contexto global
```typescript
// src/stores/flow-instance.ts
import { createPinia } from 'pinia'

export function createFlowInstance() {
  const pinia = createPinia()
  return {
    pinia,
    // Retornar stores específicos para esta instancia
    flowStore: useFlowStore(pinia),
    nodeTypesStore: useNodeTypesStore(pinia)
  }
}
```

### 3. Sistema de eventos mejorado

#### 3.1 Event emitter centralizado
```typescript
// src/utils/event-manager.ts
export class FlowDesignerEventManager {
  private element: HTMLElement
  
  constructor(element: HTMLElement) {
    this.element = element
  }
  
  emit<K extends keyof FlowDesignerEvents>(
    eventName: K, 
    detail: FlowDesignerEvents[K]
  ) {
    this.element.dispatchEvent(
      new CustomEvent(eventName, { 
        detail, 
        bubbles: true,
        composed: true 
      })
    )
  }
}
```

---

## 🌐 Implementación del Web Component

### 1. Definición del Custom Element

```typescript
// src/web-component/FlowDesignerElement.ts
import { defineCustomElement } from 'vue'
import FlowDesignerRoot from '../components/FlowDesignerRoot.vue'
import { FlowDesignerEventManager } from '../utils/event-manager'
import type { FlowData, FlowDesignerMethods } from '../types/flow-designer'

// Configurar Vue app para Web Component
const FlowDesignerElement = defineCustomElement({
  ...FlowDesignerRoot,
  
  // Props que serán atributos del Web Component
  props: {
    initialData: {
      type: [String, Object],
      default: null
    },
    hideNodePanel: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      default: 'dark',
      validator: (value: string) => ['light', 'dark'].includes(value)
    },
    storageKey: {
      type: String,
      default: 'flow-designer-data'
    }
  },
  
  setup(props, { emit, expose }) {
    const eventManager = new FlowDesignerEventManager(getCurrentInstance()?.proxy?.$el)
    
    // Métodos públicos del Web Component
    const publicMethods: FlowDesignerMethods = {
      exportFlow(): FlowData {
        const data = getFlowData()
        eventManager.emit('flow-save', data)
        return data
      },
      
      importFlow(data: FlowData): void {
        setFlowData(data)
        eventManager.emit('flow-load', data)
      },
      
      clearFlow(): void {
        clearFlowData()
        eventManager.emit('flow-save', getEmptyFlowData())
      },
      
      addNode(nodeData: Partial<Node>): Node {
        const node = createNode(nodeData)
        eventManager.emit('node-add', node)
        return node
      },
      
      removeNode(nodeId: string): void {
        deleteNode(nodeId)
        eventManager.emit('node-remove', nodeId)
      },
      
      getFlowData(): FlowData {
        return getCurrentFlowData()
      },
      
      setReadonly(readonly: boolean): void {
        updateReadonlyState(readonly)
      }
    }
    
    // Exponer métodos públicos
    expose(publicMethods)
    
    // Observar cambios y emitir eventos
    watch(selectedNode, (node) => {
      eventManager.emit('node-select', node)
    })
    
    watch(nodes, () => {
      eventManager.emit('flow-save', getFlowData())
    }, { deep: true })
    
    return {
      ...useFlowDesigner(props),
      ...publicMethods
    }
  }
})

export default FlowDesignerElement
```

### 2. Registro del Web Component

```typescript
// src/web-component/register.ts
import FlowDesignerElement from './FlowDesignerElement'

// Registrar el Web Component globalmente
if (!customElements.get('flow-designer')) {
  customElements.define('flow-designer', FlowDesignerElement)
}

// Para TypeScript - declarar el elemento en el DOM
declare global {
  interface HTMLElementTagNameMap {
    'flow-designer': FlowDesignerElement & FlowDesignerMethods
  }
}

export { FlowDesignerElement }
```

### 3. Configuración de estilos aislados

```typescript
// src/web-component/styles.ts
export const getIsolatedStyles = () => `
  :host {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 400px;
    min-width: 600px;
    --flow-designer-primary: #007bff;
    --flow-designer-background: #1e1e1e;
    --flow-designer-surface: #2d2d30;
    --flow-designer-text: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  :host([theme="light"]) {
    --flow-designer-background: #ffffff;
    --flow-designer-surface: #f5f5f5;
    --flow-designer-text: #333333;
  }
  
  :host([readonly]) {
    pointer-events: none;
    opacity: 0.7;
  }
  
  /* Encapsular todos los estilos dentro del componente */
  .flow-designer-root {
    width: 100%;
    height: 100%;
    background: var(--flow-designer-background);
    color: var(--flow-designer-text);
    position: relative;
    overflow: hidden;
  }
`
```

---

## 📡 API del Web Component

### 1. Atributos HTML

```html
<flow-designer 
  initial-data='{"nodes":[],"edges":[]}'
  hide-node-panel="false"
  readonly="false"
  theme="dark"
  storage-key="my-flow-data">
</flow-designer>
```

### 2. Propiedades JavaScript

```typescript
const flowDesigner = document.querySelector('flow-designer')

// Configurar datos iniciales
flowDesigner.initialData = {
  nodes: [...],
  edges: [...],
  flowProps: {...}
}

// Configurar tema
flowDesigner.theme = 'light'

// Modo solo lectura
flowDesigner.readonly = true
```

### 3. Métodos públicos

```typescript
const flowDesigner = document.querySelector('flow-designer')

// Exportar el flujo actual
const data = flowDesigner.exportFlow()

// Importar datos
flowDesigner.importFlow({
  nodes: [...],
  edges: [...],
  flowProps: {...}
})

// Limpiar el flujo
flowDesigner.clearFlow()

// Agregar nodo programáticamente
const newNode = flowDesigner.addNode({
  type: 'webhook',
  label: 'Mi Webhook',
  position: { x: 100, y: 100 }
})

// Remover nodo
flowDesigner.removeNode('node-id')

// Obtener datos actuales
const currentData = flowDesigner.getFlowData()

// Cambiar modo readonly
flowDesigner.setReadonly(true)
```

### 4. Eventos customizados

```typescript
const flowDesigner = document.querySelector('flow-designer')

// Escuchar cuando se guarda el flujo
flowDesigner.addEventListener('flow-save', (event) => {
  console.log('Flow saved:', event.detail)
  // Enviar a servidor, guardar en base de datos, etc.
})

// Escuchar cuando se carga un flujo
flowDesigner.addEventListener('flow-load', (event) => {
  console.log('Flow loaded:', event.detail)
})

// Escuchar cuando se agrega un nodo
flowDesigner.addEventListener('node-add', (event) => {
  console.log('Node added:', event.detail)
})

// Escuchar cuando se remueve un nodo
flowDesigner.addEventListener('node-remove', (event) => {
  console.log('Node removed:', event.detail)
})

// Escuchar selección de nodos
flowDesigner.addEventListener('node-select', (event) => {
  console.log('Node selected:', event.detail)
})

// Escuchar cuando se agregan conexiones
flowDesigner.addEventListener('connection-add', (event) => {
  console.log('Connection added:', event.detail)
})
```

---

## ⚛️ Wrapper para React

### 1. Hook personalizado para Web Component

```typescript
// src/wrappers/react/useFlowDesigner.ts
import { useRef, useEffect, useCallback } from 'react'
import type { FlowData, FlowDesignerMethods } from '../../types/flow-designer'

interface UseFlowDesignerProps {
  initialData?: FlowData
  hideNodePanel?: boolean
  readonly?: boolean
  theme?: 'light' | 'dark'
  storageKey?: string
  onFlowSave?: (data: FlowData) => void
  onFlowLoad?: (data: FlowData) => void
  onNodeAdd?: (node: Node) => void
  onNodeRemove?: (nodeId: string) => void
  onNodeSelect?: (node: Node | null) => void
  onConnectionAdd?: (edge: Edge) => void
}

export const useFlowDesigner = (props: UseFlowDesignerProps) => {
  const ref = useRef<HTMLElement & FlowDesignerMethods>(null)
  
  // Configurar propiedades del Web Component
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    if (props.initialData) element.initialData = props.initialData
    if (props.hideNodePanel !== undefined) element.hideNodePanel = props.hideNodePanel
    if (props.readonly !== undefined) element.readonly = props.readonly
    if (props.theme) element.theme = props.theme
    if (props.storageKey) element.storageKey = props.storageKey
  }, [props.initialData, props.hideNodePanel, props.readonly, props.theme, props.storageKey])
  
  // Configurar event listeners
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const handlers = {
      'flow-save': props.onFlowSave,
      'flow-load': props.onFlowLoad,
      'node-add': props.onNodeAdd,
      'node-remove': props.onNodeRemove,
      'node-select': props.onNodeSelect,
      'connection-add': props.onConnectionAdd
    }
    
    const listeners: Array<[string, EventListener]> = []
    
    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) {
        const listener = (e: CustomEvent) => handler(e.detail)
        element.addEventListener(event, listener)
        listeners.push([event, listener])
      }
    })
    
    return () => {
      listeners.forEach(([event, listener]) => {
        element.removeEventListener(event, listener)
      })
    }
  }, [props.onFlowSave, props.onFlowLoad, props.onNodeAdd, props.onNodeRemove, props.onNodeSelect, props.onConnectionAdd])
  
  // Métodos imperatives
  const methods = {
    exportFlow: useCallback(() => ref.current?.exportFlow(), []),
    importFlow: useCallback((data: FlowData) => ref.current?.importFlow(data), []),
    clearFlow: useCallback(() => ref.current?.clearFlow(), []),
    addNode: useCallback((nodeData: Partial<Node>) => ref.current?.addNode(nodeData), []),
    removeNode: useCallback((nodeId: string) => ref.current?.removeNode(nodeId), []),
    getFlowData: useCallback(() => ref.current?.getFlowData(), []),
    setReadonly: useCallback((readonly: boolean) => ref.current?.setReadonly(readonly), [])
  }
  
  return { ref, ...methods }
}
```

### 2. Componente React wrapper

```tsx
// src/wrappers/react/FlowDesigner.tsx
import React, { forwardRef, useImperativeHandle } from 'react'
import { useFlowDesigner } from './useFlowDesigner'
import type { FlowData, FlowDesignerMethods } from '../../types/flow-designer'

// Asegurar que el Web Component está registrado
import '../../web-component/register'

interface FlowDesignerProps {
  initialData?: FlowData
  hideNodePanel?: boolean
  readonly?: boolean
  theme?: 'light' | 'dark'
  storageKey?: string
  className?: string
  style?: React.CSSProperties
  onFlowSave?: (data: FlowData) => void
  onFlowLoad?: (data: FlowData) => void
  onNodeAdd?: (node: Node) => void
  onNodeRemove?: (nodeId: string) => void
  onNodeSelect?: (node: Node | null) => void
  onConnectionAdd?: (edge: Edge) => void
}

export const FlowDesigner = forwardRef<FlowDesignerMethods, FlowDesignerProps>(
  (props, forwardedRef) => {
    const { ref, ...methods } = useFlowDesigner(props)
    
    // Exponer métodos via ref
    useImperativeHandle(forwardedRef, () => methods, [methods])
    
    return (
      <flow-designer
        ref={ref}
        className={props.className}
        style={props.style}
      />
    )
  }
)

FlowDesigner.displayName = 'FlowDesigner'

export default FlowDesigner
```

### 3. Ejemplo de uso en React

```tsx
// examples/react-example/App.tsx
import React, { useRef, useState } from 'react'
import { FlowDesigner } from '@flow-designer/react'
import type { FlowData, FlowDesignerMethods } from '@flow-designer/core'

function App() {
  const flowRef = useRef<FlowDesignerMethods>(null)
  const [flowData, setFlowData] = useState<FlowData | null>(null)
  
  const handleSave = (data: FlowData) => {
    setFlowData(data)
    console.log('Flow saved:', data)
    
    // Guardar en servidor
    fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }
  
  const handleExport = () => {
    const data = flowRef.current?.exportFlow()
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'flow.json'
      a.click()
    }
  }
  
  const handleAddWebhook = () => {
    flowRef.current?.addNode({
      type: 'webhook',
      label: 'New Webhook',
      position: { x: Math.random() * 500, y: Math.random() * 300 }
    })
  }
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ padding: '10px', background: '#f0f0f0' }}>
        <button onClick={handleExport}>Export Flow</button>
        <button onClick={handleAddWebhook}>Add Webhook</button>
        <button onClick={() => flowRef.current?.clearFlow()}>Clear</button>
      </div>
      
      <FlowDesigner
        ref={flowRef}
        theme="dark"
        style={{ height: 'calc(100vh - 60px)' }}
        onFlowSave={handleSave}
        onNodeAdd={(node) => console.log('Node added:', node)}
        onNodeSelect={(node) => console.log('Selected:', node)}
      />
    </div>
  )
}

export default App
```

---

## 🔨 Build y empaquetado

### 1. Configuración de Vite para Web Component

```typescript
// vite.config.webcomponent.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Configurar para Web Components
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    })
  ],
  
  build: {
    lib: {
      entry: resolve(__dirname, 'src/web-component/register.ts'),
      name: 'FlowDesigner',
      fileName: 'flow-designer',
      formats: ['es', 'umd']
    },
    
    rollupOptions: {
      // Externalizar dependencias grandes si es necesario
      external: [],
      
      output: {
        // Configurar globals para UMD
        globals: {}
      }
    },
    
    // Optimizaciones para Web Component
    cssCodeSplit: false,
    sourcemap: true,
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  define: {
    // Configurar para producción
    'process.env.NODE_ENV': '"production"'
  }
})
```

### 2. Configuración para React wrapper

```typescript
// vite.config.react.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  build: {
    lib: {
      entry: resolve(__dirname, 'src/wrappers/react/index.ts'),
      name: 'FlowDesignerReact',
      fileName: 'flow-designer-react',
      formats: ['es', 'cjs']
    },
    
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
```

### 3. Scripts de build

```json
// package.json
{
  "scripts": {
    "build:webcomponent": "vite build --config vite.config.webcomponent.ts",
    "build:react": "vite build --config vite.config.react.ts",
    "build:types": "vue-tsc --declaration --emitDeclarationOnly",
    "build:all": "npm run build:webcomponent && npm run build:react && npm run build:types",
    "dev:webcomponent": "vite --config vite.config.webcomponent.ts",
    "dev:react": "vite --config vite.config.react.ts"
  }
}
```

---

## 📦 Publicación como paquete NPM

### 1. Estructura del paquete

```json
// package.json
{
  "name": "@flow-designer/core",
  "version": "1.0.0",
  "description": "A powerful flow designer as a Web Component",
  "main": "dist/flow-designer.umd.js",
  "module": "dist/flow-designer.es.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/flow-designer.es.js",
      "require": "./dist/flow-designer.umd.js",
      "types": "./dist/types/index.d.ts"
    },
    "./react": {
      "import": "./dist/flow-designer-react.es.js",
      "require": "./dist/flow-designer-react.cjs.js",
      "types": "./dist/types/react.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "flow-designer",
    "web-component",
    "vue",
    "react",
    "workflow",
    "visual-programming"
  ],
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  }
}
```

### 2. Múltiples paquetes (monorepo)

```json
// packages/core/package.json
{
  "name": "@flow-designer/core",
  "main": "dist/flow-designer.umd.js",
  "module": "dist/flow-designer.es.js"
}

// packages/react/package.json
{
  "name": "@flow-designer/react",
  "dependencies": {
    "@flow-designer/core": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}

// packages/angular/package.json (futuro)
{
  "name": "@flow-designer/angular",
  "dependencies": {
    "@flow-designer/core": "workspace:*"
  }
}
```

---

## 📚 Documentación de uso

### 1. Instalación

```bash
# Web Component standalone
npm install @flow-designer/core

# Con wrapper para React
npm install @flow-designer/core @flow-designer/react

# Con CDN (para vanilla JS)
<script src="https://unpkg.com/@flow-designer/core/dist/flow-designer.umd.js"></script>
```

### 2. Uso básico

#### Vanilla JavaScript
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/@flow-designer/core"></script>
</head>
<body>
  <flow-designer 
    theme="dark"
    style="width: 100%; height: 500px;">
  </flow-designer>
  
  <script>
    const designer = document.querySelector('flow-designer')
    
    designer.addEventListener('flow-save', (e) => {
      console.log('Flow data:', e.detail)
    })
    
    // Agregar nodo programáticamente
    designer.addNode({
      type: 'webhook',
      label: 'My Webhook'
    })
  </script>
</body>
</html>
```

#### React
```tsx
import { FlowDesigner } from '@flow-designer/react'

function App() {
  return (
    <FlowDesigner
      theme="dark"
      style={{ width: '100%', height: '500px' }}
      onFlowSave={(data) => console.log('Saved:', data)}
    />
  )
}
```

#### Vue.js
```vue
<template>
  <flow-designer
    theme="dark"
    style="width: 100%; height: 500px"
    @flow-save="handleSave"
  />
</template>

<script setup>
import '@flow-designer/core'

const handleSave = (event) => {
  console.log('Flow saved:', event.detail)
}
</script>
```

### 3. Integración avanzada

#### Con frameworks de backend
```typescript
// Next.js API integration
const FlowDesignerPage = () => {
  const saveFlow = async (data: FlowData) => {
    await fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }
  
  return (
    <FlowDesigner
      onFlowSave={saveFlow}
      initialData={await getServerSideProps()}
    />
  )
}
```

---

## ⚠️ Consideraciones y limitaciones

### 1. Consideraciones técnicas

#### **Shadow DOM vs Light DOM**
- **Shadow DOM** (por defecto): Encapsulación completa pero puede limitar la personalización
- **Light DOM**: Mayor flexibilidad pero posibles conflictos de estilos

#### **Bundle size**
- Web Component completo: ~800KB (gzipped: ~250KB)
- Optimizaciones posibles:
  - Tree-shaking de componentes no utilizados
  - Carga lazy de paneles opcionales
  - Externalización de dependencias grandes

#### **Performance**
- Múltiples instancias: cada Web Component es independiente
- Memory management: cleanup automático en disconnect
- Virtual scrolling para listas grandes de nodos

### 2. Limitaciones conocidas

#### **CSS Customization**
```css
/* Solo se pueden personalizar CSS custom properties */
flow-designer {
  --flow-designer-primary: #007bff;
  --flow-designer-background: #1e1e1e;
  --flow-designer-node-border: #333;
}
```

#### **Event bubbling**
- Eventos custom funcionan normalmente
- Algunos eventos nativos pueden requerir configuración especial

#### **TypeScript Support**
- Soporte completo en wrappers (React, Angular)
- Soporte básico en vanilla JS (requiere declaration files)

### 3. Roadmap futuro

#### **Versión 1.x**
- ✅ Web Component básico
- ✅ React wrapper
- ✅ Eventos y API completa

#### **Versión 2.x**
- 🔄 Angular wrapper
- 🔄 Svelte wrapper
- 🔄 Plugins system
- 🔄 Themes engine

#### **Versión 3.x**
- 🔄 Real-time collaboration
- 🔄 Advanced animations
- 🔄 Mobile support

---

## 🎯 Próximos pasos

1. **Refactorizar componentes actuales** para soportar Web Components
2. **Implementar el custom element** con Vue 3
3. **Crear sistema de eventos** unificado
4. **Desarrollar wrapper para React** 
5. **Configurar build pipeline** para múltiples targets
6. **Crear documentación** y ejemplos
7. **Publicar en NPM** como paquete scoped
8. **Crear landing page** con ejemplos interactivos

---

*Este documento será actualizado conforme avance la implementación del Web Component.*
