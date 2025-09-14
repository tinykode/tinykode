import readline from 'readline/promises';
import { TinyKode } from './core/tinykode.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export const input = async (question) => {
    console.log();
    return (await rl.question(question)).trim();
};

async function main() {
    try {
        const tinykode = new TinyKode();

        while (true) {
            const query = await input(">");
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
                    return ['', 'y', 'yes'].includes(confirmed.toLocaleLowerCase());
                }
            });
        }

    } catch (error) {
        console.error('Application error:', error);
        process.exit(1);
    }
}

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
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Graceful shutdown...');
    process.exit(0);
});

main();