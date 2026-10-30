/**
 * Christmas Lights demo page. Uses only the decoration's public interface.
 * The avatar circle, the uploaded photo, the reference overlay and all
 * controls live here, never inside the decoration.
 */
import {
  AVATAR_AREA,
  CANVAS_SIZE,
  mountChristmasLights,
  bulbState,
  stateAt,
  type ChristmasLightsDecoration,
} from '../../decorations/christmas-lights';
import referenceUrl from '../../../reference/christmas-lights/composition-reference.png';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const avatars: HTMLElement[] = [];
const decorations: ChristmasLightsDecoration[] = [];

function buildPreview(box: HTMLElement, sizePx: number) {
  const pct = (v: number) => `${(v / CANVAS_SIZE) * 100}%`;
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.dataset.mode = 'grey';
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
  avatars.push(avatar);
  decorations.push(mountChristmasLights(holder, { size: '100%' }));
}

// previews
const big = $('big');
buildPreview(big, CANVAS_SIZE);
const ref = document.createElement('img');
ref.className = 'ref';
ref.src = referenceUrl;
ref.alt = 'Референс';
ref.hidden = true;
// reference: 1620 × 1616, avatar circle centre (814.1, 808.4), radius 694.7 → map onto the 512 canvas
const k = 218 / 694.7;
Object.assign(ref.style, {
  left: `${((256 - 814.1 * k) / 512) * 100}%`,
  top: `${((256 - 808.4 * k) / 512) * 100}%`,
  width: `${((1620 * k) / 512) * 100}%`,
  height: `${((1616 * k) / 512) * 100}%`,
});
big.append(ref);
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

new ResizeObserver(() => {
  const w = Math.round(big.getBoundingClientRect().width);
  $('big-px').textContent = w === CANVAS_SIZE ? '512 × 512' : `512 × 512 · сейчас показано ${w} px`;
}).observe(big);

const setPressed = (sel: string, on: Element) =>
  document.querySelectorAll(sel).forEach((b) => b.setAttribute('aria-pressed', String(b === on)));

// background
const grounds = document.querySelectorAll<HTMLElement>('.ground');
document.querySelectorAll<HTMLButtonElement>('#bg-seg button').forEach((btn) =>
  btn.addEventListener('click', () => {
    setPressed('#bg-seg button', btn);
    grounds.forEach((g) => (g.dataset.bg = btn.dataset.bg));
  }),
);

// avatar: grey circle, uploaded photo or nothing
let photoUrl = '';
const setAvatar = (mode: string) => {
  avatars.forEach((a) => {
    a.dataset.mode = mode;
    a.style.backgroundImage = mode === 'photo' && photoUrl ? `url("${photoUrl}")` : '';
  });
  setPressed('#avatar-seg button', document.querySelector(`#avatar-seg [data-mode="${mode}"]`)!);
};
document.querySelectorAll<HTMLButtonElement>('#avatar-seg button').forEach((btn) =>
  btn.addEventListener('click', () => setAvatar(btn.dataset.mode!)),
);
$<HTMLInputElement>('photo').addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = URL.createObjectURL(file);
  $<HTMLButtonElement>('av-photo').disabled = false;
  setAvatar('photo');
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

// playback
const phaseInput = $<HTMLInputElement>('phase');
const showFrame = () => {
  const p = decorations[0].progress;
  const f = Math.round(p * 180);
  phaseInput.value = String(f);
  $('phase-out').textContent = `кадр ${f} из 180 · ${(p * 3).toFixed(2).replace('.', ',')} с`;
  const st = stateAt(p);
  $('st-op').textContent = st < 0.02 ? 'рисунок 1' : st > 0.98 ? 'рисунок 2' : `переход (${Math.round(st * 100)} %)`;
  $('st-phi').textContent = ['фиолетовая', 'голубая', 'зелёная', 'розовая', 'жёлтая', 'красная']
    .filter((_, b) => (b % 2 === 1 ? 1 - bulbState(p, b).light : bulbState(p, b).light) > 0.5)
    .join(', ');
  $('st-scale').textContent = `${bulbState(p, 0).sway.toFixed(1).replace('.', ',')}° (фиолетовая)`;
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
    decorations.forEach((d) => d.setSpeed(Number(btn.dataset.speed)));
    setPressed('#speed-seg button', btn);
  }),
);
phaseInput.addEventListener('input', () => {
  const f = Number(phaseInput.value);
  decorations.forEach((d) => {
    d.pause();
    d.seek(f);
  });
  setPressed('#play-seg button', $('btn-pause'));
  showFrame();
});
requestAnimationFrame(showFrame);

$('area-c').textContent = `${AVATAR_AREA.cx}, ${AVATAR_AREA.cy}`;
$('area-d').textContent = `${AVATAR_AREA.r * 2} px из ${CANVAS_SIZE}`;
