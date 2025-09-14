import { bashTool } from "./bash/index.js"
import { editorTool } from "./editor/index.js"

const tools = {
  [bashTool.name]: bashTool,
  [editorTool.name]: editorTool,
}

export { tools }