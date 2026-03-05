// file: scripts/generate-brand-assets.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = process.cwd();

const inputLogo = path.join(root, "assets", "logo-source.png");
const inputMark = path.join(root, "assets", "logo-mark-source.png");

const outLogo = path.join(root, "public", "brand", "logo.png");
const outMark = path.join(root, "public", "brand", "logo-mark.png");

const outIcon = path.join(root, "src", "app", "icon.png");
const outApple = path.join(root, "src", "app", "apple-icon.png");
const outFaviconIco = path.join(root, "src", "app", "favicon.ico");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function run() {
  ensureDir(path.join(root, "public", "brand"));
  ensureDir(path.join(root, "src", "app"));
  ensureDir(path.join(root, "assets"));

  if (!fs.existsSync(inputLogo)) {
    throw new Error(`Não encontrei ${inputLogo}. Coloque a logo fonte em assets/logo-source.png`);
  }
  if (!fs.existsSync(inputMark)) {
    throw new Error(`Não encontrei ${inputMark}. Coloque a marca (cuia) em assets/logo-mark-source.png`);
  }

  // Logo alta resolução
  await sharp(inputLogo)
    .resize({ width: 1400, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(outLogo);

  await sharp(inputMark)
    .resize({ width: 1024, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(outMark);

  // App icon 512x512 - cuia MAIOR (90% do espaço)
  await sharp(inputMark)
    .resize(480, 480, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 16,
      bottom: 16,
      left: 16,
      right: 16,
      background: { r: 245, g: 240, b: 230, alpha: 1 },
    })
    .png()
    .toFile(outIcon);

  // Apple icon 180x180 - cuia MAIOR (90% do espaço)
  await sharp(inputMark)
    .resize(164, 164, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 8,
      bottom: 8,
      left: 8,
      right: 8,
      background: { r: 245, g: 240, b: 230, alpha: 1 },
    })
    .png()
    .toFile(outApple);

  // favicon.ico - cuia ocupa mais espaço
  const tmp16 = await sharp(inputMark)
    .resize(14, 14, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 1,
      bottom: 1,
      left: 1,
      right: 1,
      background: { r: 245, g: 240, b: 230, alpha: 1 },
    })
    .png()
    .toBuffer();

  const tmp32 = await sharp(inputMark)
    .resize(28, 28, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 2,
      bottom: 2,
      left: 2,
      right: 2,
      background: { r: 245, g: 240, b: 230, alpha: 1 },
    })
    .png()
    .toBuffer();

  const tmp48 = await sharp(inputMark)
    .resize(44, 44, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 2,
      bottom: 2,
      left: 2,
      right: 2,
      background: { r: 245, g: 240, b: 230, alpha: 1 },
    })
    .png()
    .toBuffer();

  const ico = await pngToIco([tmp16, tmp32, tmp48]);
  fs.writeFileSync(outFaviconIco, ico);

  console.log("OK: brand assets gerados:");
  console.log(" -", outLogo);
  console.log(" -", outMark);
  console.log(" -", outIcon);
  console.log(" -", outApple);
  console.log(" -", outFaviconIco);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
