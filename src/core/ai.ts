import { streamText, tool } from 'ai';
import type { 
    ToolSet,
    ModelMessage,
    LanguageModel,
    TypedToolResult,
    TypedToolCall,
 } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { Config } from './config.js';

type ToolExecuteContext = {
    experimental_context: {
        workspaceRoot: string;
        onToolConfirm?: (args: ToolParams) => Promise<boolean> | undefined;
    };
};

type ToolParams = {
    name: string;
    params: any;
};

type ToolCall = TypedToolCall<ToolSet>
type ToolResult = TypedToolResult<ToolSet>

type OmitParam<T, K extends keyof T> = T extends { [P in K]: any } ? Omit<T, K> : T;

type StreamTextArgsBase = (typeof streamText extends (args: infer P) => any ? P : never)
type StreamTextArgs = OmitParam<StreamTextArgsBase, 'model'> & {
    model?: LanguageModel;
    context: ToolExecuteContext['experimental_context']
};

type StreamTextReturn = ReturnType<typeof streamText>;

class AIClient {
    config: Config;
    anthropic: any;

    constructor(config: Config) {
        this.config = config;
        this.anthropic = createAnthropic({
            baseURL: this.config.anthropicBaseURL,
            apiKey: this.config.anthropicApiKey
        });
    }

    streamText({
        model = this.anthropic("anthropic--claude-4-sonnet"),
        context = {
            workspaceRoot: this.config.workspaceRoot,
        },
        ...args
    }: StreamTextArgs): StreamTextReturn {
        return streamText({ model, experimental_context: context, ...args });
    }

    createTool({ name, params }: ToolParams) {
        const anthropicTools: Record<string, any> = {
            'bash': this.anthropic.tools.bash_20250124,
            'textEditor': this.anthropic.tools.textEditor_20250429
        };

        if (anthropicTools[name]) {
            return anthropicTools[name](params);
        }

        return tool(params);
    }
}

export {
    AIClient,
    type ToolSet,
    type ToolCall,
    type ToolResult,
    type ModelMessage,
    type ToolExecuteContext,
};