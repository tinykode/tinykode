import { streamText, tool } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({
    baseURL: 'http://localhost:3030/v1',
    apiKey: 'test-key-1',
});

export class AIClient {
    streamText({
        model = anthropic("anthropic--claude-4-sonnet"),
        context = {},
        ...args
    }) {
        return streamText({ model, experimental_context: context, ...args });
    }
}

export function createTool({ name, params }) {
    const anthropicTools = {
        'bash': anthropic.tools.bash_20250124,
        'textEditor': anthropic.tools.textEditor_20250429
    }

    if (anthropicTools[name]) {
        return anthropicTools[name](params);
    }

    return tool(params);
}