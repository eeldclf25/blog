import { FilePath, joinSegments, slugifyFilePath } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import path from "path"
import fs from "fs"
import { glob } from "../../util/glob"
import { Argv } from "../../util/ctx"
import { QuartzConfig } from "../../cfg"

const filesToCopy = async (argv: Argv, cfg: QuartzConfig) => {
  // glob all non MD files in content folder and copy it over
  return await glob("**", argv.directory, ["**/*.md", ...cfg.configuration.ignorePatterns])
}

const copyFile = async (argv: Argv, fp: FilePath) => {
  const src = joinSegments(argv.directory, fp) as FilePath

  const name = slugifyFilePath(fp)
  const dest = joinSegments(argv.output, name) as FilePath

  // ensure dir exists
  const dir = path.dirname(dest) as FilePath
  await fs.promises.mkdir(dir, { recursive: true })

  await fs.promises.copyFile(src, dest)
  return dest
}

export const Assets: QuartzEmitterPlugin = () => {
  return {
    name: "Assets",
    async *emit({ argv, cfg }, content) {
      const fps = await filesToCopy(argv, cfg)
      const uas = new Set<string>()

      for (const [_, file] of content) {
        file.data.assets?.forEach((a) => uas.add(a))
        file.data.links?.forEach((l) => uas.add(l))
      }

      for (const fp of fps) {
        if (uas.has(slugifyFilePath(fp))) {
          yield copyFile(argv, fp)
        }
      }
    },
    async *partialEmit(ctx, content, _resources, changeEvents) {
      for (const changeEvent of changeEvents) {
        const ext = path.extname(changeEvent.path)
        if (ext === ".md") continue

        if (changeEvent.type === "add" || changeEvent.type === "change") {
          yield copyFile(ctx.argv, changeEvent.path)
        } else if (changeEvent.type === "delete") {
          const name = slugifyFilePath(changeEvent.path)
          const dest = joinSegments(ctx.argv.output, name) as FilePath
          await fs.promises.unlink(dest)
        }
      }

      const mdChanges = changeEvents.filter((e) => path.extname(e.path) === ".md")
      if (mdChanges.length > 0) {
        const fps = await filesToCopy(ctx.argv, ctx.cfg)
        const uas = new Set<string>()

        for (const [_, file] of content) {
          file.data.assets?.forEach((a) => uas.add(a))
          file.data.links?.forEach((l) => uas.add(l))
        }

        for (const fp of fps) {
          if (uas.has(slugifyFilePath(fp))) {
            yield copyFile(ctx.argv, fp)
          }
        }
      }
    },
  }
}
