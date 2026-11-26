// Типографика: неразрывные пробелы, чтобы короткие слова не висели в конце строки.
// Применяется автоматически ко всем текстам сайта (messages, content/*.ts, MDX кейсов),
// поэтому в исходниках можно писать обычные пробелы.
// Модуль на чистом JS: его импортирует и TS-код, и remark-плагин MDX (src/lib/remark-typograph.mjs).

const NBSP = ' ';

// Предлоги, союзы, артикли и частицы, которые привязываются к следующему слову.
const SHORT_WORDS = [
  // EN
  'a',
  'an',
  'the',
  'of',
  'in',
  'on',
  'at',
  'to',
  'by',
  'for',
  'with',
  'and',
  'or',
  'nor',
  'but',
  'so',
  'if',
  'as',
  'from',
  'into',
  'via',
  'per',
  'I',
  'my',
  'our',
  'we',
  'no',
  'not',
  // RU
  'а',
  'и',
  'в',
  'во',
  'с',
  'со',
  'к',
  'ко',
  'о',
  'об',
  'обо',
  'у',
  'я',
  'на',
  'по',
  'за',
  'из',
  'от',
  'до',
  'не',
  'ни',
  'но',
  'да',
  'для',
  'без',
  'под',
  'над',
  'при',
  'про',
  'что',
  'как',
  'или',
];

// Слово стоит в начале строки или после пробела / открывающей скобки / кавычки / тире / тега.
const BEFORE = String.raw`(?<=^|[\s(\[«“„"'—–>])`;

const shortWordRe = new RegExp(`${BEFORE}(${SHORT_WORDS.join('|')})[ \\t]+(?=\\S)`, 'giu');
// Число и следующее за ним слово: «4 years», «65+ экранов», «40 проектов».
const numberRe = new RegExp(`${BEFORE}(\\d[\\d.,]*[+%×]?)[ \\t]+(?=\\p{L})`, 'gu');
// Тире не переносится в начало строки: «Анастасия — продуктовый».
const dashRe = /[ \t]+([—–-])(?=[ \t])/g;
// Дефис внутри слова («дизайн-ревью», «self-storage», «e-commerce») → неразрывный дефис U+2011:
// браузер не переносит слово по дефису. В Inter глиф выглядит так же, как обычный дефис.
const NB_HYPHEN = '‑';
const wordHyphenRe = /(?<=[\p{L}\d])-(?=[\p{L}\d])/gu;
// Последний пробел в тексте: два последних слова не разрываются, чтобы на последней строке
// не оставалось одно слово (вместе с привязанным предлогом выходит три).
const lastSpaceRe = /[ \t]+(?=(\S+)\s*$)/;
// Не склеиваем слишком длинную концовку (считая уже привязанные слова): если она не влезает
// в строку, браузер рвёт её посреди слова. Обычный текст (16px) на mobile 360 вмещает ~40 символов.
// В заголовках концовку не склеиваем вовсе: крупный шрифт, склейка не влезла бы в строку.
// Висячие слова в заголовках убирает CSS `text-wrap: balance` (src/styles/globals.css).
const MAX_TAIL = { text: 30, heading: 0 };

/**
 * Расставляет неразрывные пробелы в строке.
 * @param {string} text
 * @param {'text' | 'heading'} [kind] заголовок — короче допустимая склеенная концовка
 * @returns {string}
 */
export function typograph(text, kind = 'text') {
  // Строки без пробелов (slug, пути, id, одиночные слова) и без букв («2 / 1») не трогаем.
  if (!/\s/.test(text) || !/\p{L}/u.test(text)) return text;
  const result = text
    .replace(wordHyphenRe, NB_HYPHEN)
    .replace(dashRe, `${NBSP}$1`)
    .replace(numberRe, `$1${NBSP}`)
    .replace(shortWordRe, `$1${NBSP}`);
  return bindLastWords(result, MAX_TAIL[kind]);
}

/**
 * Неразрывный пробел перед последним словом (без висячего слова на последней строке).
 * @param {string} text
 * @param {number} maxTail
 * @returns {string}
 */
function bindLastWords(text, maxTail) {
  const match = lastSpaceRe.exec(text);
  if (!match) return text;
  // Предпоследнее «слово» вместе с уже привязанными к нему через NBSP соседями.
  const before = text.slice(0, match.index);
  const prevChain = /[^ \t\r\n]+$/.exec(before)?.[0] ?? '';
  if (!prevChain || prevChain.length + 1 + match[1].length > maxTail) return text;
  return `${before}${NBSP}${text.slice(match.index + match[0].length)}`;
}

/** Ключ/проп с заголовком: title, metaTitle, … (но не subtitle — это обычный текст). */
export const isTitleKey = (/** @type {string | undefined} */ key) =>
  Boolean(key && /^title$|[a-z]Title$/.test(key) && key !== 'subtitle');

/**
 * typograph() для всех строк внутри массивов и простых объектов (тексты из content/*.ts, messages).
 * Строки под ключом *title* считаются заголовками.
 * @template T
 * @param {T} value
 * @param {string} [key]
 * @returns {T}
 */
export function typographDeep(value, key) {
  if (typeof value === 'string') {
    return /** @type {T} */ (typograph(value, isTitleKey(key) ? 'heading' : 'text'));
  }
  if (Array.isArray(value)) return /** @type {T} */ (value.map((v) => typographDeep(v, key)));
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return /** @type {T} */ (
      // Вложенные ключи ({ title: { en, ru } }) наследуют «заголовочность» родителя.
      Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, typographDeep(v, isTitleKey(key) ? key : k)]),
      )
    );
  }
  return value;
}
