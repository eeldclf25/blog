import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { joinSegments, pathToRoot } from "../util/path"
import { classNames } from "../util/lang"

interface BannerOptions {
  imagePath?: string
  altText?: string
  width?: string
  height?: string
}

const defaultOptions: BannerOptions = {
  imagePath: "static/banner.png",
  altText: "Blog Banner",
  width: "auto",
  height: "200px",
}

export default ((userOpts?: BannerOptions) => {
  const opts = { ...defaultOptions, ...userOpts }
  const Banner: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const baseDir = pathToRoot(fileData.slug!)
    const imgSrc = joinSegments(baseDir, opts.imagePath!)

    return (
      <div class={classNames(displayClass, "page-banner")}>
        <a href={baseDir}>
          <img
            src={imgSrc}
            alt={opts.altText}
            style={{
              width: opts.width,
              height: opts.height
            }}
          />
        </a>
      </div>
    )
  }

  Banner.css = `
  .page-banner {
    margin: -4rem 0 0 0;
  }
  .page-banner img {
    max-width: 100%;
    border-radius: 4px;
    display: block;
  }
  `
  return Banner
}) satisfies QuartzComponentConstructor

