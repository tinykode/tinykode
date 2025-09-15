import path from 'path';
import { withinRoot } from "../../utils/withinRoot.js"
import type { ToolExecuteContext } from "../../ai.js"
import { view } from './view.js';
import { strReplace } from './str_replace.js';
import { create } from './create.js';
import { insert } from './insert.js';

interface EditorParams {
	path: string;
	command: 'view' | 'str_replace' | 'create' | 'insert';
	old_str?: string;
	new_str?: string;
	file_text?: string;
	view_range?: [number, number];
	insert_line?: number;
}

const COMMAND_MAP = {
	'view': view,
	'str_replace': strReplace,
	'create': create,
	'insert': insert,
};

async function execute(params: EditorParams, { experimental_context: { workspaceRoot } }: ToolExecuteContext): Promise<string> {
	try {
		const filePath = path.isAbsolute(params.path)
			? params.path
			: path.resolve(workspaceRoot, params.path);

		// Check if the path is within the root directory
		if (!withinRoot(filePath)) {
			return `Error: The path ${filePath} is outside the root directory.`;
		}

		params.path = filePath; // Ensure the path is absolute for all commands

		const command = params.command;
		if (!COMMAND_MAP[command]) {
			return `Error: Unknown command '${command}'. Available commands are: ${Object.keys(COMMAND_MAP).join(', ')}`;
		}
		return await COMMAND_MAP[command](params);
	} catch (error) {
		return `Error: ${error instanceof Error ? error.message : String(error)}`;
	}
}

const name = "textEditor"

const editorTool = {
	name,
	params: {
		execute,
	}
}

export { 
	editorTool,
	type EditorParams
}
