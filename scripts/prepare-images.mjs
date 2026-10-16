// Готовит уменьшенные копии картинок из design/images (локально, не в git) в public/images.
// Правила — в CLAUDE.md, раздел «Картинки»: только уменьшаем до 2× от размера в макете и сохраняем
// без потерь (WebP lossless). Сжимает с потерями только next-image-export-optimizer при сборке.
// Запуск: pnpm images

import { mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

const SRC = 'design/images';
// Картинки по строковому пути (страницы кейсов) — в public/images, их оптимизатор ищет по папке.
const OUT = 'public/images';
// Картинки со статическим импортом (обложки карточек, аватар) — вне public/, иначе Next скопирует
// lossless-исходник в out/images, а оптимизатор обработает картинку дважды.
const STATIC = 'src/assets/images';

// width/height — итоговый размер (2× от максимального в макете); кадрирование по центру, как `fill` в Figma.
const manifest = [
  // Аватар в хедере: 40×40 → 2×.
  {
    src: '5db54b11bbd0942b58e1937b6ae4cf5b8c0ee851.png',
    root: STATIC,
    out: 'avatar.webp',
    width: 80,
    height: 80,
  },
  // Главная, карточки: desktop 610×488 и tablet 728×582 (5:4) → 2× от 728.
  {
    src: 'c428001613940105efc1aff78457e6f4fa9ec4e2.png',
    root: STATIC,
    out: 'cases/prokladovki/cover.webp',
    width: 1456,
    height: 1165,
  },
  {
    src: 'c345934c8441d8cbde4b1b1b133be3a83c9ea739.png',
    root: STATIC,
    out: 'cases/askezio/cover.webp',
    width: 1456,
    height: 1165,
  },
  {
    src: 'aadf5171ed67f428d6ffb7d7c81eb94335b22dc4.png',
    root: STATIC,
    out: 'cases/supply-leader/cover.webp',
    width: 1456,
    height: 1165,
  },
  // Главная, карточки: mobile 370×370 → 2×.
  {
    src: 'b281e511df12cc35a05407a00bd3856d3d497d98.png',
    root: STATIC,
    out: 'cases/prokladovki/cover-mobile.webp',
    width: 740,
    height: 740,
  },
  {
    src: '7807b13a3de6046c3af2677e6e4534c8389195e9.png',
    root: STATIC,
    out: 'cases/askezio/cover-mobile.webp',
    width: 740,
    height: 740,
  },
  {
    src: '1a836a40ede183ab978f6546ec6cd00f828fb337.png',
    root: STATIC,
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

// Кейс Askezio (design/pages/work-askezio-*.md).
manifest.push(
  // Первый экран и «relationship»: два квадрата 592 (desktop) → 2×.
  ...square('cases/askezio/hero', 1184, [
    '852940fe138248b3489f2c48aa6bf29063329f8e.png',
    '73a2e80d584d3be9c7a1c5b8e035547ab53da968.png',
  ]),
  ...square('cases/askezio/relationship', 1184, [
    '78794b893d80ab34c885b531eb9ddbfeaf7e14dd.png',
    '5688fe17ab00b6c096d759466bf99beddb162340.png',
  ]),
  // Широкая картинка 1200×700 (12:7) → 2×.
  {
    src: 'd34d798459c5b18154b3112ff3c0a5d69a7519a6.png',
    out: 'cases/askezio/challenges.webp',
    width: 2400,
    height: 1400,
  },
  // Approach / Reflection: 590 (desktop), 728 (tablet) → 2× от 728.
  ...square('cases/askezio/approach', 1456, ['a0a706087855afccd11417617839649562b8d5fb.png']),
  ...square('cases/askezio/reflection', 1456, ['0b31ed9709fd7ace6b4add87e38cf485197cc1bd.png']),
);

// Кейс Prokladovki (design/pages/work-prokladovki-*.md). На mobile у большинства картинок свои кропы.
const wide = (out, src, height = 1200) => ({ src, out, width: 2400, height });
const portrait = (out, src) => ({ src, out, width: 740, height: 1200 }); // mobile 370×600
manifest.push(
  wide('cases/prokladovki/hero.webp', 'e1b1c87aec3c3277656336369b4e26e30f2e5aa5.png'),
  ...square('cases/prokladovki/hero-mobile', 740, ['b281e511df12cc35a05407a00bd3856d3d497d98.png']),
  wide('cases/prokladovki/learning.webp', '4534c89589779fcd6e7d1825103a1954dbd71b8d.png'),
  portrait(
    'cases/prokladovki/learning-mobile.webp',
    'acfeae945c1a6ed4ce5f11f20736f05958285621.png',
  ),
  wide('cases/prokladovki/mapping.webp', '021d6466fac588ff1da4aa7019c90be277691611.png'),
  ...square('cases/prokladovki/mapping-mobile', 740, [
    '7a7229cf49d99beadc44dea795a65564722979fe.png',
    'b77612538c4617bfe715f10a32cea9271be5731e.png',
  ]),
  // Таблица приоритизации: 1200×400 (3:1), на mobile та же картинка.
  wide(
    'cases/prokladovki/prioritization.webp',
    'f5ac89b9566e24bd0f8ac036f7dba2c85c78898e.png',
    800,
  ),
  wide('cases/prokladovki/stage-1.webp', '7e888183b4cef6ac95369202624b03e4edf12153.png'),
  wide('cases/prokladovki/stage-2.webp', 'c6fe8da7588f10d7b617389dadf5009a0173098b.png'),
  wide('cases/prokladovki/stage-3.webp', '5064e3db8fdd04f3c261cf95807c09e9c99d405b.png'),
  // stage-4: 1200×710 → 2×.
  wide('cases/prokladovki/stage-4.webp', 'e02990677645daa192cfd31ee9687d5b2ad6ceda.png', 1420),
  portrait('cases/prokladovki/stage-1-mobile.webp', 'a69d4137afdb7194decbfd8de37b17c44e910e78.png'),
  portrait('cases/prokladovki/stage-2-mobile.webp', 'e2f6f894e87ac36ade48f64c559cacbcfb4455f1.png'),
  portrait('cases/prokladovki/stage-3-mobile.webp', '442a3fdedfa7db1b26e718fa60ba9c1f3351837c.png'),
  portrait('cases/prokladovki/stage-4-mobile.webp', '3379149408a662cb62cbf4ac4b5d10a99ff4b3aa.png'),
);

// Open Graph: 1200×630 JPEG. Лежат в public/og — вне папки оптимизатора, поэтому сжимаются один раз здесь.
const OG_OUT = 'public/og';
const ogManifest = [
  { src: 'aadf5171ed67f428d6ffb7d7c81eb94335b22dc4.png', out: 'supply-leader.jpg' },
  { src: 'c345934c8441d8cbde4b1b1b133be3a83c9ea739.png', out: 'askezio.jpg' },
  { src: 'c428001613940105efc1aff78457e6f4fa9ec4e2.png', out: 'prokladovki.jpg' },
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

for (const { src, root = OUT, out, width, height } of manifest) {
  await render(src, join(root, out), width, height, (img) =>
    img.webp({ lossless: true, effort: 6 }),
  );
}

for (const { src, out } of ogManifest) {
  await render(src, join(OG_OUT, out), 1200, 630, (img) =>
    img.flatten({ background: '#ffffff' }).jpeg({ quality: 85, mozjpeg: true }),
  );
}
