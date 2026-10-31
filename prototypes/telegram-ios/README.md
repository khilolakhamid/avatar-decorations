# Telegram iOS profile decoration prototype

An interactive web prototype of the Telegram for iPhone profile screens, built to preview and try on the animated avatar decorations from this repository.

> **This is a demonstration interface, not the official Telegram app.** It is not affiliated with or endorsed by Telegram. It only imitates the look of the Telegram iOS profile screens so the decorations can be judged in a realistic setting. Icons are taken from the owner's Figma mock-up or are the owner's own files; no files or code from the Telegram app are included (see `docs/telegram-icons-research.md`).

The prototype lives in `prototypes/telegram-ios/` and is independent of the decoration library: it only **reads** the approved release builds in `releases/<id>/<version>/dist/index.js` and never changes them.

## Run it locally

You need Node.js 20 or newer. Run these commands inside `prototypes/telegram-ios/`:

```bash
npm install                        # esbuild, TypeScript, Playwright (development only)
npx playwright install chromium    # once, for the tests and screenshots
npm run dev                        # http://localhost:5180 — rebuilds on every change
npm run build                      # dist/index.html + dist/telegram-ios-settings.html (single self-contained file)
npm test                           # build + all tests (Playwright, headless Chromium)
npm run typecheck                  # TypeScript check
```

`dist/index.html` and `dist/telegram-ios-settings.html` also open without a server: double-click either file.

**Display modes**
- **Frame** (desktop): an iPhone frame of 402 × 874 pt, scaled to fit the window.
- **Device** (phone): full screen, using the phone's real safe areas.

The mode is chosen automatically. You can force one with `?mode=frame` or `?mode=device`.

## Screens

| Screen | What it shows |
|---|---|
| **Settings** | Profile header in the selected profile colour (blue by default) with the leaf pattern, the avatar with the applied decoration, name and phone. Glass QR, Search and Edit buttons. Settings rows and a four-tab bar. The header collapses smoothly into a bar on scroll. |
| **Edit Profile** | Opened with **Edit**. Photo, name and bio fields, Birthday, and Number / Username / Your Color / Channel rows. The two circles of the Your Color row follow the selected profile colour. **×** and **✓** close the screen. |
| **Your Color** (Profile tab) | Profile card with the avatar and the **decoration carousel**, a palette of 16 colours, *Add Icons To Profile*, and *Reset Profile Color*. Opened from Edit Profile (row *Your Color*) or straight from Settings (row *Change Profile Decoration*). **‹** goes back to wherever it was opened from. |

Navigation is a small screen stack (`src/navigation/Navigator.ts`). Screens below the top one stay mounted, so Edit Profile keeps its scroll position.

## Decorations used

| Decoration | Version | Imported from |
|---|---|---|
| Paper Plane Orbit | 1.0.0 | `releases/paper-plane-orbit/1.0.0/dist/index.js` |
| Cat Ears | **1.1.0** | `releases/cat-ears/1.1.0/dist/index.js` |
| Christmas Lights | 1.0.0 | `releases/christmas-lights/1.0.0/dist/index.js` |
| Ghost Orbit | 1.0.0 | `releases/ghost-orbit/1.0.0/dist/index.js` |
| Halloween Pumpkin | 1.0.0 | `releases/halloween-pumpkin/1.0.0/dist/index.js` |

The release builds are bundled into the page by esbuild. They are not copied into this folder. Their drawings, timing and animation are used exactly as released. A test checks that only these approved release builds are imported and that `src/decorations/` and `releases/` have no local changes.

## Decoration carousel

The carousel (`src/components/DecorationCarousel.ts`) works like this:

- **Six equal positions**, infinite in both directions: **None → Paper Plane Orbit → Cat Ears → Christmas Lights → Ghost Orbit → Halloween Pumpkin → None…**
- **What you see:** the previous item small on the left, the selected one on the avatar, and the next one small on the right.
- **One number drives everything:** a fractional *track position*. Every item's place and scale are interpolated from it, so items follow the finger continuously. The current item shrinks to the left while the next one grows from the right onto the photo.
- **Unfinished gestures:** a short swipe glides back. Quick repeated swipes never skip or double a step.
- **Input:** finger or mouse drag on the card, a tap on a side preview, a horizontal trackpad swipe, or the ← / → keys.
- **Shared slot size:** both side slots are one size (78 pt). Each decoration's whole animation is measured over all 180 frames and fitted into that slot.
- **Fitting on the avatar:** the photo circle of every release (centre 256, 256; r 218 on a 512 canvas) is laid exactly onto the 104 pt photo.
- **None** is a real position that draws nothing — no ring, no placeholder.
- **Performance:** one live instance per visible place, at most 4 while moving and 3 at rest. Instances are destroyed as soon as they leave the view.
- **Sparkle effect** (`src/components/SparkleEffect.ts`):
  - Once per finished switch to a real decoration, six small white four-point stars light up one after another around the avatar, then fade (about 2 s in total).
  - None gets no sparkles and clears a running burst. Fast switching replaces the burst, so stars never pile up.
  - `prefers-reduced-motion` turns the effect off.

**Adding a decoration** needs no change to the carousel:
1. Import its release build in `src/decor/catalog.ts`.
2. Add one entry: id, name, `mount`, and its visible extent `ink`. The *visible extents* test prints the measured value.
3. Allow its release path in `tests/settings-screen.test.mjs`.

## Apply Style and saved choices

- **Preview vs applied.** Swiping changes only the *preview*. The *applied* decoration changes only with **Apply Style**.
- **When the button shows.** It appears (fade + slide) only while the decoration on the avatar differs from the applied one. The two are compared by stable catalogue id (`paper-plane-orbit`, `cat-ears`, …, `none`), never by carousel position. Colour changes do not show it.
- **Tapping Apply Style** saves the id and returns straight to Settings, even when Your Color was opened through Edit Profile. Settings then shows that decoration with its original animation. Leaving with **‹** saves nothing.
- **Where choices are kept.** Both are stored in `localStorage` and restored on start:

  | Choice | Key | Default |
  |---|---|---|
  | Applied decoration | `tg-prototype:applied-decoration` | `none` |
  | Profile colour (swatch index) | `tg-prototype:profile-color` | blue, swatch 0 |

  An unknown id or blocked storage falls back to the defaults.
- **Profile colour on all screens.** The colour themes the Your Color card, the Settings header, the glass-button rims and the Edit Profile circles (`src/color/profileTheme.ts`). *Reset Profile Color* returns to blue.
- **Settings decoration** (`src/decor/AppliedDecoration.ts`) uses the same catalogue entry and placement as the carousel. It pauses while another screen covers Settings.

## Project layout

```text
prototypes/telegram-ios/
├── src/
│   ├── main.ts                 start-up, navigation wiring, profile theme
│   ├── screens/                Settings, Edit Profile, Your Color (+ their data)
│   ├── components/             avatar, header, glass buttons, carousel, sparkles, leaf pattern, …
│   ├── decor/                  decoration catalogue, applied decoration on Settings
│   ├── state/                  applied decoration + profile colour (localStorage)
│   ├── color/                  palette parsing and colour rules
│   ├── navigation/Navigator.ts screen stack
│   ├── styles/app.css
│   └── assets/                 icons and images (see "Assets")
├── tests/                      Playwright + node:test
├── scripts/                    build, test, screenshot
├── reference/                  the owner's Figma export of the Settings screen
└── docs/                       icon research, design notes (Russian)
```

## Assets

- `reference/settings.figma.svg/.png`: the owner's Figma mock-up, the layout source.
- `src/assets/icons/*`, `src/assets/patterns/header-leaves.svg`, `src/assets/tabs/*.png`: exported from that Figma file.
- `src/assets/icons/edit-profile/*`, `src/assets/your-color/*` (palette, maple leaf, star), `src/assets/icons/icon-change-profile-decoration.svg`: the owner's own SVG files, used unchanged.
- `src/assets/avatar/capybara-profile.png`: the owner's profile picture (384 × 384), one source for every screen.

## Tests

`npm test` builds the prototype and runs every test in `tests/`:
- layout against the Figma frame;
- navigation;
- collapse;
- the carousel: order, continuity, no overlaps, narrow iPhones of 320, 375 and 390 pt, a 6-item stub catalogue;
- sparkles;
- Apply Style, including reloads;
- profile colour and photo;
- protection of the approved releases.
