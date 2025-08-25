import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Node } from '@vue-flow/core'

// Software Component Interfaces
interface ComponentCapability {
  id: string
  name: string
  description: string
  enabled: boolean
}

interface ComponentTask {
  id: string
  name: string
  description: string
  algorithm: string
  expected_output: string
}

interface ComponentTool {
  id: string
  name: string
  type: string
  description: string
  function_name: string
  parameters: Record<string, any>
}

interface ComponentAction {
  id: string
  name: string
  type: string
  description: string
  trigger: string
  handler: string
  validation_rules: string[]
}

interface ComponentInput {
  id: string
  name: string
  type: string
  description: string
  required: boolean
  validation?: {
    pattern?: string
    customValidator?: string
  }
}

interface ComponentOutput {
  id: string
  name: string
  type: string
  description: string
  validation?: {
    customValidator?: string
  }
}

interface SoftwareAgent {
  id: string
  nodeId: string
  componentName: string
  purpose: string
  description: string
  version: string
  capabilities: ComponentCapability[]
  tasks: ComponentTask[]
  tools: ComponentTool[]
  actions: ComponentAction[]
  inputs: ComponentInput[]
  outputs: ComponentOutput[]
  dependencies: string[]
  position?: number
}

interface ComponentSuite {
  id: string
  name: string
  description: string
  process: string
  environment: string
  components: SoftwareAgent[]
  verbose?: boolean
}

export type { 
  SoftwareAgent, 
  ComponentCapability, 
  ComponentTask, 
  ComponentTool, 
  ComponentAction, 
  ComponentInput, 
  ComponentOutput, 
  ComponentSuite 
}

export const useAgentStore = defineStore('agent', () => {
  // State
  const agents = ref<SoftwareAgent[]>([])
  const currentCrew = ref<ComponentSuite | null>(null)
  const flowNodes = ref<Node[]>([])

  // Computed
  const sortedAgents = computed(() => {
    return [...agents.value].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  })

  const crewDefinition = computed(() => {
    if (!currentCrew.value) return null
    
    return {
      id: currentCrew.value.id,
      name: currentCrew.value.name,
      description: currentCrew.value.description,
      process: currentCrew.value.process,
      environment: currentCrew.value.environment,
      verbose: currentCrew.value.verbose,
      components: sortedAgents.value
    }
  })

  // Actions
  function syncAgentsWithNodes(nodes: Node[]) {
    flowNodes.value = nodes
    
    // Remove agents for deleted nodes
    const nodeIds = new Set(nodes.map(node => node.id))
    agents.value = agents.value.filter(agent => nodeIds.has(agent.nodeId))

    // Add agents for new nodes
    const existingNodeIds = new Set(agents.value.map(agent => agent.nodeId))
    
    nodes.forEach((node, index) => {
      if (!existingNodeIds.has(node.id)) {
        createAgentFromNode(node, index)
      }
    })

    updateCrew()
    persistToStorage()
  }

  function createAgentFromNode(node: Node, position: number) {
    const nodeLabel = node.data?.label || `Component${position + 1}`
    const newAgent: SoftwareAgent = {
      id: `component_${node.id}`,
      nodeId: node.id,
      componentName: `${nodeLabel}Component`,
      purpose: `Process ${nodeLabel.toLowerCase()} step in the credit origination flow`,
      description: `Self-contained software component responsible for handling ${nodeLabel.toLowerCase()} functionality`,
      version: '1.0.0',
      capabilities: [
        {
          id: `cap_data_processing_${node.id}`,
          name: 'data-processing',
          description: 'Process input data and transform it',
          enabled: true
        },
        {
          id: `cap_ui_rendering_${node.id}`,
          name: 'ui-rendering',
          description: 'Render interactive user interface',
          enabled: true
        },
        {
          id: `cap_validation_${node.id}`,
          name: 'validation',
          description: 'Validate input data and business rules',
          enabled: true
        }
      ],
      tasks: [
        {
          id: `task_${node.id}_main`,
          name: `Process ${nodeLabel}`,
          description: `Execute the main algorithm for ${nodeLabel} processing`,
          algorithm: `${nodeLabel.toLowerCase()}ProcessingAlgorithm`,
          expected_output: 'Processed data with validation results and next step indicators'
        }
      ],
      tools: [
        {
          id: `tool_${node.id}_validator`,
          name: `${nodeLabel} Validator`,
          type: 'validation',
          description: `Validation algorithms for ${nodeLabel} data`,
          function_name: `validate${nodeLabel}Data`,
          parameters: { strict: true, required_fields: [] }
        }
      ],
      actions: [
        {
          id: `action_${node.id}_submit`,
          name: 'Submit Data',
          type: 'submit',
          description: 'Submit processed data to next component',
          trigger: '.submit-btn',
          handler: 'handleSubmit',
          validation_rules: ['required', 'format']
        }
      ],
      inputs: [
        {
          id: `input_${node.id}_data`,
          name: 'Input Data',
          type: 'object',
          description: 'Data from previous component in the flow',
          required: true,
          validation: {
            pattern: '^[a-zA-Z0-9_]+$',
            customValidator: 'validateInputStructure'
          }
        }
      ],
      outputs: [
        {
          id: `output_${node.id}_result`,
          name: 'Processed Result',
          type: 'object',
          description: 'Processed data ready for next component',
          validation: {
            customValidator: 'validateOutputStructure'
          }
        }
      ],
      dependencies: ['axios', 'lodash', 'moment'],
      position
    }

    agents.value.push(newAgent)
  }

  function updateCrew() {
    if (agents.value.length === 0) {
      currentCrew.value = null
      return
    }

    currentCrew.value = {
      id: 'credit_card_origination_crew',
      name: 'Credit Card Origination Software Suite',
      description: 'Orchestrated collection of self-contained software components for credit card origination',
      components: sortedAgents.value,
      process: 'sequential',
      environment: 'development',
      verbose: true
    }
  }

  function updateAgent(agentId: string, updates: Partial<SoftwareAgent>) {
    const agentIndex = agents.value.findIndex(a => a.id === agentId)
    if (agentIndex !== -1) {
      agents.value[agentIndex] = { ...agents.value[agentIndex], ...updates }
      updateCrew()
      persistToStorage()
    }
  }

  function addTaskToAgent(agentId: string, task: Omit<ComponentTask, 'id'>) {
    const agent = agents.value.find(a => a.id === agentId)
    if (agent) {
      const newTask: ComponentTask = {
        ...task,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      agent.tasks.push(newTask)
      persistToStorage()
    }
  }

  function addToolToAgent(agentId: string, tool: Omit<ComponentTool, 'id'>) {
    const agent = agents.value.find(a => a.id === agentId)
    if (agent) {
      const newTool: ComponentTool = {
        ...tool,
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      agent.tools.push(newTool)
      persistToStorage()
    }
  }

  function addActionToAgent(agentId: string, action: Omit<ComponentAction, 'id'>) {
    const agent = agents.value.find(a => a.id === agentId)
    if (agent) {
      const newAction: ComponentAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      agent.actions.push(newAction)
      persistToStorage()
    }
  }

  function persistToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('flow_designer_agents', JSON.stringify({
        agents: agents.value,
        crew: currentCrew.value
      }))
    }
  }

  function loadFromStorage() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('flow_designer_agents')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          agents.value = data.agents || []
          currentCrew.value = data.crew || null
        } catch (error) {
          console.warn('Error loading agents from storage:', error)
        }
      }
    }
  }

  function generateJavaScriptCode() {
    if (!currentCrew.value || agents.value.length === 0) {
      return '// No software components available to generate'
    }

    let jsCode = `// Credit Card Origination Software Components - Generated Code\n`
    jsCode += `// Generated on: ${new Date().toISOString()}\n\n`

    jsCode += `// Component Suite Configuration\n`
    jsCode += `const componentSuite = {\n`
    jsCode += `  id: '${currentCrew.value.id}',\n`
    jsCode += `  name: '${currentCrew.value.name}',\n`
    jsCode += `  description: '${currentCrew.value.description}',\n`
    jsCode += `  process: '${currentCrew.value.process}',\n`
    jsCode += `  environment: '${currentCrew.value.environment}',\n`
    jsCode += `  components: [\n`

    agents.value.forEach((agent, index) => {
      jsCode += `    {\n`
      jsCode += `      // ${agent.componentName}\n`
      jsCode += `      id: '${agent.id}',\n`
      jsCode += `      componentName: '${agent.componentName}',\n`
      jsCode += `      purpose: '${agent.purpose}',\n`
      jsCode += `      description: '${agent.description}',\n`
      jsCode += `      version: '${agent.version}',\n`
      jsCode += `      capabilities: ${JSON.stringify(agent.capabilities, null, 8)},\n`
      jsCode += `      tasks: ${JSON.stringify(agent.tasks, null, 8)},\n`
      jsCode += `      tools: ${JSON.stringify(agent.tools, null, 8)},\n`
      jsCode += `      actions: ${JSON.stringify(agent.actions, null, 8)},\n`
      jsCode += `      inputs: ${JSON.stringify(agent.inputs, null, 8)},\n`
      jsCode += `      outputs: ${JSON.stringify(agent.outputs, null, 8)},\n`
      jsCode += `      dependencies: ${JSON.stringify(agent.dependencies, null, 8)}\n`
      jsCode += `    }${index < agents.value.length - 1 ? ',' : ''}\n`
    })

    jsCode += `  ]\n`
    jsCode += `};\n\n`

    jsCode += `// Component Execution Engine\n`
    jsCode += `class ComponentExecutor {\n`
    jsCode += `  constructor(suite) {\n`
    jsCode += `    this.suite = suite;\n`
    jsCode += `    this.loadedComponents = new Map();\n`
    jsCode += `  }\n\n`
    
    jsCode += `  async loadComponent(componentId) {\n`
    jsCode += `    const config = this.suite.components.find(c => c.id === componentId);\n`
    jsCode += `    if (!config) throw new Error(\`Component \${componentId} not found\`);\n\n`
    
    jsCode += `    const component = {\n`
    jsCode += `      ...config,\n`
    jsCode += `      execute: async (inputData) => {\n`
    jsCode += `        console.log(\`Executing component: \${config.componentName}\`);\n`
    jsCode += `        return { success: true, data: inputData, processed: true };\n`
    jsCode += `      }\n`
    jsCode += `    };\n\n`
    
    jsCode += `    this.loadedComponents.set(componentId, component);\n`
    jsCode += `    return component;\n`
    jsCode += `  }\n\n`
    
    jsCode += `  async executeFlow(initialData = {}) {\n`
    jsCode += `    let flowData = { ...initialData };\n`
    jsCode += `    const results = [];\n\n`
    
    jsCode += `    for (const componentConfig of this.suite.components) {\n`
    jsCode += `      try {\n`
    jsCode += `        const component = await this.loadComponent(componentConfig.id);\n`
    jsCode += `        const result = await component.execute(flowData);\n`
    jsCode += `        results.push({ componentId: componentConfig.id, result });\n`
    jsCode += `        flowData = { ...flowData, ...result.data };\n`
    jsCode += `      } catch (error) {\n`
    jsCode += `        console.error(\`Error in component \${componentConfig.id}:\`, error);\n`
    jsCode += `        results.push({ componentId: componentConfig.id, error: error.message });\n`
    jsCode += `      }\n`
    jsCode += `    }\n\n`
    
    jsCode += `    return { finalData: flowData, results };\n`
    jsCode += `  }\n`
    jsCode += `}\n\n`

    jsCode += `const executor = new ComponentExecutor(componentSuite);\n`
    jsCode += `\n`
    jsCode += `module.exports = {\n`
    jsCode += `  componentSuite,\n`
    jsCode += `  ComponentExecutor,\n`
    jsCode += `  executor\n`
    jsCode += `};\n`

    return jsCode
  }

  function generateTypeScriptComponentCode() {
    if (!currentCrew.value || agents.value.length === 0) {
      return '// No software components available to generate'
    }

    return `// Credit Card Origination Software Components - Generated TypeScript Code
// Generated on: ${new Date().toISOString()}

interface ComponentCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface ComponentTask {
  id: string;
  name: string;
  description: string;
  algorithm: string;
  expected_output: string;
}

interface SoftwareComponent {
  id: string;
  componentName: string;
  purpose: string;
  description: string;
  version: string;
  capabilities: ComponentCapability[];
  tasks: ComponentTask[];
  tools: any[];
  actions: any[];
  inputs: any[];
  outputs: any[];
  dependencies: string[];
  execute: (inputData: any) => Promise<any>;
}

interface ComponentSuite {
  id: string;
  name: string;
  description: string;
  process: string;
  environment: string;
  components: SoftwareComponent[];
}

const componentSuite: ComponentSuite = {
  id: '${currentCrew.value.id}',
  name: '${currentCrew.value.name}',
  description: '${currentCrew.value.description}',
  process: '${currentCrew.value.process}',
  environment: '${currentCrew.value.environment}',
  components: [
${sortedAgents.value.map(agent => `    {
      id: '${agent.id}',
      componentName: '${agent.componentName}',
      purpose: '${agent.purpose}',
      description: '${agent.description}',
      version: '${agent.version}',
      capabilities: ${JSON.stringify(agent.capabilities, null, 6)},
      tasks: ${JSON.stringify(agent.tasks, null, 6)},
      tools: ${JSON.stringify(agent.tools, null, 6)},
      actions: ${JSON.stringify(agent.actions, null, 6)},
      inputs: ${JSON.stringify(agent.inputs, null, 6)},
      outputs: ${JSON.stringify(agent.outputs, null, 6)},
      dependencies: ${JSON.stringify(agent.dependencies, null, 6)},
      execute: async (inputData: any) => {
        console.log(\`Executing component: ${agent.componentName}\`);
        return { success: true, data: inputData, processed: true };
      }
    } as SoftwareComponent`).join(',\n')}
  ]
};

class ComponentExecutor {
  private suite: ComponentSuite;
  private loadedComponents: Map<string, SoftwareComponent> = new Map();

  constructor(suite: ComponentSuite) {
    this.suite = suite;
  }

  async loadComponent(componentId: string): Promise<SoftwareComponent> {
    const config = this.suite.components.find(c => c.id === componentId);
    if (!config) throw new Error(\`Component \${componentId} not found\`);
    
    this.loadedComponents.set(componentId, config);
    return config;
  }

  async executeFlow(initialData: any = {}): Promise<{ finalData: any; results: any[] }> {
    let flowData = { ...initialData };
    const results: any[] = [];

    for (const componentConfig of this.suite.components) {
      try {
        const component = await this.loadComponent(componentConfig.id);
        const result = await component.execute(flowData);
        results.push({ componentId: componentConfig.id, result });
        flowData = { ...flowData, ...result.data };
      } catch (error: any) {
        console.error(\`Error in component \${componentConfig.id}:\`, error);
        results.push({ componentId: componentConfig.id, error: error.message });
      }
    }

    return { finalData: flowData, results };
  }
}

const executor = new ComponentExecutor(componentSuite);

export {
  componentSuite,
  ComponentExecutor,
  executor,
  type SoftwareComponent,
  type ComponentSuite
};`
  }

  function generateJSONCode() {
    if (!currentCrew.value || agents.value.length === 0) {
      return JSON.stringify({ message: 'No software components available to generate' }, null, 2)
    }

    return JSON.stringify({
      componentSuite: {
        id: currentCrew.value.id,
        name: currentCrew.value.name,
        description: currentCrew.value.description,
        process: currentCrew.value.process,
        environment: currentCrew.value.environment,
        generatedAt: new Date().toISOString(),
        components: sortedAgents.value
      }
    }, null, 2)
  }

  function generatePackageJson() {
    return JSON.stringify({
      "name": "credit-card-origination-components",
      "version": "1.0.0",
      "description": "Self-contained software components for credit card origination process",
      "main": "dist/index.js",
      "type": "module",
      "scripts": {
        "start": "node dist/index.js",
        "dev": "nodemon src/index.ts",
        "build": "tsc",
        "components:execute": "ts-node src/components.ts"
      },
      "dependencies": {
        "axios": "^1.6.0",
        "lodash": "^4.17.21",
        "moment": "^2.29.4",
        "uuid": "^9.0.0",
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "helmet": "^7.0.0"
      },
      "devDependencies": {
        "@types/node": "^20.0.0",
        "@types/express": "^4.17.0",
        "@types/cors": "^2.8.0",
        "@types/lodash": "^4.14.0",
        "typescript": "^5.0.0",
        "ts-node": "^10.9.0",
        "nodemon": "^3.0.0"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    }, null, 2)
  }

  function initialize(nodes: Node[]) {
    loadFromStorage()
    flowNodes.value = nodes
  }

  return {
    // State
    agents,
    currentCrew,
    flowNodes,
    sortedAgents,
    crewDefinition,
    
    // Actions
    initialize,
    syncAgentsWithNodes,
    updateAgent,
    addTaskToAgent,
    addToolToAgent,
    addActionToAgent,
    persistToStorage,
    loadFromStorage,
    generateJavaScriptCode,
    generateTypeScriptComponentCode,
    generateJSONCode,
    generatePackageJson
  }
})
