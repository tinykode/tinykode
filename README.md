# TinyKode

A lightweight code assistant library with CLI support.

## Installation

### As a global CLI tool

```bash
npm install -g tinykode
```

Then use the CLI:

```bash
tinykode
```

### As a local dependency

```bash
npm install tinykode
```

## Usage

### Programmatic Usage

```javascript
import { TinyKode } from "tinykode";

const tinykode = new TinyKode({
    workspaceRoot: process.cwd()
});

const messages = await tinykode.processQuery({
    query: "Create a file named hello.txt with the content 'Hello, World!'",
});
```

### CLI Usage

After installing globally, run:

```bash
tinykode
```

This will start an interactive session where you can type your queries.

Available commands in CLI:
- Type any query and press Enter
- Type `exit` or `quit` to close the CLI
- Use Ctrl+C for immediate exit

### Programmatic CLI Usage

You can also create and customize the CLI programmatically:

```javascript
import { createCLI, setupEventHandlers } from "tinykode";

const cli = createCLI({
    prompt: "my-cli> ",
    welcomeMessage: "Welcome to my custom CLI!",
    exitCommands: ['exit', 'quit', 'bye'],
    tinykodeConfig: {
        workspaceRoot: process.cwd()
    },
    onExit: () => {
        console.log('Custom goodbye message!');
        process.exit(0);
    }
});

setupEventHandlers(cli);
await cli.start();
```

## Configuration

The TinyKode constructor accepts a configuration object:

```javascript
const tinykode = new TinyKode({
    workspaceRoot: process.cwd(),
    // Add other configuration options here
});
```

## API

### TinyKode

Main class for interacting with the code assistant.

#### Constructor

```javascript
new TinyKode(config, tools, messages)
```

- `config`: Configuration object (optional, uses default config if not provided)
- `tools`: Tools map (optional, uses default tools if not provided)  
- `messages`: Initial messages array (optional, defaults to empty array)

#### Methods

##### processQuery(options)

Process a user query and return the conversation messages.

```javascript
const messages = await tinykode.processQuery({
    query: "Your query here",
    onUpdate: (chunk) => console.log(chunk),
    onToolCalls: (toolCalls) => console.log('Tool calls:', toolCalls),
    onToolResults: (toolResults) => console.log('Tool results:', toolResults),
    onToolConfirm: async ({ tool, params }) => {
        // Return true to confirm tool execution, false to deny
        return true;
    }
});
```

Options:
- `query` (string, required): The user query to process
- `onUpdate` (function, optional): Callback for streaming text updates
- `onToolCalls` (function, optional): Callback when tools are called
- `onToolResults` (function, optional): Callback when tool results are available
- `onToolConfirm` (function, optional): Callback to confirm tool execution

### CLI API

#### createCLI(options)

Create a customizable CLI instance.

```javascript
const cli = createCLI({
    prompt: "> ",                    // CLI prompt (default: ">")
    welcomeMessage: null,            // Welcome message (default: none)
    tinykodeConfig: {},              // TinyKode configuration
    exitCommands: ['exit', 'quit'],  // Commands that exit the CLI
    onExit: () => process.exit(0)    // Custom exit handler
});
```

Returns an object with:
- `start()`: Start the CLI loop
- `processQuery(query)`: Process a single query
- `cleanup()`: Clean up resources
- `tinykode`: Access to the underlying TinyKode instance

#### setupEventHandlers(cli)

Set up standard event handlers for the CLI (SIGINT, SIGTERM, uncaught exceptions).

#### input(question)

Utility function for prompting user input in CLI applications.

## License

ISC