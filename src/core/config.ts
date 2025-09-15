export interface Config {
    anthropicApiKey: string;
    anthropicBaseURL: string;
    workspaceRoot: string;
}

export const config: Config = {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || 'test-key-1',
    anthropicBaseURL: process.env.ANTHROPIC_BASE_URL || 'http://localhost:3030/v1',
    workspaceRoot: process.env.WORKSPACE_ROOT || process.cwd(),
};

export const parseConfig = (newConfig: Partial<Config>): Config => {
    return {
        ...config,
        ...newConfig
    };
};