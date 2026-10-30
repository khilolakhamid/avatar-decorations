/** Images used only by the demo page are imported as data URLs. */
declare module '*.jpg' {
  const url: string;
  export default url;
}

declare module '*.png' {
  const url: string;
  export default url;
}
