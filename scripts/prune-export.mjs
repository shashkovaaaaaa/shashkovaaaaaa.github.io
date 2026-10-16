// Последний шаг `pnpm build` (после next build и next-image-export-optimizer):
// убирает из out/ lossless-исходники картинок, чтобы на хостинг уезжали только оптимизированные WebP.
//
// 1. out/images/** — копия public/images: оставляем только папки nextImageExportOptimizer/.
// 2. out/_next/static/media — исходники статических импортов (обложки, аватар): удаляем те,
//    для которых в out/nextImageExportOptimizer/ есть оптимизированные варианты `<имя>-opt-<ширина>`.
//
// Исходник нужен ExportedImage только как запасной вариант, если оптимизированная картинка не загрузилась.

import { readdir, rm, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';

const OUT = 'out';
const OPT_DIR = 'nextImageExportOptimizer';
const IMAGE_EXT = /\.(webp|png|jpe?g|avif|gif)$/i;

let removedFiles = 0;
let removedBytes = 0;

async function remove(path) {
  removedBytes += (await stat(path)).size;
  removedFiles += 1;
  await rm(path);
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

// 1. out/images: всё, что не внутри nextImageExportOptimizer/, плюс служебный хеш-файл оптимизатора.
async function pruneImages(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== OPT_DIR) await pruneImages(path);
    } else {
      await remove(path);
    }
  }
}

// 2. out/_next/static/media: исходники с готовыми вариантами.
async function pruneStaticMedia() {
  const mediaDir = join(OUT, '_next/static/media');
  const optimized = new Set(
    (await readdir(join(OUT, OPT_DIR))).map((name) => name.replace(/-opt-\d+\.[a-z]+$/i, '')),
  );
  for (const name of await readdir(mediaDir)) {
    if (IMAGE_EXT.test(name) && optimized.has(parse(name).name)) await remove(join(mediaDir, name));
  }
}

if (await exists(join(OUT, 'images'))) await pruneImages(join(OUT, 'images'));
if (await exists(join(OUT, OPT_DIR))) await pruneStaticMedia();

console.log(
  `prune-export: удалено исходников ${removedFiles} (${(removedBytes / 1024 / 1024).toFixed(1)} МБ)`,
);
