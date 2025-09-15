import {
    AIClient,
    type ToolSet,
    type ToolCall,
    type ToolResult,
    type ModelMessage,
} from "./ai.js";
import { config as defaultConfig, parseConfig, type Config } from './config.js';
import { ToolsMap } from "./tools/index.js";

interface ProcessQueryOptions {
    messages: ModelMessage[];
    onUpdate?: (chunk: string) => void;
    onToolCalls?: (toolCalls: ToolCall[]) => void;
    onToolResults?: (toolResults: ToolResult[]) => void;
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

    async processQuery({
        messages,
        onUpdate,
        onToolCalls,
        onToolResults,
        onToolConfirm,
    }: ProcessQueryOptions): Promise<ModelMessage[]> {
        let inputMessages = []
        let stopReason = null;

        try {
            // Validate input parameters
            if (!messages || !Array.isArray(messages)) {
                throw new Error('Messages must be a non-empty array');
            }

            inputMessages = [...messages];

            while (stopReason !== "stop" && stopReason !== "length") {
                const {
                    response,
                    textStream,
                } = this.ai!.streamText({
                    tools: this.tools,
                    messages: inputMessages,
                    context: {
                        workspaceRoot: this.config.workspaceRoot,
                        onToolConfirm: (args: ToolDefinition) => onToolConfirm?.(args),
                    },
                    onStepFinish: ({ toolCalls, toolResults, finishReason }) => {
                        onToolCalls?.(toolCalls);
                        onToolResults?.(toolResults);
                        stopReason = finishReason;
                    },
                });

                for await (const chunk of textStream) {
                    onUpdate?.(chunk);
                }

                const { messages } = await response;
                inputMessages.push(...messages);
            }

            return inputMessages;
        } catch (error) {
            console.error('Error processing query:', error);
            throw error;
        }
    }
}