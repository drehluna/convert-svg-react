import path from "path";
import fs from "fs";

class Parser {
  constructor({ file, componentName = "lunasvg" }) {
    this.file = file;
    this.path = path.resolve(process.cwd(), file);
    this.componentName = componentName;
    this.color = "#FFF";
  }

  #readFile() {
    return fs.readFileSync(this.path, "utf8");
  }

  #parseSvg() {
    const svg = this.#readFile();
    const widthMatch = svg.match(/width="(\d+)"/);
    const heightMatch = svg.match(/height="(\d+)"/);
    let width = widthMatch ? parseInt(widthMatch[1], 10) : 0;
    let height = heightMatch ? parseInt(heightMatch[1], 10) : 0;

    const size = width > height ? "width" : "height";

    let newWidth = 0;
    let newHeight = 0;

    if (size === "width") {
      newHeight = width - (width - height);
    } else {
      newWidth = height - (height - width);
    }

    const fillIndex = svg.indexOf('fill="');
    if (fillIndex !== -1) {
      const beforeFill = svg.substring(0, fillIndex);
      const afterFill = svg.substring(fillIndex);

      const modifiedAfterFill = afterFill.replace(
        /fill="[^"]*"/g,
        `fill={color}`
      );

      const svgReact = (beforeFill + modifiedAfterFill)
        .replace(
          `width="${width}"`,
          `width={${size === "height" ? `size - ${height - width}` : `size`}}`
        )
        .replace(
          `height="${height}"`,
          `height={${size === "width" ? `size - ${width - height}` : `size`}}`
        )
        .replace(/<\/svg>/g, "</svg>");
      return { svgReact, size, newWidth, newHeight, width, height };
    } else {
      const svgReact = svg
        .replace(
          `width="${width}"`,
          `width={${size === "height" ? `size - ${height - width}` : `size`}}`
        )
        .replace(
          `height="${height}"`,
          `height={${size === "width" ? `size - ${width - height}` : `size`}}`
        )
        .replace(/<\/svg>/g, "</svg>")
        .replace(/fill="[^"]*"/g, "fill={color}")
        .replace(/<\/svg>/g, "</svg>");
      return { svgReact, size, newWidth, newHeight, width, height };
    }
  }

  createReactComponent = () => {
    const { svgReact, size, width, height } = this.#parseSvg();
    return `
        export default function ${
          this.componentName.charAt(0).toUpperCase() +
          this.componentName.slice(1)
        } ({size = ${size === "width" ? width : height}, color}) {
            return (
                <div>
                   ${svgReact}
                </div>
            )
        }

        `;
  };

  getOutputPath() {
    const pathParts = this.path.split("/");
    const fileName = pathParts.pop().split(".")[0];
    const capitalizedComponentName =
      fileName.charAt(0).toUpperCase() + fileName.slice(1);
    const outputPath = `${pathParts.join("/")}/${capitalizedComponentName}.jsx`;
    return outputPath;
  }

  writeFile() {
    const outputPath = this.getOutputPath();
    const componentCode = this.createReactComponent();
    fs.writeFileSync(outputPath, componentCode, "utf8");
    console.log(`Arquivo ${outputPath} criado com sucesso.`);
  }
}

export default Parser;
