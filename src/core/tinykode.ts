import { AIClient, type ModelMessage, type ToolSet } from "./ai.js";
import { config as defaultConfig, parseConfig, type Config } from './config.js';
import { ToolsMap } from "./tools/index.js";

interface ProcessQueryOptions {
    query: string;
    onUpdate?: (chunk: string) => void;
    onToolCalls?: (toolCalls: any[]) => void;
    onToolResults?: (toolResults: any[]) => void;
    onToolConfirm?: (args: ToolDefinition) => Promise<boolean> | undefined;
}

interface ToolDefinition {
    name: string;
    params: any;
}

type IToolsMap = Record<string, ToolDefinition>;

export class TinyKode {
    ai: AIClient | null = null;
    tools: ToolSet = {};
    config: Config = {} as Config;
    messages: ModelMessage[] = [];
    finishReason: string | null = null;

    constructor(
        config: Partial<Config> = defaultConfig,
        tools: IToolsMap = ToolsMap,
        messages: ModelMessage[] = [],
    ) {
        try {
            this.config = parseConfig(config);

            if (!this.config) {
                throw new Error("Config is required");
            }
            if (!tools || typeof tools !== 'object') {
                throw new Error('Tools must be a valid object');
            }

            this.ai = new AIClient(this.config);
            this.tools = this.#createTools(tools, this.ai);
            this.messages = messages;
        } catch (error) {
            console.error('Error initializing TinyKode:', error);
            throw error;
        }
    }

    #createTools(tools: IToolsMap, ai: AIClient): ToolSet {
        return Object.values(tools).reduce((acc, tool) => {
            acc[tool.name] = ai.createTool(tool);
            return acc;
        }, {} as Record<string, any>);
    }

    async processQuery({ query, onUpdate, onToolCalls, onToolResults, onToolConfirm }: ProcessQueryOptions): Promise<ModelMessage[]> {
        try {
            // Validate input parameters
            if (!query || typeof query !== 'string') {
                throw new Error('Query must be a non-empty string');
            }

            this.messages.push({ role: "user", content: query });

            // Reset finish reason for new query
            this.finishReason = null;

            while (this.finishReason !== "stop" && this.finishReason !== "length") {
                const {
                    response,
                    textStream,
                } = this.ai!.streamText({
                    tools: this.tools,
                    messages: this.messages,
                    context: {
                        workspaceRoot: this.config.workspaceRoot,
                        onToolConfirm: (args: ToolDefinition) => onToolConfirm?.(args),
                    },
                    onStepFinish: ({ toolCalls, toolResults, finishReason }: any) => {
                        onToolCalls?.(toolCalls);
                        onToolResults?.(toolResults);
                        this.finishReason = finishReason;
                    },
                });

                for await (const chunk of textStream) {
                    onUpdate?.(chunk);
                }

                const { messages } = await response;
                this.messages.push(...messages);
            }

            return this.messages;
        } catch (error) {
            console.error('Error processing query:', error);

            // Add error message to conversation history for context
            this.messages.push({
                role: "assistant",
                content: `Error: ${(error as Error).message}`
            });

            throw error;
        }
    }
}