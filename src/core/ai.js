import { streamText, tool } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

export class AIClient {
    config = {};
    anthropic = null;

    constructor(config) {
        this.config = config;
        this.anthropic = createAnthropic({
            baseURL: this.config.anthropicBaseURL,
            apiKey: this.config.anthropicApiKey
        });
    }

    streamText({
        model = this.anthropic("anthropic--claude-4-sonnet"),
        context = {},
        ...args
    }) {
        return streamText({ model, experimental_context: context, ...args });
    }

    createTool({ name, params }) {
        const anthropicTools = {
            'bash': this.anthropic.tools.bash_20250124,
            'textEditor': this.anthropic.tools.textEditor_20250429
        };

        if (anthropicTools[name]) {
            return anthropicTools[name](params);
        }

        return tool(params);
    }
}