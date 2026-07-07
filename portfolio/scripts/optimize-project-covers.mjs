import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();

const covers = [
  {
    input: "public/image/Group 37427.png",
    outputBase: "public/image/optimized/guokebang-cover",
  },
  {
    input: "public/image/Mask group.png",
    outputBase: "public/image/optimized/plastic-ocean-cover",
  },
  {
    input: "public/image/dongpo-fantasy-cover.png",
    outputBase: "public/image/optimized/dongpo-fantasy-cover",
  },
  {
    input: "public/image/Mask group2.png",
    outputBase: "public/image/optimized/yongzhi-journey-cover",
  },
  {
    input: "public/image/coverimg.png",
    outputBase: "public/image/optimized/lunanest-cover",
  },
  {
    input: "public/image/Rectangle.png",
    outputBase: "public/image/optimized/northeast-news-cover",
  },
];

const widths = [640, 1280];

async function ensureDir(path) {
  await mkdir(dirname(path), { recursive: true });
}

async function optimizeCover({ input, outputBase }) {
  const inputPath = resolve(projectRoot, input);

  for (const width of widths) {
    const outputPath = resolve(projectRoot, `${outputBase}-${width}.webp`);
    await ensureDir(outputPath);

    await sharp(inputPath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({
        quality: 82,
        alphaQuality: 92,
        effort: 6,
      })
      .toFile(outputPath);
  }
}

async function main() {
  for (const cover of covers) {
    await optimizeCover(cover);
  }

  console.log("Optimized responsive cover images generated.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
