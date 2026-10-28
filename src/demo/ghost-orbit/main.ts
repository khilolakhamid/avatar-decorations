/**
 * Ghost Orbit demo page. Uses only the decoration's public interface.
 * The grey avatar circle and all controls live here, never inside the
 * decoration.
 */
import {
  AVATAR_AREA,
  CANVAS_SIZE,
  FACE_IN_GHOST,
  ghostLocalTransforms,
  ghostMotion,
  mountGhostOrbit,
  ORBIT,
  renderGhostOrbitSvg,
  type GhostMotion,
  type GhostOrbitDecoration,
} from '../../decorations/ghost-orbit';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const holders: HTMLElement[] = [];
let speedNow = 1;
let decorations: GhostOrbitDecoration[] = [];

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

function draw() {
  holders.forEach((h) => decorations.push(mountGhostOrbit(h, { size: '100%' })));
}

// previews
const big = $('big');
buildPreview(big, CANVAS_SIZE);
for (const s of [256, 128, 64]) {
  const fig = document.createElement('figure');
  const box = document.createElement('div');
  box.className = 'preview';
  const cap = document.createElement('figcaption');
  cap.className = 'px';
  cap.textContent = `${s} × ${s}`;
  fig.append(box, cap);
  $('sizes').append(fig);
  buildPreview(box, s);
}
draw();

new ResizeObserver(() => {
  const w = Math.round(big.getBoundingClientRect().width);
  $('big-px').textContent = w === CANVAS_SIZE ? '512 × 512' : `512 × 512 · сейчас показано ${w} px`;
}).observe(big);

// background
const grounds = document.querySelectorAll<HTMLElement>('.ground');
document.querySelectorAll<HTMLButtonElement>('#bg-seg button').forEach((btn) =>
  btn.addEventListener('click', () => {
    document.querySelectorAll('#bg-seg button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    grounds.forEach((g) => (g.dataset.bg = btn.dataset.bg));
  }),
);

// grey avatar
$<HTMLInputElement>('opt-avatar').addEventListener('change', (e) => {
  const on = (e.target as HTMLInputElement).checked;
  document.querySelectorAll<HTMLElement>('.avatar').forEach((a) => (a.hidden = !on));
});

// playback
const setPressed = (sel: string, on: Element) =>
  document.querySelectorAll(sel).forEach((b) => b.setAttribute('aria-pressed', String(b === on)));
const phaseInput = $<HTMLInputElement>('phase');
const showFrame = () => {
  const p = decorations[0].progress;
  const f = Math.round(p * 180);
  phaseInput.value = String(f);
  $('phase-out').textContent = `кадр ${f} из 180 · ${(p * 3).toFixed(2).replace('.', ',')} с`;
  if (decorations[0].isPlaying) requestAnimationFrame(showFrame);
};
$('btn-play').addEventListener('click', (e) => {
  decorations.forEach((d) => d.play());
  setPressed('#play-seg button', e.currentTarget as Element);
  requestAnimationFrame(showFrame);
});
$('btn-pause').addEventListener('click', (e) => {
  decorations.forEach((d) => d.pause());
  setPressed('#play-seg button', e.currentTarget as Element);
});
document.querySelectorAll<HTMLButtonElement>('#speed-seg button').forEach((btn) =>
  btn.addEventListener('click', () => {
    speedNow = Number(btn.dataset.speed);
    decorations.forEach((d) => d.setSpeed(speedNow));
    setPressed('#speed-seg button', btn);
  }),
);
phaseInput.addEventListener('input', () => {
  decorations.forEach((d) => {
    d.pause();
    d.seek(Number(phaseInput.value));
  });
  setPressed('#play-seg button', $('btn-pause'));
  const f = Number(phaseInput.value);
  $('phase-out').textContent = `кадр ${f} из 180 · ${((f / 180) * 3).toFixed(2).replace('.', ',')} с`;
});
requestAnimationFrame(showFrame);

// one ghost close up: same motion functions as the decoration, without the orbit
const closeDefs = (prefix: string) => renderGhostOrbitSvg(prefix).match(/<defs>[\s\S]*<\/defs>/)![0];
function closeUpSvg(prefix: string, m: GhostMotion): string {
  const t = ghostLocalTransforms(m);
  const use = (k: string) => `<g data-k="${k}" transform="${t[k as keyof typeof t]}"><use href="#${prefix}face-${k}"/></g>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-22 -18 162 172" fill="none">${closeDefs(prefix)}` +
    `<g data-k="body" transform="${t.body}"><g data-k="shape" transform="${t.shape}"><use href="#${prefix}ghost"/></g>` +
    `<g transform="translate(${FACE_IN_GHOST.x} ${FACE_IN_GHOST.y})"><g data-k="face" transform="${t.face}">` +
    `${use('mouth')}${use('eye-left')}${use('eye-right')}</g></g></g></svg>`
  );
}
const still: GhostMotion = { sway: 0, swish: 0, breath: 0, breathX: 1, breathY: 1, look: 0, mouth: 0 };
[
  ['прямо', still],
  ['влево', { ...still, look: -1 }],
  ['центр', still],
  ['вправо', { ...still, look: 1 }],
  ['«А-а-а»', { ...still, mouth: 1 }],
  ['хвост влево', { ...still, swish: -7, breath: 0.5 }],
  ['хвост вправо', { ...still, swish: 7, breath: -0.5 }],
].forEach(([label, m], i) => {
  const fig = document.createElement('figure');
  fig.innerHTML = `${closeUpSvg(`cs${i}-`, m as GhostMotion)}<figcaption>${label}</figcaption>`;
  $('close-strip').append(fig);
});
const live = $('close-live');
live.innerHTML = closeUpSvg('cl-', still);
const liveParts = new Map([...live.querySelectorAll<SVGGElement>('[data-k]')].map((g) => [g.dataset.k!, g]));
let liveTheta = ORBIT.theta0;
let liveLast: number | null = null;
const liveTick = (now: number) => {
  const d = decorations[0];
  if (d.isPlaying && liveLast !== null) liveTheta -= ((now - liveLast) / 1000) * 24 * speedNow; // 72° per 3 s
  liveLast = now;
  const m = ghostMotion(liveTheta);
  const t = ghostLocalTransforms(m);
  liveParts.forEach((g, k) => g.setAttribute('transform', t[k as keyof typeof t]));
  $('close-state').textContent =
    (m.look < -0.5 ? 'смотрит влево' : m.look > 0.5 ? 'смотрит вправо' : 'смотрит прямо') + (m.mouth > 0.5 ? ' · «А-а-а»' : '');
  requestAnimationFrame(liveTick);
};
requestAnimationFrame(liveTick);

// layers (hover to highlight, big preview)
const LAYERS: [string, string][] = [['ghosts', '5 × ghost + face']];
const list = $('layers');
for (const [name, desc] of LAYERS) {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = `<code>${name}</code><small>${desc}</small>`;
  li.append(b);
  list.append(li);
}

$('area-c').textContent = `${AVATAR_AREA.cx}, ${AVATAR_AREA.cy}`;
$('area-d').textContent = `${AVATAR_AREA.r * 2} px из ${CANVAS_SIZE}`;
