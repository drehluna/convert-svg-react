#!/usr/bin/env node

import Parser from "./parser.js";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Por favor, forneça o caminho do arquivo de entrada.");
  process.exit(1);
}

const svgFile = args[0];
const componentName = args[1] || svgFile.split("/").pop().split(".")[0];

const parser = new Parser({ file: svgFile, componentName });
parser.writeFile();
