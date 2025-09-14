import readline from 'readline/promises';
import { TinyKode } from '../core/tinykode.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_FILE = join(homedir(), '.tinykode', 'tinykode.json');

function loadConfig() {
    try {
        if (existsSync(CONFIG_FILE)) {
            const configData = readFileSync(CONFIG_FILE, 'utf8');
            return JSON.parse(configData);
        }
    } catch (error) {
        console.warn(`Warning: Could not load config from ${CONFIG_FILE}:`, error.message);
    }
    return {};
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export const input = async (question) => {
    console.log();
    return (await rl.question(question)).trim();
};

export const createCLI = (options = {}) => {
    const config = loadConfig();
    
    const {
        prompt = ">",
        welcomeMessage = null,
        tinykodeConfig = config,
        exitCommands = ['exit', 'quit'],
        onExit = () => {
            console.log('Goodbye! 👋');
            process.exit(0);
        }
    } = options;

    const tinykode = new TinyKode(tinykodeConfig);

    const processQuery = async (query) => {
        await tinykode.processQuery({
            query,
            onUpdate: (update) => {
                try {
                    process.stdout.write(update);
                } catch (error) {
                    console.error('Error writing to stdout:', error);
                }
            },
            onToolCalls: (toolCalls) => {
                if (toolCalls && toolCalls.length > 0) {
                    toolCalls.forEach(toolCall => {
                        console.log('\n====== Tool Call ======');
                        console.log(`Tool: ${toolCall.toolName}`);
                        const input = JSON.stringify(toolCall.input, null, 2)
                        const outputLines = input.split('\n').slice(0, 4);
                        console.log(outputLines.join('\n'));
                        console.log('========================\n');
                    });
                }
            },
            onToolResults: (toolResults) => {
                if (toolResults && toolResults.length > 0) {
                    toolResults.forEach(toolResult => {
                        console.log('\n====== Tool Result ======');
                        const outputLines = toolResult.output.split('\n').slice(0, 4);
                        console.log(outputLines.join('\n'));
                        console.log('========================\n');
                    });
                }
            },
            onToolConfirm: async ({ tool, params }) => {
                const question = `Confirm execution of tool "${tool}" with parameters ${JSON.stringify(params)}? (YES/no) > `;
                const confirmed = await input(question);
                return ['', 'y', 'yes'].includes(confirmed.toLowerCase());
            }
        });
    };

    const start = async () => {
        try {
            if (welcomeMessage) {
                console.log(welcomeMessage);
            }

            while (true) {
                const query = await input(prompt);
                
                if (exitCommands.includes(query.toLowerCase())) {
                    onExit();
                    return;
                }
                
                if (query.trim() === '') {
                    continue;
                }

                await processQuery(query);
            }
        } catch (error) {
            console.error('Application error:', error);
            process.exit(1);
        }
    };

    const cleanup = () => {
        rl.close();
    };

    return {
        start,
        processQuery,
        cleanup,
        tinykode
    };
};

export const setupEventHandlers = (cli) => {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });

    // Handle process termination signals
    process.on('SIGINT', () => {
        console.log('\nReceived SIGINT. Graceful shutdown...');
        cli?.cleanup();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\nReceived SIGTERM. Graceful shutdown...');
        cli?.cleanup();
        process.exit(0);
    });
};

// Default CLI implementation when run directly
async function main() {
    const cli = createCLI();
    setupEventHandlers(cli);
    await cli.start();
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}