# 🔧 Solución: Error de Code Splitting en Componente Externo

## 🚨 Problema Identificado

El componente externo está usando **code splitting** de Webpack, pero los chunks adicionales se están intentando cargar desde `localhost:5173` (Flow Designer) en lugar de `localhost:3001` (servidor del componente).

**Error específico:**
```
GET http://localhost:5173/src_LandingWebComponent_ts.ae03025e08e612ab0a11.js net::ERR_ABORTED 404
```

## ✅ Solución: Configuración de Webpack

### **1. Configurar publicPath en webpack.config.js**

```javascript
// webpack.config.js del componente externo
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'LandingComponent',
    libraryTarget: 'umd',
    globalObject: 'this',
    
    // ✅ CRÍTICO: Configurar publicPath para chunks
    publicPath: 'http://localhost:3001/'
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
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  
  // ✅ Configuración para desarrollo
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3001,
    hot: true,
    cors: {
      origin: "*"
    },
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    
    // ✅ IMPORTANTE: Configurar publicPath también en devServer
    devMiddleware: {
      publicPath: 'http://localhost:3001/'
    }
  },
  
  // ✅ Optimización para evitar code splitting problemático
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // Crear un solo bundle
        bundle: {
          name: 'bundle',
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};
```

### **2. Alternativa: Deshabilitar Code Splitting**

Si quieren evitar el code splitting completamente:

```javascript
// webpack.config.js - Opción simple
module.exports = {
  // ... otras configuraciones
  
  optimization: {
    splitChunks: false, // ✅ Deshabilitar completamente
  }
};
```

### **3. Configuración de Runtime PublicPath (Opción Avanzada)**

```javascript
// En el entry point (index.ts) del componente externo
__webpack_public_path__ = 'http://localhost:3001/';

// Luego importar el resto
import './LandingWebComponent';
```

## 🎯 **Recomendación Inmediata**

**Para el equipo externo:**

1. **Agregar `publicPath: 'http://localhost:3001/'`** en la configuración de Webpack
2. **O deshabilitar code splitting** con `splitChunks: false`
3. **Rebuild y restart** del servidor en puerto 3001

## 🔍 **Verificación**

Después de la corrección, deberían ver en el log:
```
✅ GET http://localhost:3001/chunk.js (éxito)
✅ Custom element 'landing-web-component' registered
```

## 📞 **Mensaje para el Equipo Externo**

> "El bundle se está cargando correctamente, pero Webpack está intentando cargar chunks adicionales desde nuestro servidor (localhost:5173) en lugar del suyo (localhost:3001). Por favor, configuren el `publicPath` en su webpack.config.js para que apunte a `http://localhost:3001/` o deshabiliten el code splitting con `splitChunks: false`."

## 🚀 **Estado Actual**

- ✅ Configuración del Flow Designer: **Correcta**
- ✅ Servidor externo: **Funcionando** 
- 🔄 Configuración Webpack externa: **Necesita corrección**
