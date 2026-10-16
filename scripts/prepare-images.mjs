// Готовит уменьшенные копии картинок из design/images (локально, не в git) в public/images.
// Правила — в CLAUDE.md, раздел «Картинки»: только уменьшаем до 2× от размера в макете и сохраняем
// без потерь (WebP lossless). Сжимает с потерями только next-image-export-optimizer при сборке.
// Запуск: pnpm images

import { mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

const SRC = 'design/images';
const OUT = 'public/images';

// width/height — итоговый размер (2× от максимального в макете); кадрирование по центру, как `fill` в Figma.
const manifest = [
  // Главная, карточки: desktop 610×488 и tablet 728×582 (5:4) → 2× от 728.
  {
    src: 'c428001613940105efc1aff78457e6f4fa9ec4e2.png',
    out: 'cases/prokladovki/cover.webp',
    width: 1456,
    height: 1165,
  },
  {
    src: 'c345934c8441d8cbde4b1b1b133be3a83c9ea739.png',
    out: 'cases/askezio/cover.webp',
    width: 1456,
    height: 1165,
  },
  {
    src: 'aadf5171ed67f428d6ffb7d7c81eb94335b22dc4.png',
    out: 'cases/supply-leader/cover.webp',
    width: 1456,
    height: 1165,
  },
  // Главная, карточки: mobile 370×370 → 2×.
  {
    src: 'b281e511df12cc35a05407a00bd3856d3d497d98.png',
    out: 'cases/prokladovki/cover-mobile.webp',
    width: 740,
    height: 740,
  },
  {
    src: '7807b13a3de6046c3af2677e6e4534c8389195e9.png',
    out: 'cases/askezio/cover-mobile.webp',
    width: 740,
    height: 740,
  },
  {
    src: '1a836a40ede183ab978f6546ec6cd00f828fb337.png',
    out: 'cases/supply-leader/cover-mobile.webp',
    width: 740,
    height: 740,
  },
];

for (const { src, out, width, height } of manifest) {
  const target = join(OUT, out);
  await mkdir(dirname(target), { recursive: true });
  const info = await sharp(join(SRC, src))
    .resize(width, height, { fit: 'cover', position: 'centre', withoutEnlargement: true })
    .webp({ lossless: true, effort: 6 })
    .toFile(target);
  const kb = ((await stat(target)).size / 1024).toFixed(0);
  console.log(`${target}  ${info.width}×${info.height}  ${kb} KB`);
}
