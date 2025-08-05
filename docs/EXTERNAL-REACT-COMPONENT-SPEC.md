# 📋 Especificación de Componentes React Externos

## 🎯 **Propósito**
Esta documentación define el estándar para crear componentes React que pueden ser integrados dinámicamente en el Flow Designer Vue. Cada fábrica de software debe seguir estas especificaciones para asegurar compatibilidad.

---

## 🏗️ **Arquitectura del Componente**

### **Estructura del Proyecto React**
```
landing-component/
├── package.json
├── webpack.config.js
├── tsconfig.json
├── src/
│   ├── index.ts                 # Entry point
│   ├── LandingComponent.tsx     # Componente React principal
│   ├── LandingComponent.css     # Estilos del componente
│   └── LandingWebComponent.ts   # Web Component wrapper
├── dist/
│   └── landing-v1.0.0.js       # Bundle compilado
├── public/
│   └── demo.html               # Demo para testing
└── docs/
    └── README.md               # Documentación del componente
```

---

## 📦 **Configuración del Proyecto**

### **package.json**
```json
{
  "name": "landing-component",
  "version": "1.0.0",
  "description": "Landing Page Component for Flow Designer",
  "main": "dist/landing-v1.0.0.js",
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack serve --mode development",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.0",
    "webpack-dev-server": "^4.15.0",
    "ts-loader": "^9.4.0",
    "css-loader": "^6.8.0",
    "style-loader": "^3.3.0"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  }
}
```

### **webpack.config.js**
```javascript
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'landing-v1.0.0.js',
    library: 'LandingComponent',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  externals: {
    // React será proporcionado globalmente por el host
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3001,
    hot: true,
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  }
};
```

### **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "jsx": "react-jsx",
    "declaration": true,
    "outDir": "dist"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

---

## 🎨 **Implementación del Componente React**

### **src/LandingComponent.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import './LandingComponent.css';

interface LandingComponentProps {
  sessionId?: string;
  userId?: string;
  flowContext?: any;
  config?: {
    title?: string;
    subtitle?: string;
    logo?: string;
    primaryColor?: string;
    [key: string]: any;
  };
  inputData?: any;
  
  // Callbacks estándar para comunicación con Flow Designer
  onNext?: (data: any) => void;
  onPrevious?: (data: any) => void;
  onDataChange?: (data: any) => void;
  onError?: (error: string) => void;
  onReady?: () => void;
}

interface LandingFormData {
  email: string;
  telefono: string;
  acepta_terminos: boolean;
}

const LandingComponent: React.FC<LandingComponentProps> = ({
  sessionId,
  userId,
  flowContext,
  config = {},
  inputData,
  onNext,
  onPrevious,
  onDataChange,
  onError,
  onReady
}) => {
  const [formData, setFormData] = useState<LandingFormData>({
    email: '',
    telefono: '',
    acepta_terminos: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Configuración con valores por defecto
  const componentConfig = {
    title: 'Bienvenido al Proceso',
    subtitle: 'Complete los siguientes datos para continuar',
    primaryColor: '#1890ff',
    logo: null,
    ...config
  };

  // Notificar que el componente está listo
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  // Validación de formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = 'Teléfono debe tener 10 dígitos';
    }

    if (!formData.acepta_terminos) {
      newErrors.acepta_terminos = 'Debe aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof LandingFormData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Limpiar error del campo modificado
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Notificar cambios al Flow Designer
    onDataChange?.(newFormData);
  };

  // Continuar al siguiente paso
  const handleContinue = async () => {
    if (!validateForm()) {
      onError?.('Por favor corrija los errores en el formulario');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular validación/procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos que se pasarán al siguiente nodo
      const outputData = {
        landing_data: formData,
        completed_at: new Date().toISOString(),
        session_id: sessionId,
        user_id: userId,
        component: 'landing',
        version: '1.0.0'
      };
      
      onNext?.(outputData);
      
    } catch (error) {
      onError?.('Error procesando los datos. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Volver al paso anterior
  const handlePrevious = () => {
    onPrevious?.({
      action: 'previous',
      current_data: formData
    });
  };

  return (
    <div className="landing-component" style={{ '--primary-color': componentConfig.primaryColor } as any}>
      <div className="landing-container">
        {/* Header */}
        <div className="landing-header">
          {componentConfig.logo && (
            <img src={componentConfig.logo} alt="Logo" className="landing-logo" />
          )}
          <h1 className="landing-title">{componentConfig.title}</h1>
          <p className="landing-subtitle">{componentConfig.subtitle}</p>
        </div>

        {/* Formulario */}
        <form className="landing-form" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="usuario@ejemplo.com"
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telefono" className="form-label">
              Teléfono <span className="required">*</span>
            </label>
            <input
              id="telefono"
              type="tel"
              className={`form-input ${errors.telefono ? 'error' : ''}`}
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              placeholder="55 1234 5678"
              disabled={isLoading}
            />
            {errors.telefono && <span className="error-message">{errors.telefono}</span>}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={formData.acepta_terminos}
                onChange={(e) => handleInputChange('acepta_terminos', e.target.checked)}
                disabled={isLoading}
              />
              <span className="checkbox-text">
                Acepto los <a href="#" target="_blank">términos y condiciones</a> y la <a href="#" target="_blank">política de privacidad</a>
                <span className="required"> *</span>
              </span>
            </label>
            {errors.acepta_terminos && <span className="error-message">{errors.acepta_terminos}</span>}
          </div>

          {/* Botones de navegación */}
          <div className="landing-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={isLoading}
            >
              ← Anterior
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Procesando...
                </>
              ) : (
                'Continuar →'
              )}
            </button>
          </div>
        </form>

        {/* Debug info (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info">
            <details>
              <summary>Debug Info</summary>
              <pre>{JSON.stringify({ sessionId, userId, flowContext, formData }, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingComponent;
```

### **src/LandingComponent.css**
```css
.landing-component {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --error-color: #ff4d4f;
  --warning-color: #faad14;
  --text-color: #333;
  --border-color: #d9d9d9;
  --background-color: #fff;
  --border-radius: 6px;
  
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-color);
  background: var(--background-color);
  
  /* Asegurar que el componente ocupe todo el espacio disponible */
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.landing-container {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
  box-sizing: border-box;
}

/* Header */
.landing-header {
  text-align: center;
  margin-bottom: 32px;
}

.landing-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 16px;
}

.landing-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.landing-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* Formulario */
.landing-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  margin: 0;
}

.required {
  color: var(--error-color);
}

.form-input {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 16px;
  line-height: 1.5;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input.error {
  border-color: var(--error-color);
}

.form-input.error:focus {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  font-size: 12px;
  color: var(--error-color);
  margin: 0;
}

/* Checkbox */
.checkbox-group {
  margin: 8px 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.5;
}

.checkbox-input {
  margin: 0;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-text {
  flex: 1;
}

.checkbox-text a {
  color: var(--primary-color);
  text-decoration: none;
}

.checkbox-text a:hover {
  text-decoration: underline;
}

/* Botones */
.landing-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border: 1px solid transparent;
  border-radius: var(--border-radius);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  box-sizing: border-box;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.btn-secondary {
  background-color: white;
  color: var(--text-color);
  border-color: var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Debug info */
.debug-info {
  margin-top: 32px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: var(--border-radius);
  font-size: 12px;
}

.debug-info details summary {
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 8px;
}

.debug-info pre {
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Responsive */
@media (max-width: 768px) {
  .landing-component {
    padding: 16px;
  }
  
  .landing-container {
    padding: 24px;
  }
  
  .landing-title {
    font-size: 24px;
  }
  
  .landing-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
```

---

## 🌐 **Web Component Wrapper**

### **src/LandingWebComponent.ts**
```typescript
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import LandingComponent from './LandingComponent';

/**
 * Web Component wrapper para LandingComponent
 * Implementa el estándar definido en la documentación técnica
 */
class LandingWebComponentElement extends HTMLElement {
  private reactRoot: Root | null = null;
  private isConnected = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.isConnected = true;
    this.render();
    
    // Notificar que el componente está listo
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('component-ready', {
        detail: { componentId: 'landing', version: '1.0.0' },
        bubbles: true
      }));
    }, 100);
  }

  disconnectedCallback() {
    this.isConnected = false;
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }

  // Atributos observados para reactivity
  static get observedAttributes() {
    return ['session-id', 'user-id', 'flow-context', 'config'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
    }
  }

  // Método público para establecer datos de entrada
  setInputData(data: any) {
    this.setAttribute('input-data', JSON.stringify(data));
    if (this.isConnected) {
      this.render();
    }
  }

  // Método público para obtener datos de salida
  getOutputData() {
    // Implementar según necesidades específicas
    return {
      componentId: 'landing',
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };
  }

  private render() {
    if (!this.shadowRoot) return;

    // Obtener props de los atributos
    const props = {
      sessionId: this.getAttribute('session-id') || undefined,
      userId: this.getAttribute('user-id') || undefined,
      flowContext: this.parseJsonAttribute('flow-context'),
      config: this.parseJsonAttribute('config'),
      inputData: this.parseJsonAttribute('input-data'),
      
      // Callbacks para comunicación con el host
      onNext: (data: any) => {
        this.dispatchEvent(new CustomEvent('output-data', {
          detail: data,
          bubbles: true
        }));
      },
      
      onPrevious: (data: any) => {
        this.dispatchEvent(new CustomEvent('request-navigation', {
          detail: { direction: 'previous', data },
          bubbles: true
        }));
      },
      
      onDataChange: (data: any) => {
        this.dispatchEvent(new CustomEvent('data-changed', {
          detail: data,
          bubbles: true
        }));
      },
      
      onError: (error: string) => {
        this.dispatchEvent(new CustomEvent('node-error', {
          detail: { error },
          bubbles: true
        }));
      },
      
      onReady: () => {
        this.dispatchEvent(new CustomEvent('component-ready', {
          detail: { componentId: 'landing', version: '1.0.0' },
          bubbles: true
        }));
      }
    };

    // Crear container si no existe
    let container = this.shadowRoot.querySelector('#react-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'react-container';
      container.style.width = '100%';
      container.style.height = '100%';
      this.shadowRoot.appendChild(container);
    }

    // Crear o actualizar React root
    if (!this.reactRoot) {
      this.reactRoot = createRoot(container);
    }

    // Renderizar componente React
    this.reactRoot.render(React.createElement(LandingComponent, props));
  }

  private parseJsonAttribute(name: string): any {
    try {
      const value = this.getAttribute(name);
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  }
}

// Registrar el Web Component
customElements.define('landing-web-component', LandingWebComponentElement);

export default LandingWebComponentElement;
```

---

## 📄 **Entry Point**

### **src/index.ts**
```typescript
// Importar React y ReactDOM si no están disponibles globalmente
if (typeof window !== 'undefined') {
  // Verificar si React está disponible globalmente
  if (!(window as any).React) {
    console.warn('React not found globally. Consider providing React as external dependency.');
  }
  
  if (!(window as any).ReactDOM) {
    console.warn('ReactDOM not found globally. Consider providing ReactDOM as external dependency.');
  }
}

// Importar y registrar el Web Component
import './LandingWebComponent';

// Exportar componente React para uso directo si es necesario
export { default as LandingComponent } from './LandingComponent';

// Información del componente para registry
export const componentInfo = {
  id: 'landing',
  name: 'Landing Page Component',
  version: '1.0.0',
  tagName: 'landing-web-component',
  description: 'Componente de página de aterrizaje para captura de datos básicos',
  category: 'Proceso',
  contract: {
    inputs: ['sessionId', 'userId', 'flowContext', 'config', 'inputData'],
    outputs: ['landing_data', 'completed_at', 'session_id', 'user_id'],
    events: [
      'component-ready',
      'output-data', 
      'request-navigation',
      'data-changed',
      'node-error'
    ]
  },
  provider: {
    name: 'Fábrica de Componentes Demo',
    version: '1.0.0',
    contact: 'dev@fabrica-demo.com'
  }
};

console.log(`📦 Landing Component v${componentInfo.version} loaded successfully`);
```

---

## 🧪 **Demo HTML para Testing**

### **public/demo.html**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Component Demo</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f0f2f5;
        }
        
        .demo-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .demo-header {
            text-align: center;
            margin-bottom: 32px;
        }
        
        .demo-component {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-bottom: 32px;
        }
        
        .demo-controls {
            background: #fafafa;
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        
        .demo-controls h3 {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #666;
        }
        
        .demo-controls label {
            display: block;
            margin-bottom: 8px;
            font-size: 12px;
            color: #333;
        }
        
        .demo-controls input, .demo-controls textarea {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            font-size: 12px;
            margin-bottom: 8px;
            box-sizing: border-box;
        }
        
        .demo-controls textarea {
            height: 60px;
            resize: vertical;
        }
        
        .demo-component-wrapper {
            height: 600px;
            border: 1px solid #e8e8e8;
            border-radius: 6px;
            overflow: auto;
        }
        
        .event-log {
            background: #001529;
            color: #fff;
            padding: 16px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            height: 200px;
            overflow-y: auto;
        }
        
        .event-log-item {
            margin-bottom: 4px;
            padding: 2px 0;
            border-bottom: 1px solid #333;
        }
        
        .event-timestamp {
            color: #52c41a;
        }
        
        .event-type {
            color: #1890ff;
            font-weight: bold;
        }
        
        .event-data {
            color: #fff;
        }
    </style>
</head>
<body>
    <div class="demo-container">
        <div class="demo-header">
            <h1>Landing Component Demo</h1>
            <p>Prueba el componente React como Web Component</p>
        </div>
        
        <!-- Controles de configuración -->
        <div class="demo-controls">
            <h3>Configuración del Componente</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                <div>
                    <label>Session ID:</label>
                    <input type="text" id="sessionId" value="demo-session-123" />
                    
                    <label>User ID:</label>
                    <input type="text" id="userId" value="user-456" />
                </div>
                <div>
                    <label>Configuración (JSON):</label>
                    <textarea id="config" placeholder='{"title": "Mi Título", "primaryColor": "#ff6b6b"}'></textarea>
                </div>
                <div>
                    <label>Input Data (JSON):</label>
                    <textarea id="inputData" placeholder='{"previousStep": "start"}'></textarea>
                </div>
            </div>
            <button onclick="updateComponent()" style="margin-top: 8px; padding: 6px 12px;">Actualizar Componente</button>
        </div>
        
        <!-- Componente -->
        <div class="demo-component">
            <h3>Componente Web</h3>
            <div class="demo-component-wrapper">
                <landing-web-component 
                    id="landingComponent"
                    session-id="demo-session-123"
                    user-id="user-456">
                </landing-web-component>
            </div>
        </div>
        
        <!-- Log de eventos -->
        <div class="demo-component">
            <h3>Event Log</h3>
            <div class="event-log" id="eventLog"></div>
            <button onclick="clearLog()" style="margin-top: 8px; padding: 6px 12px;">Limpiar Log</button>
        </div>
    </div>

    <!-- Cargar React desde CDN -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <!-- Cargar el componente -->
    <script src="landing-v1.0.0.js"></script>
    
    <script>
        let eventCount = 0;
        
        // Configurar event listeners
        const component = document.getElementById('landingComponent');
        
        ['component-ready', 'output-data', 'request-navigation', 'data-changed', 'node-error'].forEach(eventType => {
            component.addEventListener(eventType, (event) => {
                logEvent(eventType, event.detail);
            });
        });
        
        function logEvent(type, data) {
            const eventLog = document.getElementById('eventLog');
            const timestamp = new Date().toLocaleTimeString();
            
            const eventItem = document.createElement('div');
            eventItem.className = 'event-log-item';
            eventItem.innerHTML = `
                <span class="event-timestamp">[${timestamp}]</span>
                <span class="event-type">${type}</span>
                <span class="event-data">${JSON.stringify(data, null, 2)}</span>
            `;
            
            eventLog.appendChild(eventItem);
            eventLog.scrollTop = eventLog.scrollHeight;
            
            eventCount++;
            if (eventCount > 50) {
                eventLog.removeChild(eventLog.firstChild);
                eventCount--;
            }
        }
        
        function updateComponent() {
            const component = document.getElementById('landingComponent');
            const sessionId = document.getElementById('sessionId').value;
            const userId = document.getElementById('userId').value;
            const config = document.getElementById('config').value;
            const inputData = document.getElementById('inputData').value;
            
            component.setAttribute('session-id', sessionId);
            component.setAttribute('user-id', userId);
            
            if (config) {
                try {
                    JSON.parse(config); // Validar JSON
                    component.setAttribute('config', config);
                } catch (e) {
                    alert('JSON de configuración inválido');
                    return;
                }
            }
            
            if (inputData) {
                try {
                    const data = JSON.parse(inputData);
                    component.setInputData(data);
                } catch (e) {
                    alert('JSON de input data inválido');
                    return;
                }
            }
            
            logEvent('manual-update', { sessionId, userId, config, inputData });
        }
        
        function clearLog() {
            document.getElementById('eventLog').innerHTML = '';
            eventCount = 0;
        }
        
        // Log inicial
        logEvent('demo-initialized', { timestamp: new Date().toISOString() });
    </script>
</body>
</html>
```

---

## 🚀 **Comandos de Desarrollo**

### **Setup inicial**
```bash
# Instalar dependencias
npm install

# Desarrollo con hot reload
npm run dev
# Abrir http://localhost:3001/demo.html

# Build para producción
npm run build

# Testing
npm test

# Linting
npm run lint
```

### **Integración en Flow Designer**
```typescript
// En el Flow Designer Vue, configurar el componente:
const landingConfig: ComponentConfig = {
  id: 'landing',
  name: 'Landing Page',
  version: '1.0.0',
  cdnUrl: 'http://localhost:3001/dist/landing-v1.0.0.js',
  type: 'web-component',
  contract: {
    inputs: ['sessionId', 'userId', 'flowContext', 'config'],
    outputs: ['landing_data', 'completed_at'],
    events: ['component-ready', 'output-data', 'node-error']
  },
  metadata: {
    description: 'Componente de landing page',
    category: 'Proceso',
    tagName: 'landing-web-component'
  }
};

// Cargar en el simulador
const wrapper = await ExternalComponentLoader.loadComponent(landingConfig);
```

---

## 📋 **Checklist de Desarrollo**

### **Pre-desarrollo:**
- [ ] Definir contract de inputs/outputs
- [ ] Configurar proyecto con TypeScript + React
- [ ] Setup webpack con externals para React
- [ ] Configurar CORS para CDN

### **Desarrollo:**
- [ ] Implementar componente React con props estándar
- [ ] Crear Web Component wrapper
- [ ] Implementar eventos estándar de comunicación
- [ ] Agregar estilos encapsulados
- [ ] Validación de formularios si aplica

### **Testing:**
- [ ] Demo HTML funcional
- [ ] Event logging completo
- [ ] Testing en diferentes navegadores
- [ ] Performance testing (bundle size < 250KB)

### **Deploy:**
- [ ] Build optimizado para producción
- [ ] CDN con CORS configurado
- [ ] Versionado semántico
- [ ] Documentación de integración

---

## 🎯 **Próximos Pasos**

1. **Crear proyecto React independiente** siguiendo esta especificación
2. **Implementar Landing Component** con la funcionalidad específica
3. **Configurar CDN local** para testing
4. **Integrar en Flow Designer** usando ExternalComponentLoader
5. **Testing completo** del flujo end-to-end

---

**Versión**: 1.0  
**Actualización**: Agosto 2025  
**Contacto**: Equipo de Arquitectura Flow Designer

---

*Esta especificación garantiza compatibilidad total con el sistema Flow Designer y permite desarrollo independiente por múltiples fábricas de software.*
