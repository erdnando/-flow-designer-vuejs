/**
 * Utilidad para validar que los nodos del flujo estén correctamente mapeados 
 * con el MockComponentRegistry
 */

import { MockComponentRegistry } from './MockComponentRegistry';

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  registeredComponents: string[];
  missingComponents: string[];
}

export interface ValidationIssue {
  type: 'missing' | 'case-mismatch' | 'warning';
  nodeId: string;
  customTypeId: string;
  message: string;
  suggestion?: string;
}

/**
 * Valida que todos los nodos con customTypeId tengan su componente registrado
 */
export function validateNodeComponentMapping(nodes: any[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  const registeredComponents = MockComponentRegistry.getAllComponents().map(c => c.id);
  const missingComponents: string[] = [];
  
  console.log('🔍 [Validator] Componentes registrados en MockComponentRegistry:', registeredComponents);
  
  // Buscar todos los nodos que tienen customTypeId
  const externalComponentNodes = nodes.filter(node => 
    node.data?.customTypeId || node.data?.isCustom
  );
  
  console.log('🔍 [Validator] Nodos con componente externo encontrados:', externalComponentNodes.length);
  
  externalComponentNodes.forEach(node => {
    const customTypeId = node.data?.customTypeId;
    
    if (!customTypeId) {
      issues.push({
        type: 'warning',
        nodeId: node.id,
        customTypeId: 'undefined',
        message: `Nodo "${node.label || node.type}" tiene isCustom=true pero no tiene customTypeId`
      });
      return;
    }
    
    console.log(`🔍 [Validator] Validando nodo "${node.label}" con customTypeId: "${customTypeId}"`);
    
    // Verificar si existe exactamente
    if (registeredComponents.includes(customTypeId)) {
      console.log(`✅ [Validator] Componente "${customTypeId}" encontrado`);
      return;
    }
    
    // Si no existe exactamente, buscar posibles coincidencias con diferente case
    const lowerCaseId = customTypeId.toLowerCase();
    const possibleMatches = registeredComponents.filter(id => 
      id.toLowerCase() === lowerCaseId
    );
    
    if (possibleMatches.length > 0) {
      issues.push({
        type: 'case-mismatch',
        nodeId: node.id,
        customTypeId: customTypeId,
        message: `Diferencia de mayúsculas/minúsculas. Buscando "${customTypeId}" pero está registrado como "${possibleMatches[0]}"`,
        suggestion: `Cambiar a "${possibleMatches[0]}"`
      });
    } else {
      // Buscar coincidencias parciales
      const partialMatches = registeredComponents.filter(id => 
        id.toLowerCase().includes(lowerCaseId) || lowerCaseId.includes(id.toLowerCase())
      );
      
      if (partialMatches.length > 0) {
        issues.push({
          type: 'missing',
          nodeId: node.id,
          customTypeId: customTypeId,
          message: `Componente "${customTypeId}" no encontrado. Posibles coincidencias: ${partialMatches.join(', ')}`,
          suggestion: `¿Quisiste decir "${partialMatches[0]}"?`
        });
      } else {
        issues.push({
          type: 'missing',
          nodeId: node.id,
          customTypeId: customTypeId,
          message: `Componente "${customTypeId}" no está registrado en MockComponentRegistry`
        });
        
        missingComponents.push(customTypeId);
      }
    }
  });
  
  return {
    isValid: issues.filter(i => i.type !== 'warning').length === 0,
    issues,
    registeredComponents,
    missingComponents
  };
}

/**
 * Genera un reporte de validación legible
 */
export function generateValidationReport(result: ValidationResult): string {
  let report = '\n=== REPORTE DE VALIDACIÓN DE COMPONENTES ===\n\n';
  
  report += `Estado: ${result.isValid ? '✅ VÁLIDO' : '❌ REQUIERE ATENCIÓN'}\n`;
  report += `Componentes registrados: ${result.registeredComponents.length}\n`;
  report += `Problemas encontrados: ${result.issues.length}\n\n`;
  
  if (result.issues.length > 0) {
    report += '=== PROBLEMAS DETECTADOS ===\n\n';
    
    result.issues.forEach((issue, index) => {
      const icon = issue.type === 'missing' ? '❌' : issue.type === 'case-mismatch' ? '⚠️' : 'ℹ️';
      report += `${icon} Problema ${index + 1}: ${issue.message}\n`;
      report += `   Nodo: ${issue.nodeId}\n`;
      report += `   CustomTypeId: "${issue.customTypeId}"\n`;
      if (issue.suggestion) {
        report += `   Sugerencia: ${issue.suggestion}\n`;
      }
      report += '\n';
    });
  }
  
  report += '=== COMPONENTES REGISTRADOS ===\n';
  result.registeredComponents.forEach(id => {
    report += `• ${id}\n`;
  });
  
  if (result.missingComponents.length > 0) {
    report += '\n=== COMPONENTES FALTANTES ===\n';
    result.missingComponents.forEach(id => {
      report += `• ${id}\n`;
    });
  }
  
  return report;
}

/**
 * Función de debugging para usar desde la consola del navegador
 */
export function debugComponentMapping(nodes: any[]) {
  const result = validateNodeComponentMapping(nodes);
  const report = generateValidationReport(result);
  
  console.log(report);
  return result;
}
