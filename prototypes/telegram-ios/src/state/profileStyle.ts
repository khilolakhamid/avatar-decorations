import { DECORATIONS } from '../decor/catalog';

/**
 * Applied profile style (shared app state).
 *
 * Two states are kept apart:
 *   • preview selection — whatever the Your Color carousel shows right now
 *     (lives in the carousel only, never stored);
 *   • applied selection — the decoration confirmed with Apply Style. Stored
 *     here by its stable catalogue id ('none' = no decoration), persisted in
 *     localStorage and restored on start.
 *
 * Only the id is stored; screens render it with the catalogue's own mount().
 */
export const STORAGE_KEY = 'tg-prototype:applied-decoration';
export const NONE_ID = 'none';

const known = (id: string | null): id is string => !!id && DECORATIONS.some((d) => d.id === id);

function load(): string {
  try {
    const id = window.localStorage.getItem(STORAGE_KEY);
    return known(id) ? id : NONE_ID; // unknown / removed ids fall back to none
  } catch {
    return NONE_ID; // storage blocked (private mode, sandbox): start without a decoration
  }
}

let applied = load();
const events = new EventTarget();

export const profileStyle = {
  /** Id of the applied decoration ('none' when there is none). */
  get decoration(): string {
    return applied;
  },
  /** Confirm a decoration (Apply Style). Unknown ids are ignored. */
  apply(id: string): void {
    if (!known(id)) return;
    applied = id;
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* not persisted, but still applied for this session */
    }
    events.dispatchEvent(new CustomEvent('change', { detail: id }));
  },
  /** Called with the new id after every apply; returns an unsubscribe function. */
  subscribe(fn: (id: string) => void): () => void {
    const handler = (e: Event): void => fn((e as CustomEvent<string>).detail);
    events.addEventListener('change', handler);
    return () => events.removeEventListener('change', handler);
  },
};
