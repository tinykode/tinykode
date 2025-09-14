import { AIClient } from "./ai.js"
import { tools as ToolsMap } from "./tools/index.js"

export class TinyKode {
    tools = {};
    messages = [];
    stopReason = null;

    aiClient = null;

    constructor(
        aiClient = new AIClient(),
        tools = ToolsMap
    ) {
        this.aiClient = aiClient;
        this.tools = tools;
    }

    async processQuery(query, onUpdate, onToolCall, onToolResult) {
        this.messages.push({ role: "user", content: query });

        while (this.stopReason !== "stop" && this.stopReason !== "length") {
            const {
                response,
                textStream,
                finishReason,
            } = this.aiClient.streamText({
                tools: this.tools,
                messages: this.messages,
                context: { workspaceRoot: process.cwd() },
            });

            for await (const chunk of textStream) {
                onUpdate?.(chunk);
            }

            const { messages } = await response;

            this.messages.push(...messages);
            this.stopReason = await finishReason;
        }

        return "Done!";
    }
}