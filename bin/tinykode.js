#!/usr/bin/env node

import { createCLI, setupEventHandlers } from '../dist/cli/cli.js';

async function main() {
    const cli = createCLI({
        prompt: "tinykode> ",
        welcomeMessage: `🚀 TinyKode CLI
Type your queries and press Enter. Use Ctrl+C to exit.
`,
        exitCommands: ['exit', 'quit'],
        onExit: () => {
            console.log('Goodbye! 👋');
            process.exit(0);
        }
    });

    setupEventHandlers(cli);
    await cli.start();
}

main();