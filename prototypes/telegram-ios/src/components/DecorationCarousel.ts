import { el } from '../dom';
import { decorationSizeFor, type DecorationEntry, type DecorationInstance } from '../decor/catalog';

/**
 * Infinite decoration carousel around the avatar (reference frames 1–4).
 *
 * ONE number describes the whole carousel: `pos`, the position of the track
 * in catalogue items (fractional while moving). Catalogue item k (an integer
 * that grows without limit; the entry is items[k mod n]) is drawn at the
 * relative place u = k − pos:
 *
 *        u = −2          −1               0              +1          +2
 *     beyond left ← left preview ← on the avatar → right preview → beyond right
 *
 * The pose (centre and scale of the decoration's canvas) is interpolated
 * linearly between those five anchor poses, so every element moves and
 * scales continuously with the finger; nothing is swapped mid-move. A swipe
 * to the left moves `pos` towards +1, a swipe to the right towards −1. When a
 * gesture ends `pos` glides to an integer: the next/previous item, or back.
 * The selected item is items[round(pos) mod n].
 *
 * The carousel knows nothing about particular decorations: everything comes
 * from the catalogue entry (photo circle, visible extent, preview size,
 * kind). It works for any number of entries (tests use 6 stubs).
 *
 * Instances: one per visible place (|u| < 2), keyed by k, created when a
 * place becomes visible and destroyed as soon as it leaves — at rest at most
 * three (left, avatar, right), during a move at most four.
 */
const CANVAS_HALF = 256;
const SETTLE_MS = 380;
const COMMIT = 0.4; // share of the way that commits a slow swipe

export interface CarouselOptions {
  /** Catalogue in carousel order (swipe left = next). */
  items: DecorationEntry[];
  /** The purple preview card: decorations are drawn in it, swipes are read on it. */
  host: HTMLElement;
  /** Avatar box (photo); its centre is the centre place. */
  avatarElement: HTMLElement;
  /** Layer above the photo: gets data-decoration = id of the selected item. */
  avatarLayer: HTMLElement;
  photoDiameter: number;
  /**
   * Side slot size, pt — ONE size for every decoration: each one's whole
   * animation (its measured visible extent) is fitted into this square,
   * proportions kept. The active slot is the avatar photo itself.
   */
  previewSlotSize: number;
  /** Gap around a side preview inside its box, pt. */
  gutter: number;
  /** Index of the item selected first (default 0). */
  initial?: number;
  onChange?: (index: number, entry: DecorationEntry) => void;
}

export interface CarouselHandle {
  /** Focus / hit box of the right preview. */
  element: HTMLElement;
  /** Selected catalogue index (0 … n−1). */
  readonly index: number;
  /** Track position (fractional while moving). */
  readonly position: number;
  /** Preview selection: id of the item nearest to the avatar right now. */
  previewId(): string;
  /** Side slot size, pt, after the narrow-screen fit. */
  readonly slotSize: number;
  next(): void;
  prev(): void;
  /** Running decoration animations (None is not an animation). */
  liveCount(): number;
  /** Mounted places, None included. */
  placeCount(): number;
  destroy(): void;
}

interface Pose {
  x: number; // canvas centre, host px
  y: number;
  k: number; // canvas units → host px
}

interface Place {
  k: number;
  entry: DecorationEntry;
  holder: HTMLElement;
  instance: DecorationInstance;
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const mix = (a: Pose, b: Pose, t: number): Pose => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), k: lerp(a.k, b.k, t) });

export function DecorationCarousel(options: CarouselOptions): CarouselHandle {
  const { items, host, avatarElement, avatarLayer, photoDiameter, previewSlotSize, gutter } = options;
  const n = items.length;
  if (n === 0) throw new Error('DecorationCarousel: empty catalogue');
  const boxSize = previewSlotSize + gutter * 2;
  const entryAt = (k: number): DecorationEntry => items[((k % n) + n) % n];

  const stage = el('div', { className: 'deco-stage', attrs: { 'aria-hidden': 'true' } });
  stage.style.visibility = 'hidden'; // until the first layout pass
  avatarElement.after(stage);

  const live = el('span', { className: 'visually-hidden', attrs: { 'aria-live': 'polite' } });
  const element = el(
    'div',
    {
      className: 'deco-carousel',
      attrs: { tabindex: '0', role: 'group', 'aria-roledescription': 'carousel', 'aria-label': 'Avatar decorations' },
    },
    [live],
  );

  // ── Geometry: three places + two beyond the card edges ──
  let geo = { ax: 0, ay: 0, rx: 0, lx: 0, scale: 1, width: 0 };
  function fit(): void {
    if (!host.clientWidth) return;
    const ax = avatarElement.offsetLeft + avatarElement.offsetWidth / 2;
    const ay = avatarElement.offsetTop + avatarElement.offsetHeight / 2;
    const width = host.clientWidth;
    // Each side box starts 63 pt from the avatar centre and must end 6 pt
    // before the card edge; on narrow phones both are scaled down alike.
    const room = Math.min(width - 6 - (ax + 63), ax - 63 - 6);
    const scale = clamp(room / boxSize, 0.5, 1);
    const half = (boxSize / 2) * scale;
    geo = { ax, ay, rx: ax + 63 + half, lx: ax - 63 - half, scale, width };
    element.style.left = `${ax + 63}px`;
    element.style.width = element.style.height = `${boxSize}px`;
    element.style.top = `${ay - boxSize / 2}px`;
    element.style.transform = scale < 1 ? `scale(${scale.toFixed(4)})` : '';
    element.dataset.scale = scale.toFixed(3);
    stage.style.visibility = '';
    draw();
  }

  /** The decoration's photo circle on the avatar photo. */
  function avatarPose(e: DecorationEntry): Pose {
    const k = decorationSizeFor(e, photoDiameter) / e.canvas;
    const { cx, cy } = e.avatarArea;
    const off = e.avatarOffset ?? { x: 0, y: 0 };
    return { x: geo.ax - (cx - CANVAS_HALF + off.x) * k, y: geo.ay - (cy - CANVAS_HALF + off.y) * k, k };
  }
  /**
   * Side slot: the visible extent of the whole animation fitted into the one
   * shared slot size (largest side = slot), centred in the slot (x = slot centre).
   * `previewFill` (default 1) is relative to the slot, so it follows any slot size.
   */
  function sidePose(e: DecorationEntry, x: number): Pose {
    const [x0, y0, x1, y1] = e.ink;
    const k = (previewSlotSize * (e.previewFill ?? 1) * geo.scale) / Math.max(x1 - x0, y1 - y0);
    return { x: x - ((x0 + x1) / 2 - CANVAS_HALF) * k, y: geo.ay - ((y0 + y1) / 2 - CANVAS_HALF) * k, k };
  }
  /** Pose at place u (−2 … 2), linear between the anchors. */
  function poseAt(e: DecorationEntry, u: number): Pose {
    const left = sidePose(e, geo.lx);
    const right = sidePose(e, geo.rx);
    const centre = avatarPose(e);
    if (u <= -1) return mix({ ...left, x: left.x - (geo.ax - geo.lx) }, left, u + 2);
    if (u <= 0) return mix(left, centre, u + 1);
    if (u <= 1) return mix(centre, right, u);
    return mix(right, { ...right, x: right.x + (geo.rx - geo.ax) }, u - 1);
  }
  function opacityAt(e: DecorationEntry, u: number): number {
    const a = Math.abs(u);
    let o = clamp((2 - a) / 0.4, 0, 1); // fades out beyond the card edges
    if (e.kind === 'none') o *= clamp(a / 0.6, 0, 1); // None draws nothing on the avatar
    return o;
  }

  // ── Places ──
  const places = new Map<number, Place>();
  function mount(k: number): Place {
    const entry = entryAt(k);
    const holder = el('div', { className: 'deco-holder', attrs: { 'data-decoration': entry.id, 'data-kind': entry.kind } });
    stage.append(holder);
    const instance = entry.mount(holder, entry.canvas);
    const place = { k, entry, holder, instance };
    places.set(k, place);
    return place;
  }
  function unmount(place: Place): void {
    place.instance.destroy();
    place.holder.remove();
    places.delete(place.k);
  }

  let pos = ((options.initial ?? 0) % n + n) % n;

  function draw(): void {
    // Visible places: |k − pos| < 2.
    const lo = Math.floor(pos - 2) + 1;
    const hi = Math.ceil(pos + 2) - 1;
    for (const place of [...places.values()]) if (place.k < lo || place.k > hi) unmount(place);
    for (let k = lo; k <= hi; k++) {
      const place = places.get(k) ?? mount(k);
      const u = k - pos;
      const p = poseAt(place.entry, u);
      const o = opacityAt(place.entry, u);
      const s = place.holder.style;
      s.transform = `translate(${(p.x - CANVAS_HALF * p.k).toFixed(2)}px, ${(p.y - CANVAS_HALF * p.k).toFixed(2)}px) scale(${p.k.toFixed(5)})`;
      s.opacity = o.toFixed(3);
      s.visibility = o <= 0.001 ? 'hidden' : '';
      const role = Math.abs(u) < 0.5 ? 'worn' : u <= -0.5 && u > -1.5 ? 'left' : u >= 0.5 && u < 1.5 ? 'right' : 'beyond';
      place.holder.dataset.role = role;
    }
  }

  let selected = Math.round(pos);
  function announce(): void {
    const e = entryAt(selected);
    avatarLayer.dataset.decoration = e.id;
    live.textContent = `${e.name}. Previous: ${entryAt(selected - 1).name}. Next: ${entryAt(selected + 1).name}.`;
  }

  // ── Motion ──
  let anim = 0;
  let target = selected;
  function glideTo(to: number): void {
    target = to;
    cancelAnimationFrame(anim);
    const from = pos;
    const duration = Math.max(140, SETTLE_MS * Math.min(1.5, Math.abs(to - from)));
    const t0 = performance.now();
    const ease = (t: number): number => 1 - Math.pow(1 - t, 3);
    const tick = (now: number): void => {
      const t = Math.min(1, (now - t0) / duration);
      pos = lerp(from, to, ease(t));
      draw();
      if (t < 1) {
        anim = requestAnimationFrame(tick);
        return;
      }
      anim = 0;
      pos = to;
      draw();
      if (selected !== to) {
        selected = to;
        announce();
        options.onChange?.(((to % n) + n) % n, entryAt(to));
      }
    };
    anim = requestAnimationFrame(tick);
  }
  const moving = (): boolean => anim !== 0;

  /** One step; repeated quickly it queues (target moves on, no jumps). */
  function step(dir: -1 | 1): void {
    if (drag) return;
    const base = moving() ? target : Math.round(pos);
    // At most one item ahead of where the track is now.
    const to = clamp(base + dir, Math.floor(pos) - 1, Math.ceil(pos) + 1);
    glideTo(to);
  }

  // ── Pointer: drag anywhere on the card; everything follows the finger ──
  let drag: { x: number; y: number; t: number; id: number; from: number; base: number; active: boolean } | null = null;
  const zoom = (): number => host.getBoundingClientRect().width / host.offsetWidth || 1;
  const travel = (): number => geo.rx - geo.ax;

  host.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // Catch the track where it is, even mid-glide (fast repeated swipes).
    cancelAnimationFrame(anim);
    anim = 0;
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, from: pos, base: Math.round(pos), active: false };
  });
  host.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = (e.clientX - drag.x) / zoom();
    const dy = (e.clientY - drag.y) / zoom();
    if (!drag.active) {
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
      drag.active = true;
      host.setPointerCapture(e.pointerId);
    }
    pos = clamp(drag.from - dx / travel(), drag.base - 1, drag.base + 1);
    draw();
  });
  const end = (e: PointerEvent): void => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    if (!d.active) {
      // A tap on a side preview selects it.
      const r = host.getBoundingClientRect();
      const x = (e.clientX - r.left) / zoom();
      const y = (e.clientY - r.top) / zoom();
      const half = (boxSize / 2) * geo.scale;
      const inBox = (cx: number): boolean => Math.abs(x - cx) <= half && Math.abs(y - geo.ay) <= half;
      if (inBox(geo.rx)) return glideTo(d.base + 1);
      if (inBox(geo.lx)) return glideTo(d.base - 1);
      if (pos !== Math.round(pos)) glideTo(Math.round(pos));
      return;
    }
    const delta = pos - d.base;
    const speed = Math.abs(e.clientX - d.x) / zoom() / Math.max(1, performance.now() - d.t);
    const go = Math.abs(delta) > COMMIT || (speed > 0.5 && Math.abs(delta) > 0.08);
    glideTo(go ? d.base + Math.sign(delta) : d.base);
  };
  host.addEventListener('pointerup', end);
  host.addEventListener('pointercancel', end);

  // Trackpad / horizontal wheel: one step per gesture (fingers to the left = next).
  let wheelAcc = 0;
  let wheelTimer = 0;
  host.addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      wheelAcc += e.deltaX;
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => (wheelAcc = 0), 220);
      if (Math.abs(wheelAcc) > 40) {
        step(wheelAcc > 0 ? 1 : -1);
        wheelAcc = -1e6 * Math.sign(wheelAcc);
      }
    },
    { passive: false },
  );

  // Keys: ← brings the right one onto the avatar (like a swipe to the left), → the left one.
  element.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(1);
    else if (e.key === 'ArrowRight') step(-1);
    else return;
    e.preventDefault();
  });

  announce();
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
  ro?.observe(host);
  requestAnimationFrame(fit);

  return {
    element,
    get index() {
      return ((selected % n) + n) % n;
    },
    get position() {
      return pos;
    },
    previewId: () => entryAt(Math.round(pos)).id,
    get slotSize() {
      return previewSlotSize * geo.scale;
    },
    next: () => step(1),
    prev: () => step(-1),
    liveCount: () => [...places.values()].filter((p) => p.entry.kind !== 'none').length,
    placeCount: () => places.size,
    destroy() {
      cancelAnimationFrame(anim);
      anim = 0;
      ro?.disconnect();
      for (const place of [...places.values()]) unmount(place);
      stage.remove();
      delete avatarLayer.dataset.decoration;
    },
  };
}
