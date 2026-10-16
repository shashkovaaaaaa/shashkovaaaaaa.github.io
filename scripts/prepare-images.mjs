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

  // Кейс Supply Leader (design/pages/work-supply-leader-*.md).
  // Первый экран: desktop 1200×600 (2:1) → 2×.
  {
    src: 'c53368aeed350d92b4f1708635a09ebe116b3b0c.png',
    out: 'cases/supply-leader/hero.webp',
    width: 2400,
    height: 1200,
  },
  // Ряды из трёх картинок: desktop ~389×389 (больше, чем 320 на mobile и 232 на tablet) → 2×.
  ...square('cases/supply-leader/screens', 780, [
    '8dc0da06f442f11ba51a054c031bc234a5c0e3fd.png',
    '598192572c3907af0396f28446aa0ef8842813d5.png',
    '8e5bd810841e52329f5c53d1f26295489292a884.png',
  ]),
  ...square('cases/supply-leader/problems', 780, [
    '5c4095efe381ca506507e99ed8b9ff8de93f8154.png',
    '7a947297bfd95950f2cf6cbadee0ba817dc6e0d6.png',
    'f7df7aadf4fc3892634071c23c3bfbf9ca63f062.png',
  ]),
  // Decision: desktop 590×590, tablet 728×728 → 2× от 728.
  ...square('cases/supply-leader/decision', 1456, [
    '136e85dd22450b1061eaf023d3cc9b09133b1bdc.png',
    '9f88b9b3838821397316ba31a584f4d4042c5e07.png',
    'c192dc5898cc640b6fb97efc3dfab5ecd1b8d730.png',
  ]),
];

// Open Graph: 1200×630 JPEG. Лежат в public/og — вне папки оптимизатора, поэтому сжимаются один раз здесь.
const OG_OUT = 'public/og';
const ogManifest = [
  { src: 'aadf5171ed67f428d6ffb7d7c81eb94335b22dc4.png', out: 'supply-leader.jpg' },
];

// Серия квадратных картинок: <prefix>-1.webp, <prefix>-2.webp, …
function square(prefix, size, sources) {
  return sources.map((src, i) => ({
    src,
    out: `${prefix}-${i + 1}.webp`,
    width: size,
    height: size,
  }));
}

async function render(src, target, width, height, encode) {
  await mkdir(dirname(target), { recursive: true });
  const info = await encode(
    sharp(join(SRC, src)).resize(width, height, {
      fit: 'cover',
      position: 'centre',
      withoutEnlargement: true,
    }),
  ).toFile(target);
  const kb = ((await stat(target)).size / 1024).toFixed(0);
  console.log(`${target}  ${info.width}×${info.height}  ${kb} KB`);
}

for (const { src, out, width, height } of manifest) {
  await render(src, join(OUT, out), width, height, (img) =>
    img.webp({ lossless: true, effort: 6 }),
  );
}

for (const { src, out } of ogManifest) {
  await render(src, join(OG_OUT, out), 1200, 630, (img) =>
    img.flatten({ background: '#ffffff' }).jpeg({ quality: 85, mozjpeg: true }),
  );
}
