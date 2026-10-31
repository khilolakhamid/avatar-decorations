/**
 * Selected profile colour (shared app state): the index of the swatch in the
 * user's palette (Icons_Container.svg, row by row). Default: the first, blue
 * swatch. Kept in localStorage so it survives navigation and reloads; a
 * missing / broken value or blocked storage falls back to the default.
 */
export const PROFILE_COLOR_KEY = 'tg-prototype:profile-color';
/** Blue — first swatch, first row (also what Reset Profile Color returns to). */
export const DEFAULT_SWATCH = 0;
const SWATCH_COUNT = 16;

function load(): number {
  try {
    const raw = window.localStorage.getItem(PROFILE_COLOR_KEY);
    const n = raw === null ? NaN : Number(raw);
    return Number.isInteger(n) && n >= 0 && n < SWATCH_COUNT ? n : DEFAULT_SWATCH;
  } catch {
    return DEFAULT_SWATCH;
  }
}

let selected = load();
const events = new EventTarget();

export const profileColor = {
  get swatch(): number {
    return selected;
  },
  select(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= SWATCH_COUNT) return;
    const changed = index !== selected;
    selected = index;
    try {
      window.localStorage.setItem(PROFILE_COLOR_KEY, String(index));
    } catch {
      /* kept for this session only */
    }
    if (changed) events.dispatchEvent(new Event('change'));
  },
  /** Called after the selected colour changes; returns an unsubscribe function. */
  subscribe(fn: (index: number) => void): () => void {
    const handler = (): void => fn(selected);
    events.addEventListener('change', handler);
    return () => events.removeEventListener('change', handler);
  },
};
