// Types para ComponentAgent - Sistema Agéntico
export interface ComponentAgentTask {
  id: string
  name: string
  description: string
  completed: boolean
  result?: any
}

export interface ComponentAgentTool {
  id: string
  name: string
  type: 'api_call' | 'validation' | 'transformation' | 'banking'
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  parameters?: Record<string, any>
}

export interface ComponentAgentAction {
  id: string
  name: string
  type: 'button_click' | 'form_submit' | 'api_call' | 'navigation'
  target: string
  handler: string
  tools?: string[] // IDs de tools a usar
}

export interface ComponentAgentInput {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'object'
  required: boolean
  defaultValue?: any
  description: string
}

export interface ComponentAgentOutput {
  id: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'object'
  value?: any
  description: string
}

export interface ComponentAgent {
  // Core properties
  id: string
  name: string
  specialization: 'banking' | 'landing' | 'forms' | 'verification' | 'biometric' | 'decision'
  
  // Agent definition
  objective: string
  description: string
  
  // Components
  tasks: ComponentAgentTask[]
  tools: ComponentAgentTool[]
  actions: ComponentAgentAction[]
  
  // I/O
  inputs: ComponentAgentInput[]
  outputs: ComponentAgentOutput[]
  
  // Vista
  htmlView: string // HTML content for the main viewer
  
  // Metadata
  version: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'active' | 'deprecated'
}

export interface ComponentAgentContext {
  stepId: string
  nodeData?: any
  previousOutputs?: Record<string, any>
  sessionData?: Record<string, any>
}

export interface ComponentAgentResponse {
  success: boolean
  data?: any
  outputs?: Record<string, ComponentAgentOutput>
  error?: string
  nextAction?: string
}
