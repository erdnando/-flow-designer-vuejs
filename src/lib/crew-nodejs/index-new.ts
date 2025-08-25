/**
 * Node.js CrewAI-like Implementation
 * Base classes for Agent, Task, and Crew management
 */

export interface AgentConfig {
  role: string;
  goal: string;
  backstory: string;
  verbose?: boolean;
  tools?: string[];
  inputs?: AgentParameter[];
  outputs?: AgentParameter[];
  actions?: AgentAction[];
}

export interface TaskConfig {
  name: string;
  description: string;
  expectedOutput: string;
  agent?: Agent;
}

export interface CrewConfig {
  name: string;
  description: string;
  agents: Agent[];
  tasks: Task[];
  process: 'sequential' | 'hierarchical' | 'parallel';
  verbose?: boolean;
}

export interface AgentParameter {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface AgentAction {
  name: string;
  trigger: string;
  handler: string;
  parameters?: Record<string, any>;
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  function: (params: any) => Promise<any>;
}

export class Agent {
  private config: AgentConfig;
  private tools: Map<string, AgentTool> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
  }

  get role(): string {
    return this.config.role;
  }

  get goal(): string {
    return this.config.goal;
  }

  get backstory(): string {
    return this.config.backstory;
  }

  async execute(task: Task, context: any = {}): Promise<any> {
    if (this.config.verbose) {
      console.log(`🤖 Agent ${this.config.role} executing task: ${task.name}`);
    }

    try {
      // Simulate agent processing
      const result = {
        agentId: this.config.role,
        taskName: task.name,
        input: context,
        output: `Processed by ${this.config.role}`,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      if (this.config.verbose) {
        console.log(`✅ Agent ${this.config.role} completed task successfully`);
      }

      return result;
    } catch (error) {
      if (this.config.verbose) {
        console.error(`❌ Agent ${this.config.role} failed:`, error);
      }
      throw error;
    }
  }

  addTool(tool: AgentTool): void {
    this.tools.set(tool.id, tool);
  }

  async useTool(toolId: string, parameters: any): Promise<any> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`);
    }

    if (this.config.verbose) {
      console.log(`🔧 Agent ${this.config.role} using tool: ${tool.name}`);
    }

    return await tool.function(parameters);
  }
}

export class Task {
  public name: string;
  public description: string;
  public expectedOutput: string;
  public agent?: Agent;
  private id: string;

  constructor(config: TaskConfig) {
    this.name = config.name;
    this.description = config.description;
    this.expectedOutput = config.expectedOutput;
    this.agent = config.agent;
    this.id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getId(): string {
    return this.id;
  }

  async execute(context: any = {}): Promise<any> {
    if (!this.agent) {
      throw new Error(`Task ${this.name} has no assigned agent`);
    }

    console.log(`📋 Executing task: ${this.name}`);
    
    try {
      const result = await this.agent.execute(this, context);
      
      console.log(`✅ Task ${this.name} completed`);
      return result;
    } catch (error) {
      console.error(`❌ Task ${this.name} failed:`, error);
      throw error;
    }
  }
}

export class Crew {
  private name: string;
  private description: string;
  private agents: Agent[];
  private tasks: Task[];
  private process: 'sequential' | 'hierarchical' | 'parallel';
  private verbose: boolean;

  constructor(config: CrewConfig) {
    this.name = config.name;
    this.description = config.description;
    this.agents = config.agents;
    this.tasks = config.tasks;
    this.process = config.process;
    this.verbose = config.verbose ?? false;
  }

  async kickoff(initialContext: any = {}): Promise<any> {
    if (this.verbose) {
      console.log(`🚀 Starting crew: ${this.name}`);
      console.log(`📝 Description: ${this.description}`);
      console.log(`⚙️  Process: ${this.process}`);
      console.log(`👥 Agents: ${this.agents.length}`);
      console.log(`📋 Tasks: ${this.tasks.length}`);
    }

    try {
      let context = { ...initialContext };
      const results: any[] = [];

      switch (this.process) {
        case 'sequential':
          for (const task of this.tasks) {
            const result = await task.execute(context);
            results.push(result);
            context = { ...context, ...result };
          }
          break;

        case 'parallel':
          const parallelResults = await Promise.allSettled(
            this.tasks.map(task => task.execute(context))
          );
          
          parallelResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              results.push(result.value);
              context = { ...context, ...result.value };
            } else {
              console.error(`Task ${this.tasks[index].name} failed:`, result.reason);
            }
          });
          break;

        case 'hierarchical':
          // Simple hierarchical implementation
          for (const task of this.tasks) {
            const result = await task.execute(context);
            results.push(result);
            context = { ...context, hierarchical_result: result };
          }
          break;

        default:
          throw new Error(`Unknown process type: ${this.process}`);
      }

      const finalResult = {
        crew: this.name,
        process: this.process,
        status: 'completed',
        results,
        context,
        completedAt: new Date().toISOString()
      };

      if (this.verbose) {
        console.log(`✅ Crew ${this.name} completed successfully`);
      }

      return finalResult;

    } catch (error) {
      if (this.verbose) {
        console.error(`❌ Crew ${this.name} failed:`, error);
      }
      throw error;
    }
  }

  getAgents(): Agent[] {
    return this.agents;
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  addAgent(agent: Agent): void {
    this.agents.push(agent);
  }

  addTask(task: Task): void {
    this.tasks.push(task);
  }
}

// Utility functions
export function createAgent(config: AgentConfig): Agent {
  return new Agent(config);
}

export function createTask(config: TaskConfig): Task {
  return new Task(config);
}

export function createCrew(config: CrewConfig): Crew {
  return new Crew(config);
}

// Default export for convenience
export default {
  Agent,
  Task,
  Crew,
  createAgent,
  createTask,
  createCrew
};
