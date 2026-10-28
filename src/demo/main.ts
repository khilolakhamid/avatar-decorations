/**
 * Demo page. Uses ONLY the public interface of the decoration — the same
 * way any other project would. The grey avatar circle, the reference
 * overlay and all controls live here and never inside the decoration.
 */
import {
  mountHalloweenPumpkin,
  AVATAR_AREA,
  CANVAS_SIZE,
  FPS,
  type HalloweenPumpkinDecoration,
} from '../decorations/halloween-pumpkin';
import referenceUrl from '../../reference/composition-reference.jpg';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
let decorations: HalloweenPumpkinDecoration[] = [];
const holders: HTMLElement[] = [];
let speed = 1;
let bigSvg: SVGSVGElement;
let allTop: SVGGElement[] = [];

/** One preview: grey avatar circle (demo only) + the decoration on top. */
function buildPreview(box: HTMLElement, sizePx: number) {
  const pct = (v: number) => `${(v / CANVAS_SIZE) * 100}%`;
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  Object.assign(avatar.style, {
    left: pct(AVATAR_AREA.cx - AVATAR_AREA.r),
    top: pct(AVATAR_AREA.cy - AVATAR_AREA.r),
    width: pct(AVATAR_AREA.r * 2),
    height: pct(AVATAR_AREA.r * 2),
  });
  const holder = document.createElement('div');
  holder.className = 'deco';
  box.append(avatar, holder);
  box.style.width = `${sizePx}px`;
  holders.push(holder);
}

/** (Re)creates every decoration, keeping frame, speed and play state. */
function mountAll() {
  const frame = decorations[0]?.frame ?? 0;
  const playing = decorations[0]?.isPlaying ?? true;
  decorations.forEach((d) => d.destroy());
  decorations = holders.map((h) => mountHalloweenPumpkin(h, { size: '100%', autoplay: false }));
  decorations.forEach((d) => {
    d.setSpeed(speed);
    d.seek(frame);
    if (playing) d.play();
  });
  bindLayerHighlight();
}

// big true-size preview + reference overlay
const big = $('big');
buildPreview(big, CANVAS_SIZE);
const ref = document.createElement('img');
ref.className = 'ref';
ref.src = referenceUrl;
ref.alt = 'Референс композиции';
ref.hidden = true;
big.append(ref);

// smaller sizes at real pixel size
const sizes = $('sizes');
for (const s of [256, 128, 64]) {
  const fig = document.createElement('figure');
  const box = document.createElement('div');
  box.className = 'preview';
  const cap = document.createElement('figcaption');
  cap.className = 'px';
  cap.textContent = `${s} × ${s}`;
  fig.append(box, cap);
  sizes.append(fig);
  buildPreview(box, s);
}

mountAll();

// actual rendered size of the big preview (shrinks on narrow screens)
const bigPx = $('big-px');
new ResizeObserver(() => {
  const w = Math.round(big.getBoundingClientRect().width);
  bigPx.textContent = w === CANVAS_SIZE ? '512 × 512' : `512 × 512 · сейчас показано ${w} px`;
}).observe(big);

// background switch
const grounds = document.querySelectorAll<HTMLElement>('.ground');
document.querySelectorAll<HTMLButtonElement>('#bg-seg button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#bg-seg button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    grounds.forEach((g) => (g.dataset.bg = btn.dataset.bg));
  });
});

// grey avatar on/off
$<HTMLInputElement>('opt-avatar').addEventListener('change', (e) => {
  const on = (e.target as HTMLInputElement).checked;
  document.querySelectorAll<HTMLElement>('.avatar').forEach((a) => (a.hidden = !on));
});

// reference overlay
const refToggle = $<HTMLInputElement>('opt-ref');
const refOpacity = $<HTMLInputElement>('ref-opacity');
const applyRef = () => {
  ref.hidden = !refToggle.checked;
  refOpacity.disabled = !refToggle.checked;
  ref.style.opacity = String(Number(refOpacity.value) / 100);
};
refToggle.addEventListener('change', applyRef);
refOpacity.addEventListener('input', applyRef);
applyRef();

// ---------- playback (demo controls only) ----------
const playBtn = $<HTMLButtonElement>('play-toggle');
const scrub = $<HTMLInputElement>('scrub');
const readout = $('readout');
const syncPlayButton = () => (playBtn.textContent = decorations[0].isPlaying ? 'Пауза' : 'Продолжить');
const setPlaying = (on: boolean) => {
  const f = decorations[0].frame;
  decorations.forEach((d) => {
    d.seek(f); // keep all sizes on the same frame
    on ? d.play() : d.pause();
  });
  syncPlayButton();
};
playBtn.addEventListener('click', () => setPlaying(!decorations[0].isPlaying));

document.querySelectorAll<HTMLButtonElement>('#speed-seg button').forEach((btn) => {
  btn.addEventListener('click', () => {
    speed = Number(btn.dataset.speed);
    document.querySelectorAll('#speed-seg button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    decorations.forEach((d) => d.setSpeed(speed));
  });
});

scrub.addEventListener('input', () => {
  setPlaying(false);
  decorations.forEach((d) => d.seek(Number(scrub.value)));
});

const fmt = (f: number) => `кадр ${Math.floor(f)} · ${(f / FPS).toFixed(2).replace('.', ',')} с`;
(function updateReadout() {
  const f = decorations[0].frame;
  if (decorations[0].isPlaying) scrub.value = String(Math.floor(f));
  readout.textContent = fmt(f);
  requestAnimationFrame(updateReadout);
})();

// jump to a moment of the loop
document.querySelectorAll<HTMLButtonElement>('[data-jump]').forEach((btn) => {
  btn.addEventListener('click', () => {
    setPlaying(false);
    const f = Number(btn.dataset.jump);
    decorations.forEach((d) => d.seek(f));
    scrub.value = String(f);
  });
});

// layer list with highlight on hover (big preview only)
const LAYERS: [string, string][] = [
  ['leaf_2', 'второй лист'],
  ['leaf_1', 'первый лист'],
  ['pumpkin', 'большая тыква'],
  ['plant', 'переднее растение'],
  ['mini pumpkin', 'шапочка'],
  ['tail', 'хвостик шапочки'],
  ['bat-1', 'мышь 1 · bat_head + крылья'],
  ['bat-2', 'мышь 2 · те же векторы'],
];
function bindLayerHighlight() {
  bigSvg = decorations[0].element;
  allTop = Array.from(bigSvg.querySelectorAll<SVGGElement>(':scope > [data-layer]'));
}
bindLayerHighlight();
const layerEls = (name: string) => Array.from(bigSvg.querySelectorAll<SVGGElement>(`[data-layer="${name}"]`));
const list = $('layers');
for (const [name, desc] of LAYERS) {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = `<code>${name}</code><small>${desc}</small>`;
  const on = () => {
    const targets = layerEls(name);
    // a nested layer (tail) keeps its parent visible but dims the parent's own art
    allTop.forEach((g) => (g.style.opacity = targets.some((t) => g.contains(t)) ? '1' : '0.12'));
    if (name === 'tail') {
      const cap = bigSvg.querySelector<SVGGElement>('[data-part="miniPumpkin"]')!;
      Array.from(cap.children).forEach((c) => {
        if (!(c as Element).matches('[data-layer="tail"]')) (c as SVGElement).style.opacity = '0.12';
      });
    }
  };
  const off = () => {
    allTop.forEach((g) => (g.style.opacity = ''));
    bigSvg.querySelectorAll<SVGElement>('[data-part="miniPumpkin"] > *').forEach((c) => (c.style.opacity = ''));
  };
  b.addEventListener('mouseenter', on);
  b.addEventListener('focus', on);
  b.addEventListener('mouseleave', off);
  b.addEventListener('blur', off);
  li.append(b);
  list.append(li);
}

// avatar area numbers
$('area-c').textContent = `${AVATAR_AREA.cx}, ${AVATAR_AREA.cy}`;
$('area-d').textContent = `${AVATAR_AREA.r * 2} px из ${CANVAS_SIZE}`;
$('area-p').textContent = `${((AVATAR_AREA.r * 2) / CANVAS_SIZE * 100).toFixed(1)} % ширины`;
