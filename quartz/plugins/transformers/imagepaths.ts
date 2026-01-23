import { QuartzTransformerPlugin } from "../types"
import { visit } from "unist-util-visit"
import path from "path"
import { slugifyFilePath } from "../../util/path"

export const ImagePaths: QuartzTransformerPlugin = () => {
  return {
    name: "FixImagePaths",
    markdownPlugins() {
      return [
        () => (tree) => {
          visit(tree, "image", (node: any) => {
            if (!node.url.startsWith("http") && !node.url.startsWith("data:")) {
              const fileName = slugifyFilePath(path.basename(node.url) as any)
              const alt = node.alt ? `|${node.alt}` : ""
              node.type = "text"
              node.value = `![[${fileName}${alt}]]`
            }
          })
        },
      ]
    },
  }
}
