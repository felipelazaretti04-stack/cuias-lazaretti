// file: scripts/generate-brand-assets.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = process.cwd();

const inputLogo = path.join(root, "assets", "logo-source.png");      // coloque aqui a logo completa (PNG)
const inputMark = path.join(root, "assets", "logo-mark-source.png"); // coloque aqui a cuia (PNG)

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

  // Logo alta resolução (padroniza largura, preserva transparência)
  await sharp(inputLogo)
    .resize({ width: 1400, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(outLogo);

  await sharp(inputMark)
    .resize({ width: 1024, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(outMark);

  // App icon 512x512 usando o mark (sem texto miúdo)
  await sharp(inputMark)
    .resize(420, 420, { fit: "contain" })
    .extend({
      top: 46,
      bottom: 46,
      left: 46,
      right: 46,
      background: { r: 245, g: 240, b: 230, alpha: 1 }, // creme quente
    })
    .png()
    .toFile(outIcon);

  // Apple icon 180x180
  await sharp(inputMark)
    .resize(140, 140, { fit: "contain" })
    .extend({
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
      background: { r: 245, g: 240, b: 230, alpha: 1 },
    })
    .png()
    .toFile(outApple);

  // favicon.ico multi-size (16, 32, 48)
  const tmp16 = await sharp(inputMark)
    .resize(16, 16, { fit: "contain" })
    .png()
    .toBuffer();
  const tmp32 = await sharp(inputMark)
    .resize(32, 32, { fit: "contain" })
    .png()
    .toBuffer();
  const tmp48 = await sharp(inputMark)
    .resize(48, 48, { fit: "contain" })
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
