// remark-плагин для MDX кейсов: typograph() для текста и строковых пропсов компонентов
// (title="…", items={['…']} и т. п.). Подключён в next.config.ts строкой — так требует Turbopack.
// Заголовки (## …, пропсы и поля *title*) обрабатываются с более коротким лимитом склейки концовки.
import { isTitleKey, typograph } from './typograph.mjs';

/**
 * Строковые литералы внутри выражения пропса: {['…', '…']}, {[{ title: '…' }]}.
 * @param {any} node
 * @param {'text' | 'heading'} kind
 */
function walkEstree(node, kind) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((n) => walkEstree(n, kind));
    return;
  }
  if (node.type === 'Literal' && typeof node.value === 'string') {
    const next = typograph(node.value, kind);
    if (next !== node.value) {
      node.value = next;
      node.raw = JSON.stringify(next);
    }
    return;
  }
  // { title: '…' } внутри массива объектов — заголовок.
  if (node.type === 'Property') {
    const keyName = node.key?.name ?? node.key?.value;
    walkEstree(node.value, isTitleKey(keyName) ? 'heading' : kind);
    return;
  }
  for (const key of Object.keys(node)) {
    if (key !== 'loc' && key !== 'range') walkEstree(node[key], kind);
  }
}

/**
 * @param {any} node
 * @param {'text' | 'heading'} kind
 */
function walk(node, kind) {
  if (node.type === 'text') {
    node.value = typograph(node.value, kind);
    return;
  }
  // Код не трогаем.
  if (node.type === 'code' || node.type === 'inlineCode') return;

  if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
    for (const attr of node.attributes ?? []) {
      if (attr.type !== 'mdxJsxAttribute' || attr.value == null) continue;
      const attrKind = isTitleKey(attr.name) ? 'heading' : 'text';
      if (typeof attr.value === 'string') {
        attr.value = typograph(attr.value, attrKind);
      } else if (attr.value.data?.estree) {
        walkEstree(attr.value.data.estree, attrKind);
      }
    }
  }

  const childKind = node.type === 'heading' ? 'heading' : kind;
  for (const child of node.children ?? []) walk(child, childKind);
}

export default function remarkTypograph() {
  return (tree) => walk(tree, 'text');
}
