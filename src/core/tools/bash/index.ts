import { exec, ChildProcess } from 'child_process';
import { ToolExecuteContext } from '../../ai.js';
import { withinRoot } from "../../utils/withinRoot.js"

interface BashParams {
  command: string;
  restart?: boolean;
}

// Set to track active child processes
const activeProcesses = new Set<ChildProcess>();

// Function to cleanup all active processes
const cleanupAllProcesses = (): void => {
	console.log(`Cleaning up ${activeProcesses.size} active processes...`);
	for (const process of activeProcesses) {
		try {
			if (!process.killed) {
				process.kill('SIGTERM');
				// Force kill after 2 seconds if still alive
				setTimeout(() => {
					if (!process.killed) {
						process.kill('SIGKILL');
					}
				}, 2000);
			}
		} catch (error) {
			console.error('Error killing process:', error);
		}
	}
	activeProcesses.clear();
};

async function execute(params: BashParams, { experimental_context: { workspaceRoot, onToolConfirm } }: ToolExecuteContext): Promise<string> {
	try {
		if (!withinRoot(workspaceRoot)) {
			return 'Error: Command execution is restricted outside the workspace root.';
		}
		if (!params.command || params.command.trim() === '') {
			return 'Error: Command cannot be empty';
		}
		if (params.command.includes('\n')) {
			return 'Error: Command cannot contain newlines';
		}

		// Handle restart parameter - cleanup existing processes
		if (params.restart) {
			console.log('Restarting terminal session - cleaning up existing processes...');
			cleanupAllProcesses();
		}

		if (!(await onToolConfirm?.({ name: "bash", params }))) {
			return "User canceled the operation, stop tool execution."
		}

		try {
			const childProcess = exec(params.command, {
				cwd: workspaceRoot,
				timeout: 10000, // 10 second timeout
			});

			// Track the process
			activeProcesses.add(childProcess);

			const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
				let stdoutData = '';
				let stderrData = '';

				childProcess.stdout?.on('data', (data) => {
					stdoutData += data;
				});
				childProcess.stderr?.on('data', (data) => {
					stderrData += data;
				});

				childProcess.on('close', (code, signal) => {
					// Remove from active processes when it closes
					activeProcesses.delete(childProcess);

					if (signal && signal === 'SIGTERM') {
						if (stderrData) stderrData += `\nCommand terminated likely to timeout, you can continue;`;
						if (stdoutData) stdoutData += `\nCommand terminated likely to timeout, you can continue;`;
					} else if (code !== 0) {
						if (stderrData) stderrData += `\nCommand failed with code ${code}`;
						if (stdoutData) stdoutData += `\nCommand failed with code ${code}`;
					}
					resolve({ stdout: stdoutData, stderr: stderrData });
				});

				childProcess.on('error', (error) => {
					// Remove from active processes on error
					activeProcesses.delete(childProcess);
					reject(error);
				});
			});

			let output = '';
			if (stdout) output += `stdout:\n${stdout}`;
			if (stderr) output += `${output ? '\n' : ''}stderr:\n${stderr}`;

			return output;
		} catch (error) {
			return `Error executing command "${params.command}": ${error instanceof Error ? error.message : String(error)}`;
		}

	} catch (error) {
		return `Error preparing terminal command: ${error instanceof Error ? error.message : String(error)}`;
	}
}

const name = "bash"

const bashTool = {
	name,
	params: {
		execute
	}
}
export { 
	bashTool,
	cleanupAllProcesses,
	type BashParams
}
