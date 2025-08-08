# Comandos de Debug para Diagnosticar el Problema

Ejecuta estos comandos en la consola del navegador para diagnosticar qué ha cambiado:

## 1. Ver qué componentes se están buscando ahora
```javascript
window.showCustomTypeIds()
```

## 2. Ver la validación completa actual
```javascript
window.validateComponents()
```

## 3. Ver todos los nodos actuales
```javascript
window.debugNodes()
```

## 4. Verificar si hay nodos nuevos o modificados
```javascript
nodes.forEach((node, i) => {
  console.log(`Nodo ${i+1}:`, {
    id: node.id,
    type: node.type, 
    label: node.label,
    customTypeId: node.data?.customTypeId,
    isCustom: node.data?.isCustom,
    allData: node.data
  })
})
```

Ejecuta estos comandos y comparte los resultados para ver exactamente qué componentes faltan y por qué.
