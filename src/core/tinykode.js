import { AIClient } from "./ai.js"
import { config as defaultConfig, parseConfig } from './config.js'
import { tools as ToolsMap } from "./tools/index.js"

export class TinyKode {
    ai = null;
    tools = {};
    config = {};
    messages = [];
    finishReason = null;

    constructor(
        config = defaultConfig,
        tools = ToolsMap,
        messages = [],
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

    #createTools(tools, ai) {
        return Object.values(tools).reduce((acc, tool) => {
            acc[tool.name] = ai.createTool(tool);
            return acc;
        }, {});
    }

    async processQuery({ query, onUpdate, onToolCalls, onToolResults, onToolConfirm }) {
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
                } = this.ai.streamText({
                    tools: this.tools,
                    messages: this.messages,
                    context: {
                        workspaceRoot: this.config.workspaceRoot,
                        onToolConfirm: (...args) => onToolConfirm?.(...args)
                    },
                    onStepFinish: ({ toolCalls, toolResults, finishReason }) => {
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
                content: `Error: ${error.message}`
            });

            throw error;
        }
    }
}