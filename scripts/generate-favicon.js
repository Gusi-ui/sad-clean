#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const pngToIco = require("png-to-ico");

async function run() {
  const svgPath = path.resolve(__dirname, "..", "public", "favicon.svg");
  const outIco = path.resolve(__dirname, "..", "public", "favicon.ico");
  if (!fs.existsSync(svgPath)) {
    console.error("No se encontró public/favicon.svg");
    process.exit(1);
  }
  const sizes = [16, 32, 48, 64];
  const pngBuffers = [];
  for (const size of sizes) {
    const buf = await sharp(svgPath)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer();
    pngBuffers.push(buf);
  }
  const icoBuffer = await pngToIco(pngBuffers);
  fs.writeFileSync(outIco, icoBuffer);
  console.log("Favicon .ico generado en public/favicon.ico");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
