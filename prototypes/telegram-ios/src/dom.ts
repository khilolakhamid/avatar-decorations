/** Tiny DOM helper: creates an element with classes, attributes and children. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: {
    className?: string;
    attrs?: Record<string, string>;
    text?: string;
    html?: string;
    style?: Partial<Record<string, string>>;
  } = {},
  children: (Node | null | undefined)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  for (const [name, value] of Object.entries(options.attrs ?? {})) node.setAttribute(name, value);
  if (options.text !== undefined) node.textContent = options.text;
  if (options.html !== undefined) node.innerHTML = options.html;
  for (const [name, value] of Object.entries(options.style ?? {})) {
    if (value !== undefined) node.style.setProperty(name, value);
  }
  for (const child of children) if (child) node.append(child);
  return node;
}

/** Wraps inline SVG markup in a span so it can be positioned and coloured from CSS. */
export function icon(markup: string, className: string): HTMLSpanElement {
  return el('span', { className: `icon ${className}`, html: markup, attrs: { 'aria-hidden': 'true' } });
}
