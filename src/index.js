// Export the main class for programmatic use
export { TinyKode } from "./core/tinykode.js";

// Export other useful classes/utilities if needed
export { config as defaultConfig } from "./core/config.js";

// Export CLI functionality
export { createCLI, setupEventHandlers, input } from "./cli/cli.js";

// Example usage (commented out for library use):
/*
import { TinyKode } from "tinykode";

const tinykode = new TinyKode({
    workspaceRoot: process.cwd()
});

const messages = await tinykode.processQuery({
    query: "Create a file named hello.txt with the content 'Hello, World!'",
});
*/