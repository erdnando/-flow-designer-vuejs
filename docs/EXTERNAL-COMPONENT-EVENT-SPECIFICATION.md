# Especificación de Eventos para Componentes Externos

## 📋 Resumen

Los componentes externos deben implementar un sistema de eventos específico para comunicarse correctamente con el Flow Designer y permitir la captura de parámetros de entrada y salida.

## 🔄 Parámetros de Entrada

Los componentes externos recibirán los siguientes atributos:

### Atributos HTML
```html
<landing-web-component 
  session-id="sim-1754512345678"
  user-id="user-1754512345678"
  config='{"theme":"dark","showFooter":true,"simulationMode":true,"zoomLevel":0.85}'
  flow-context='{"sessionId":"sim-1754512345678","currentStep":"landing","simulationMode":true,"currentStep":1,"totalSteps":4,"componentId":"landing","componentVersion":"1.0.0"}'
>
</landing-web-component>
```

### Estructura del objeto `config`:
```typescript
interface Config {
  theme: 'dark' | 'light';
  showFooter: boolean;
  simulationMode: boolean;
  zoomLevel: number;
  [key: string]: any;
}
```

### Estructura del objeto `flow-context`:
```typescript
interface FlowContext {
  sessionId: string;
  currentStep: string | number;
  totalSteps: number;
  simulationMode: boolean;
  componentId: string;
  componentVersion: string;
  [key: string]: any;
}
```

## 📤 Eventos de Salida

Los componentes externos deben emitir los siguientes eventos personalizados:

### 1. Evento `component-ready`

**Cuándo emitir:** Cuando el componente ha terminado de cargar y está listo para interactuar.

```typescript
// Ejemplo de emisión
this.dispatchEvent(new CustomEvent('component-ready', {
  detail: {
    componentId: 'landing',
    version: '1.0.0',
    ready: true,
    capabilities: ['form_submission', 'time_tracking']
  }
}));
```

### 2. Evento `output-data` (Principal)

**Cuándo emitir:** Cuando el usuario completa la interacción y se tienen datos para enviar al siguiente paso.

```typescript
// Ejemplo con horaInicio y horaFin
this.dispatchEvent(new CustomEvent('output-data', {
  detail: {
    // Parámetros principales
    horaInicio: '2025-01-15T10:30:00.000Z',
    horaFin: '2025-01-15T11:00:00.000Z',
    
    // Otros datos capturados
    resultado: 'completado',
    tipoTarjeta: 'bradescard',
    montoAproved: 50000,
    
    // Datos estructurados
    datosPersonales: {
      nombre: 'Juan Pérez',
      email: 'juan.perez@example.com',
      telefono: '+52-555-123-4567'
    },
    
    // Metadatos
    metadata: {
      duracionSegundos: 1800,
      pantallasVisitadas: ['inicio', 'formulario', 'confirmacion'],
      interacciones: 15
    }
  }
}));
```

### 3. Evento `request-navigation`

**Cuándo emitir:** Cuando el componente necesita solicitar navegación (anterior/siguiente).

```typescript
// Para ir al paso anterior
this.dispatchEvent(new CustomEvent('request-navigation', {
  detail: {
    direction: 'previous',
    reason: 'user_requested'
  }
}));

// Para ir al siguiente paso (alternativa a output-data)
this.dispatchEvent(new CustomEvent('request-navigation', {
  detail: {
    direction: 'next',
    outputData: { /* datos opcionales */ }
  }
}));
```

### 4. Evento `component-error`

**Cuándo emitir:** Cuando ocurre un error que debe ser manejado por el Flow Designer.

```typescript
this.dispatchEvent(new CustomEvent('component-error', {
  detail: {
    error: 'network_timeout',
    message: 'No se pudo conectar con el servidor',
    severity: 'high',
    recoverable: true
  }
}));
```

## 🎯 Casos de Uso Específicos

### Caso 1: Captura de Tiempo de Sesión

```typescript
// Al inicio del componente
const horaInicio = new Date().toISOString();

// Al completar el proceso
const horaFin = new Date().toISOString();

this.dispatchEvent(new CustomEvent('output-data', {
  detail: {
    horaInicio,
    horaFin,
    duracionMinutos: Math.round((new Date(horaFin) - new Date(horaInicio)) / 60000),
    // otros datos...
  }
}));
```

### Caso 2: Formulario con Validación

```typescript
// Validar datos antes de enviar
const formData = this.validateForm();

if (formData.isValid) {
  this.dispatchEvent(new CustomEvent('output-data', {
    detail: {
      horaInicio: this.sessionStartTime,
      horaFin: new Date().toISOString(),
      formularioCompleto: true,
      datosCapturados: formData.data,
      validacionExitosa: true
    }
  }));
} else {
  this.dispatchEvent(new CustomEvent('component-error', {
    detail: {
      error: 'validation_failed',
      message: 'Algunos campos requeridos están vacíos',
      fields: formData.invalidFields
    }
  }));
}
```

### Caso 3: Proceso con Múltiples Etapas

```typescript
// Para procesos internos que no requieren cambio de paso
this.dispatchEvent(new CustomEvent('progress-update', {
  detail: {
    stage: 'processing_payment',
    progress: 75,
    message: 'Procesando pago...'
  }
}));

// Al finalizar todo el proceso
this.dispatchEvent(new CustomEvent('output-data', {
  detail: {
    horaInicio: this.processStartTime,
    horaFin: new Date().toISOString(),
    procesoCompletado: true,
    resultado: 'aprobado',
    numeroTransaccion: 'TXN-123456789'
  }
}));
```

## 🧪 Ejemplo de Implementación en React

```typescript
// Hook para manejar la comunicación con Flow Designer
function useFlowDesignerCommunication() {
  const [sessionData, setSessionData] = useState({
    horaInicio: new Date().toISOString(),
    horaFin: null
  });

  // Función para emitir datos de salida
  const emitOutputData = (data: any) => {
    const outputData = {
      horaInicio: sessionData.horaInicio,
      horaFin: new Date().toISOString(),
      ...data
    };

    // Emitir evento al elemento padre (web component)
    if (window.parent && window.parent !== window) {
      window.parent.dispatchEvent(new CustomEvent('output-data', {
        detail: outputData
      }));
    }
  };

  // Función para emitir componente listo
  const emitReady = () => {
    const event = new CustomEvent('component-ready', {
      detail: {
        componentId: 'landing',
        version: '1.0.0',
        ready: true,
        timestamp: new Date().toISOString()
      }
    });

    if (window.parent && window.parent !== window) {
      window.parent.dispatchEvent(event);
    }
  };

  return { emitOutputData, emitReady, sessionData };
}

// Componente principal
function LandingComponent() {
  const { emitOutputData, emitReady } = useFlowDesignerCommunication();

  useEffect(() => {
    // Emitir que el componente está listo
    emitReady();
  }, []);

  const handleFormSubmit = (formData: any) => {
    // Emitir datos de salida con horaInicio y horaFin
    emitOutputData({
      resultado: 'formulario_completado',
      datosCapturados: formData,
      tipoTarjeta: 'bradescard',
      // otros datos específicos...
    });
  };

  return (
    <div>
      {/* Tu componente React aquí */}
    </div>
  );
}
```

## 🔍 Testing y Debugging

### Simular Eventos desde la Consola del Navegador

```javascript
// Simular evento de datos de salida
window.simulateOutputData = function() {
  const event = new CustomEvent('output-data', {
    detail: {
      horaInicio: '2025-01-15T10:30:00.000Z',
      horaFin: new Date().toISOString(),
      resultado: 'test_completado',
      datos: { test: true }
    }
  });
  
  // Encontrar el elemento del componente
  const component = document.querySelector('landing-web-component');
  if (component) {
    component.dispatchEvent(event);
  }
};

// Simular error
window.simulateError = function() {
  const event = new CustomEvent('component-error', {
    detail: {
      error: 'test_error',
      message: 'Este es un error de prueba'
    }
  });
  
  const component = document.querySelector('landing-web-component');
  if (component) {
    component.dispatchEvent(event);
  }
};
```

### Verificar Captura de Datos

En la consola del Flow Designer, usar:

```javascript
// Ver todos los datos capturados
window.debugWizardOutput();

// Simular datos de salida
window.simulateOutputData();

// Ver parámetros de tiempo específicos
console.log(window.extractTimeParameters());
```

## ✅ Checklist de Implementación

- [ ] El componente emite `component-ready` al cargar
- [ ] Se capturan `horaInicio` al inicializar
- [ ] Se capturan `horaFin` al completar
- [ ] Se emite `output-data` con la estructura correcta
- [ ] Se manejan errores con `component-error`
- [ ] Se prueban los eventos desde la consola
- [ ] Se verifican los datos en `window.debugWizardOutput()`

## 📚 Referencias

- [CustomEvent MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [Web Components Events](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
- Flow Designer External Component Integration Guide
