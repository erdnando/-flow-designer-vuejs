# Guía de Integración: Componente Landing Web v1.0.0

Esta guía describe cómo integrar el componente web `landing-web-component` en cualquier aplicación host, independientemente del framework utilizado (Vue.js, Angular, React, o vanilla JavaScript).

> **⚠️ SOLUCIÓN A PROBLEMAS DE ESTILOS:** Si estás teniendo problemas con los estilos que no se aplican correctamente, esta guía actualizada incluye las soluciones implementadas.

## Índice

1. [Prerrequisitos](#prerrequisitos)
2. [Instalación](#instalación)
3. [Uso básico](#uso-básico)
4. [Configuración de propiedades](#configuración-de-propiedades)
5. [Manejo de eventos](#manejo-de-eventos)
6. [Ejemplo completo](#ejemplo-completo)
7. [Integración en frameworks específicos](#integración-en-frameworks-específicos)
8. [Solución de problemas comunes](#solución-de-problemas)
9. [**Solución a problemas de estilos**](#solución-a-problemas-de-estilos)
10. [**Verificación de integración**](#verificación-de-integración)

## Prerrequisitos

- El host debe proporcionar React y ReactDOM como dependencias globales (versión 17.0.0 o superior).
- El bundle del componente debe estar accesible desde la aplicación host.

## Instalación

1. **Incluir el script en tu aplicación**

```html
<!-- Asegúrate de tener React y ReactDOM disponibles globalmente -->
<script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>

<!-- Incluir el bundle del componente -->
<script src="ruta/a/landing-v1.0.0.js"></script>
```

## Uso básico

Una vez incluido el script, puedes usar el componente web en tu HTML:

```html
<landing-web-component 
  session-id="mi-sesion-123"
  user-id="usuario-456">
</landing-web-component>
```

## Configuración de propiedades

El componente acepta las siguientes propiedades:

### Propiedades como atributos HTML

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `session-id` | String | ID de sesión para tracking |
| `user-id` | String | ID del usuario actual |
| `config` | JSON (String) | Configuración en formato JSON |

Ejemplo:

```html
<landing-web-component 
  session-id="mi-sesion-123"
  user-id="usuario-456"
  config='{"title":"Tarjeta de Crédito Personalizada","primaryColor":"#ff0066"}'>
</landing-web-component>
```

### Propiedades complejas vía JavaScript

Para datos más complejos que no pueden pasarse fácilmente como atributos:

```javascript
const landingComponent = document.querySelector('landing-web-component');

// Configurar el contexto del flujo
landingComponent.flowContextData = {
  step: 'landing',
  previousSteps: ['welcome'],
  metadata: {
    campaign: 'verano2025',
    source: 'landing-page'
  }
};

// Establecer datos de entrada
landingComponent.inputDataValue = {
  prefilledData: {
    email: 'usuario@ejemplo.com',
  }
};
```

## Manejo de eventos

El componente emite los siguientes eventos:

| Evento | Descripción | Detalle del evento |
|--------|-------------|-------------------|
| `component-ready` | El componente se ha inicializado | - |
| `output-data` | Datos procesados para el siguiente paso | Objeto con los datos recolectados |
| `request-navigation` | Solicitud para navegar a otro paso | `{ direction: 'previous', data: {...} }` |
| `data-changed` | Los datos han cambiado | Objeto con los datos actualizados |
| `node-error` | Ocurrió un error | `{ message: 'Descripción del error' }` |

Ejemplo de escucha de eventos:

```javascript
const landingComponent = document.querySelector('landing-web-component');

// Manejar datos de salida cuando el usuario completa el formulario
landingComponent.addEventListener('output-data', (event) => {
  const outputData = event.detail;
  console.log('Datos recibidos:', outputData);
  
  // Procesar los datos (ej: enviar al backend, navegar al siguiente paso)
  processData(outputData);
});

// Manejar solicitudes de navegación (ej: botón "Volver")
landingComponent.addEventListener('request-navigation', (event) => {
  const { direction, data } = event.detail;
  if (direction === 'previous') {
    navigateToPreviousStep(data);
  }
});

// Manejar errores
landingComponent.addEventListener('node-error', (event) => {
  const { message } = event.detail;
  showErrorNotification(message);
});

// Detectar cuando el componente está listo
landingComponent.addEventListener('component-ready', () => {
  hideLoadingIndicator();
});
```

## Ejemplo completo

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Integración de Landing Component</title>
  <style>
    #container {
      width: 100%;
      max-width: 375px;
      margin: 0 auto;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="container">
    <landing-web-component 
      session-id="sess_12345"
      user-id="user_6789"
      config='{"title":"Tarjeta Bradescard Promoda","subtitle":"¡Solicítala ahora!"}'>
    </landing-web-component>
  </div>

  <script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
  <script src="./dist/landing-v1.0.0.js"></script>
  
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const landingComponent = document.querySelector('landing-web-component');
      
      // Configuración adicional
      landingComponent.flowContextData = {
        flow: 'credit-card-application',
        step: 1,
        totalSteps: 5
      };
      
      // Manejar completado del formulario
      landingComponent.addEventListener('output-data', (event) => {
        const data = event.detail;
        console.log('Formulario completado:', data);
        
        // Ejemplo: Redireccionar al siguiente paso
        window.location.href = `/next-step?sessionId=${data.session_id}`;
      });
      
      // Manejar navegación hacia atrás
      landingComponent.addEventListener('request-navigation', (event) => {
        const { direction } = event.detail;
        if (direction === 'previous') {
          console.log('Volviendo al paso anterior...');
          window.history.back();
        }
      });
    });
  </script>
</body>
</html>
```

## Integración en frameworks específicos

### React

```jsx
import React, { useEffect, useRef } from 'react';

const LandingIntegration = ({ sessionId, userId, config }) => {
  const componentRef = useRef(null);

  useEffect(() => {
    const component = componentRef.current;
    
    if (!component) return;

    // Configurar propiedades complejas
    component.flowContextData = {
      flow: 'credit-card-application',
      step: 1,
      totalSteps: 5
    };

    const handleOutputData = (event) => {
      console.log('Datos recibidos:', event.detail);
      // Procesar datos o navegar al siguiente paso
    };

    const handleNavigation = (event) => {
      const { direction } = event.detail;
      if (direction === 'previous') {
        // Manejar navegación hacia atrás
      }
    };

    const handleError = (event) => {
      console.error('Error en componente:', event.detail);
    };

    // Agregar event listeners
    component.addEventListener('output-data', handleOutputData);
    component.addEventListener('request-navigation', handleNavigation);
    component.addEventListener('node-error', handleError);

    // Cleanup
    return () => {
      component.removeEventListener('output-data', handleOutputData);
      component.removeEventListener('request-navigation', handleNavigation);
      component.removeEventListener('node-error', handleError);
    };
  }, []);

  return (
    <div className="container">
      <landing-web-component
        ref={componentRef}
        session-id={sessionId}
        user-id={userId}
        config={JSON.stringify(config)}
      />
    </div>
  );
};

// Uso del componente
const App = () => {
  const config = {
    title: 'Tarjeta Bradescard',
    primaryColor: '#e91e63'
  };

  return (
    <LandingIntegration
      sessionId="session123"
      userId="user456"
      config={config}
    />
  );
};
```

### Vue.js

```vue
<template>
  <div class="container">
    <landing-web-component 
      :session-id="sessionId"
      :user-id="userId"
      :config="JSON.stringify(config)"
      ref="landingComponent">
    </landing-web-component>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sessionId: 'session123',
      userId: 'user456',
      config: {
        title: 'Tarjeta Bradescard',
        primaryColor: '#e91e63'
      }
    };
  },
  mounted() {
    // Asegúrate de que el componente web esté definido
    if (typeof customElements.get('landing-web-component') === 'undefined') {
      console.error('El componente landing-web-component no está registrado');
      return;
    }
    
    const landingComponent = this.$refs.landingComponent;
    
    // Configurar propiedades complejas
    landingComponent.flowContextData = this.$store.state.flowContext;
    
    // Escuchar eventos
    landingComponent.addEventListener('output-data', this.handleOutputData);
    landingComponent.addEventListener('request-navigation', this.handleNavigation);
  },
  beforeUnmount() {
    // Limpieza de event listeners
    const landingComponent = this.$refs.landingComponent;
    landingComponent.removeEventListener('output-data', this.handleOutputData);
    landingComponent.removeEventListener('request-navigation', this.handleNavigation);
  },
  methods: {
    handleOutputData(event) {
      const data = event.detail;
      this.$emit('form-completed', data);
      this.$router.push('/next-step');
    },
    handleNavigation(event) {
      const { direction } = event.detail;
      if (direction === 'previous') {
        this.$router.push('/previous-step');
      }
    }
  }
};
</script>
```

### Angular

```typescript
// En tu app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [
    AppComponent,
    // ...
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA // Necesario para usar elementos personalizados
  ],
  // ...
})
export class AppModule { }
```

```typescript
// En tu componente
import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  template: `
    <div class="container">
      <landing-web-component
        [attr.session-id]="sessionId"
        [attr.user-id]="userId"
        [attr.config]="configString"
        #landingComponent>
      </landing-web-component>
    </div>
  `
})
export class LandingPageComponent implements OnInit, OnDestroy {
  @ViewChild('landingComponent') landingComponentRef!: ElementRef;
  
  sessionId = 'session123';
  userId = 'user456';
  configObj = {
    title: 'Tarjeta Bradescard',
    primaryColor: '#e91e63'
  };
  
  get configString() {
    return JSON.stringify(this.configObj);
  }
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    // Verificar si el script se ha cargado correctamente
    if (typeof customElements.get('landing-web-component') === 'undefined') {
      console.error('El componente landing-web-component no está registrado');
    }
  }
  
  ngAfterViewInit() {
    const landingComponent = this.landingComponentRef.nativeElement;
    
    // Configurar propiedades complejas
    landingComponent.flowContextData = { /* datos del flujo */ };
    
    // Añadir event listeners
    landingComponent.addEventListener('output-data', this.handleOutputData);
    landingComponent.addEventListener('request-navigation', this.handleNavigation);
  }
  
  ngOnDestroy() {
    // Limpieza
    const landingComponent = this.landingComponentRef.nativeElement;
    landingComponent.removeEventListener('output-data', this.handleOutputData);
    landingComponent.removeEventListener('request-navigation', this.handleNavigation);
  }
  
  handleOutputData = (event: CustomEvent) => {
    const data = event.detail;
    // Procesar los datos
    this.router.navigate(['/next-step']);
  }
  
  handleNavigation = (event: CustomEvent) => {
    const { direction } = event.detail;
    if (direction === 'previous') {
      this.router.navigate(['/previous-step']);
    }
  }
}
```

## Solución de problemas

### El componente no se renderiza

1. Verifica que React y ReactDOM estén disponibles globalmente en el scope
2. Asegúrate de que el script del componente se haya cargado correctamente
3. Comprueba la consola del navegador para ver errores específicos

### Problemas con los estilos

El componente utiliza Shadow DOM para encapsular sus estilos, por lo que los estilos de la aplicación host no afectarán al componente. Sin embargo, puede ser necesario ajustar el contenedor del componente para que se adapte correctamente.

### Eventos no se disparan

Asegúrate de que estás escuchando los eventos después de que el componente esté conectado al DOM. El evento `component-ready` puede usarse para saber cuándo el componente está listo.

---

## Solución a problemas de estilos

Si estás experimentando problemas con los estilos del componente que no se aplican correctamente al integrar en otra aplicación, sigue estas soluciones:

### 1. Versión actualizada del componente

Asegúrate de estar utilizando la versión más reciente del componente (v1.0.0 o posterior), que incluye mejoras significativas en el manejo de estilos.

### 2. Usar el script de inicialización

Incluye el script de inicialización que garantiza que el componente se registra correctamente:

```html
<script src="ruta/a/integration-init.js"></script>
```

Este script verifica y soluciona problemas comunes de registro del componente.

### 3. Modo de carga recomendado

Para garantizar que los estilos se cargan correctamente:

```html
<!-- RECOMENDADO: Cargar primero el script -->
<script src="ruta/a/landing-v1.0.0.js"></script>

<!-- Luego añadir el componente después de que el script se haya cargado -->
<landing-web-component session-id="..." user-id="..."></landing-web-component>
```

### 4. Diagnóstico de problemas de estilos

Si los estilos siguen sin aparecer:

1. Verifica que el Shadow DOM se está creando correctamente:
```javascript
const component = document.querySelector('landing-web-component');
console.log('Shadow root:', component.shadowRoot); // Debe mostrar el shadow root
```

2. Asegúrate de que los elementos <style> se están insertando en el Shadow DOM:
```javascript
console.log('Estilos:', component.shadowRoot.querySelectorAll('style').length); // Debería ser > 0
```

3. Utiliza nuestro validador de integración para diagnóstico automático:
```javascript
// Después de cargar el componente
if (window.LandingComponentValidator) {
    window.LandingComponentValidator.generateReport();
}
```

### 5. Solución manual de emergencia

Si todo lo demás falla, puedes forzar la aplicación de estilos:

```javascript
// SOLUCIÓN DE EMERGENCIA
const component = document.querySelector('landing-web-component');
if (component && window._landingComponentStyles) {
    const style = document.createElement('style');
    style.textContent = window._landingComponentStyles.join('\n');
    component.shadowRoot.appendChild(style);
    console.log('Estilos aplicados manualmente');
}
```

## Verificación de integración

Para verificar que el componente está correctamente integrado, utiliza nuestra herramienta de validación incluida:

### 1. Incluir el validador

```html
<script src="ruta/a/component-validator.js"></script>
```

### 2. Ejecutar la validación

```javascript
// Esperar a que el componente esté listo
setTimeout(() => {
    if (window.LandingComponentValidator) {
        window.LandingComponentValidator.generateReport()
            .then(result => {
                console.log('Resultado de validación:', result);
                if (!result.success) {
                    console.error('Problemas detectados:', result.errors);
                }
            });
    }
}, 1000);
```

### 3. Prueba con página de integración

Para una validación completa, usa nuestra página de prueba de integración:

1. Clona el repositorio
2. Ejecuta: `npm run serve`
3. Abre: `http://localhost:3001/integration-test`

Esta página te permitirá probar todas las funcionalidades del componente y diagnosticar cualquier problema.

---

## Scripts útiles

El proyecto incluye varios scripts para facilitar el desarrollo e integración:

```bash
# Desarrollo local
npm run dev

# Compilar para producción
npm run build

# Compilar y servir para pruebas de integración
npm run serve

# Iniciar servidor para pruebas
npm run start
```

## Soporte técnico

Para preguntas o problemas con la integración del componente, contacta a:

- Email: dev@fabrica-demo.com
- Documentación técnica: [docs/README.md](docs/README.md)
