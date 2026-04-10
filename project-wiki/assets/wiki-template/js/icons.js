// icons.js — sprite is inlined into index.html at build time by render.py.
// We just emit <use> references. Sprite + helper finalized in Task 35.

export function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
}
