import { bashTool } from "./bash/index.js"
import { editorTool } from "./editor/index.js"

const ToolsMap = {
  [bashTool.name]: bashTool,
  [editorTool.name]: editorTool,
}

export { ToolsMap }