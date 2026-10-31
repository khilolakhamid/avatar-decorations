// SVG files are imported as their markup text (inlined, so icons can take
// their colour from CSS through `currentColor`). PNG files are imported as a
// URL to the copied file.
declare module '*.svg' {
  const markup: string;
  export default markup;
}

// Stylesheets are bundled by esbuild into dist/main.css.
declare module '*.css';

declare module '*.png' {
  const url: string;
  export default url;
}
