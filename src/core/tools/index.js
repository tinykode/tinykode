import { bashTool } from "./bash/index.js"
import { editorTool } from "./editor/index.js"
import { createTool } from "../ai.js"

const tools = {
  [bashTool.name]: createTool(bashTool),
  [editorTool.name]: createTool(editorTool),
}

export { tools }