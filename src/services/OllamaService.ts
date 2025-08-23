// Servicio para comunicación con Ollama
export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface AIPromptRequest {
  prompt: string;
  context: {
    stepType: string;
    stepName?: string;
    previousData?: any;
    availableAPIs: string[];
    userProfile?: any;
    flowContext?: any;
  };
  model: string;
  temperature?: number;
}

export interface GeneratedUI {
  template: string;
  script: string;
  style: string;
  validations?: any[];
  apiCalls?: any[];
  documentation?: string;
}

export class OllamaService {
  private baseURL: string = 'http://localhost:11434';

  constructor(baseURL?: string) {
    if (baseURL) {
      this.baseURL = baseURL;
    }
  }

  async chat(model: string, messages: OllamaMessage[], options?: any): Promise<OllamaResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature: options?.temperature || 0.7,
            ...options
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error comunicando con Ollama:', error);
      throw error;
    }
  }

  async generateUI(request: AIPromptRequest): Promise<GeneratedUI> {
    const systemPrompt = this.buildSystemPrompt(request.context);
    const userPrompt = this.buildUserPrompt(request.prompt, request.context);

    const messages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.chat(request.model, messages, {
      temperature: request.temperature || 0.3 // Más determinístico para código
    });

    return this.parseGeneratedCode(response.message.content);
  }

  private buildSystemPrompt(context: any): string {
    return `
Eres un experto desarrollador Vue.js especializado en aplicaciones de tarjetas de crédito.

CONTEXTO DEL PROYECTO:
- Framework: Vue 3 + Composition API + TypeScript
- Dominio: Originación de tarjetas de crédito (Bradescard/Promoda)
- Tema visual: Rosa/fucsia corporativo, moderno y responsive
- Público objetivo: Usuarios solicitando tarjetas de crédito

APIS DISPONIBLES:
${context.availableAPIs?.map((api: string) => `- ${api}`).join('\n') || 'No hay APIs específicas definidas'}

INSTRUCCIONES:
1. Genera código Vue.js limpio y funcional
2. Usa TypeScript para tipado estricto
3. Implementa validaciones en tiempo real
4. Asegura accesibilidad WCAG 2.1 AA
5. Usa estilos inline o clases CSS descriptivas
6. Incluye manejo de errores robusto
7. Documenta el código con JSDoc

FORMATO DE RESPUESTA:
Debes responder EXACTAMENTE en este formato:
<TEMPLATE>
<!-- Template Vue aquí -->
</TEMPLATE>

<SCRIPT>
// Script setup con TypeScript aquí
</SCRIPT>

<STYLE>
/* Estilos CSS aquí */
</STYLE>

<DOCUMENTATION>
<!-- Documentación del componente -->
</DOCUMENTATION>
`;
  }

  private buildUserPrompt(userPrompt: string, context: any): string {
    return `
SOLICITUD: ${userPrompt}

CONTEXTO ADICIONAL:
- Tipo de paso: ${context.stepType || 'general'}
- Nombre del paso: ${context.stepName || 'N/A'}
- Datos previos disponibles: ${JSON.stringify(context.previousData || {}, null, 2)}

REQUERIMIENTOS ESPECÍFICOS:
- Debe integrarse con el tema Bradescard/Promoda (colores rosa/fucsia)
- Debe ser responsive (mobile-first)
- Incluir validaciones apropiadas para tarjetas de crédito
- Manejar estados de carga, error y éxito
- Usar las APIs disponibles cuando sea necesario

Genera un componente Vue completamente funcional.
`;
  }

  private parseGeneratedCode(content: string): GeneratedUI {
    const result: GeneratedUI = {
      template: '',
      script: '',
      style: '',
      documentation: ''
    };

    // Extraer template
    const templateMatch = content.match(/<TEMPLATE>([\s\S]*?)<\/TEMPLATE>/);
    if (templateMatch) {
      result.template = templateMatch[1].trim();
    }

    // Extraer script
    const scriptMatch = content.match(/<SCRIPT>([\s\S]*?)<\/SCRIPT>/);
    if (scriptMatch) {
      result.script = scriptMatch[1].trim();
    }

    // Extraer estilos
    const styleMatch = content.match(/<STYLE>([\s\S]*?)<\/STYLE>/);
    if (styleMatch) {
      result.style = styleMatch[1].trim();
    }

    // Extraer documentación
    const docMatch = content.match(/<DOCUMENTATION>([\s\S]*?)<\/DOCUMENTATION>/);
    if (docMatch) {
      result.documentation = docMatch[1].trim();
    }

    return result;
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Error obteniendo modelos:', error);
      return [];
    }
  }

  async isModelAvailable(modelName: string): Promise<boolean> {
    const models = await this.listModels();
    return models.includes(modelName);
  }
}

// Instancia singleton
export const ollamaService = new OllamaService();
