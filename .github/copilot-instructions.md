# TinyKode - Copilot Instructions

## Repository Summary

TinyKode is a lightweight code assistant library with CLI support, written in TypeScript. It provides an AI-powered code assistant that can execute bash commands and edit files within a workspace, with a Node.js CLI interface and programmatic API. The project focuses on AI-powered code assistance using Anthropic's Claude models.

## High-Level Repository Information

- **Size**: 54MB (including node_modules), 13 TypeScript source files  
- **Type**: TypeScript/Node.js library with CLI tool
- **Main Languages**: TypeScript (ES2022), JavaScript (ESNext modules)
- **Target Runtime**: Node.js v20.19.5+
- **Frameworks**: Uses AI SDK (@ai-sdk/anthropic), Express.js for examples
- **Package Manager**: Supports both npm and pnpm
- **Module System**: ES modules (`"type": "module"`)

## Build Instructions

### Environment Setup (CRITICAL)

1. **Always install dependencies first** before any build or run operations:
   ```bash
   npm install
   ```
   Or alternatively:
   ```bash
   pnpm install
   ```

2. **API Configuration Required**: The CLI requires Anthropic API configuration:
   - Default config tries `http://localhost:3030/v1` (dev server)
   - Set environment variables: `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`
   - Or configure via `~/.tinykode/tinykode.json`

### Build Steps

1. **TypeScript Compilation** (required before running):
   ```bash
   npm run build
   ```
   - **Time required**: ~2-3 seconds
   - **Output**: Creates `dist/` directory with compiled JavaScript
   - **Artifacts**: `.js`, `.d.ts`, `.js.map`, `.d.ts.map` files

2. **Development Mode** (for active development):
   ```bash
   npm run dev
   ```
   - Runs TypeScript compiler in watch mode
   - **Time required**: Continuous, rebuilds on file changes

### Linting

```bash
npx eslint . --ext .js --max-warnings 0
```
- **Note**: ESLint is configured for JavaScript files only (not TypeScript)
- **Config**: Uses `eslint.config.js` with ESNext modules support
- **Ignored**: `node_modules`, `.history`, `dist`, `out`, `build`

### Testing

- **Current Status**: No test suite implemented (`npm run test` returns error)
- Test implementation is needed if adding test coverage

### Running the CLI

**Prerequisites**: Must build first (`npm run build`)

```bash
# Direct execution (after build)
node bin/tinykode.js

# Via npm script (starts dist/index.js)
npm start

# CLI via dist (after build) 
npm run cli
```

**Common Error**: If API is not configured, CLI will fail with:
```
RetryError [AI_RetryError]: Failed after 3 attempts. Last error: Cannot connect to API
```

### Examples

The `examples/` directory contains a working HTTP server example:

```bash
cd examples
npm install   # Use npm install (pnpm may not be available)
npm start     # Starts server on http://localhost:3000
```

**Note**: Examples use `pnpm-lock.yaml` but work with `npm install` if pnpm is not available.

## Project Layout and Architecture

### Key Source Files

- `src/index.ts` - Main library export (exports `TinyKode` class)
- `src/core/tinykode.ts` - Core TinyKode class implementation
- `src/core/config.ts` - Configuration management
- `src/core/ai.ts` - AI client (Anthropic integration)
- `src/cli/cli.ts` - CLI implementation and interface
- `bin/tinykode.js` - CLI entry point executable

### Tool System Architecture

- `src/core/tools/index.ts` - Tool registry (exports `ToolsMap`)
- `src/core/tools/bash/index.ts` - Bash execution tool (10s timeout)
- `src/core/tools/editor/` - File editing tools:
  - `view.ts` - File/directory viewing
  - `create.ts` - File creation
  - `str_replace.ts` - String replacement in files  
  - `insert.ts` - Line insertion in files

### Configuration Files

- `tsconfig.json` - TypeScript configuration (ES2022, ESNext modules)
- `eslint.config.js` - ESLint configuration
- `package.json` - Main package configuration
- `.gitignore` - Excludes: `.history`, `node_modules`, `.env`, `dist`

### Build Output

- `dist/` - TypeScript compilation output (created by `npm run build`)
- `tsconfig.tsbuildinfo` - TypeScript incremental build info

### Dependencies (Security Critical)

**Runtime Dependencies**:
- `@ai-sdk/anthropic@^2.0.15` - Anthropic AI integration
- `ai@^5.0.41` - AI SDK core
- `zod@^4.1.8` - Schema validation

**Development Dependencies**:
- `typescript@^5.9.2`
- `eslint@^9.35.0` and related packages
- `@types/node@^24.4.0`

### Safety & Validation

- **Workspace Root Protection**: `withinRoot()` function prevents file operations outside workspace
- **Command Validation**: Bash tool validates commands (no newlines, non-empty)
- **Tool Confirmation**: Interactive tool execution confirmation via `onToolConfirm`
- **Process Management**: Active process tracking and cleanup for bash commands

## Key Facts for Code Changes

### File Structure Priority

1. **Core Logic**: `src/core/tinykode.ts` - Main processing logic
2. **Tool Modifications**: `src/core/tools/` - Command/file operation tools  
3. **CLI Changes**: `src/cli/cli.ts` - Interactive interface
4. **Configuration**: `src/core/config.ts` - App configuration
5. **Entry Points**: `bin/tinykode.js`, `src/index.ts` - Public interfaces

### Important Constraints

- **ES Modules Only**: All imports must use `.js` extensions (not `.ts`)
- **No Force Pushes**: Cannot use `git rebase` or force push operations
- **Node v20+ Required**: Uses modern Node.js features
- **Build Required**: Always run `npm run build` before testing CLI
- **API Dependency**: Requires Anthropic API or local dev server

### Common Workflow

1. Make code changes in `src/`
2. Run `npm run build` 
3. Test with `node bin/tinykode.js` or examples
4. Lint with `npx eslint . --ext .js --max-warnings 0`
5. For examples: `cd examples && npm install && npm start`

## Trust These Instructions

These instructions are comprehensive and current as of the repository state. Only search for additional information if:
- These instructions are found to be incorrect or incomplete
- You encounter errors not covered by these instructions  
- You need details about specific internal implementations

The build process, file structure, and tool behavior described here have been validated through testing.