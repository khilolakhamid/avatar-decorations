import type { SettingsRowData } from '../components/SettingsGroup';
// The user's SVG files, used unchanged (only shown through a viewBox cut to
// the drawing, scaled and coloured white on the tile).
import cakeSvg from '../assets/icons/edit-profile/cake.svg';
import phoneSvg from '../assets/icons/edit-profile/Icon.svg';
import colorsSvg from '../assets/icons/edit-profile/colors.svg';
import channelSvg from '../assets/icons/edit-profile/channel.svg';
import usernameSvg from '../assets/icons/edit-profile/username.svg';

/**
 * Content of the Edit Profile screen (reference: the user's two Telegram iOS
 * screenshots, 393 × 852 pt). Personal data from the screenshots is replaced
 * by the prototype's test data: Username shows no value, Chat Automation is
 * left out on purpose.
 *
 * Tile colours are sampled from the screenshots (top and bottom of each tile).
 *
 * Glyphs: the user's SVG files (28 × 28 canvas, drawing ≈ 20–25 pt). Each is
 * scaled uniformly so its drawing has the size the same symbol has in the
 * Telegram screenshot (measured at 50 % coverage), and centred in the 30 × 30
 * tile.
 */
interface Glyph {
  svg: string;
  /** Drawing bounds in the file: x, y, width, height. */
  ink: [number, number, number, number];
  /** Uniform scale (reference drawing size / file drawing size). */
  scale: number;
}

const TILE = 30;

const tile = (glyph: Glyph, top: string, bottom: string) => {
  const base = { kind: 'tile' as const, color: bottom, background: `linear-gradient(to bottom, ${top}, ${bottom})` };
  const [x, y, w, h] = glyph.ink;
  const width = +(w * glyph.scale).toFixed(3);
  const height = +(h * glyph.scale).toFixed(3);
  return {
    ...base,
    svg: glyph.svg,
    fit: { viewBox: `${x} ${y} ${w} ${h}`, width, height },
    x: +((TILE - width) / 2).toFixed(3),
    y: +((TILE - height) / 2).toFixed(3),
  };
};

// Reference sizes (Telegram screenshot): cake 20.7 × 20, phone 18 × 18,
// @ 20 × 20, brush 20 × 18.7, megaphone 17 × 18.7.
const GLYPHS = {
  birthday: { svg: cakeSvg, ink: [2, 2, 24.666, 24.143], scale: 0.833 },
  number: { svg: phoneSvg, ink: [3, 3, 22, 22], scale: 0.818 },
  username: { svg: usernameSvg, ink: [3, 3, 22, 22], scale: 0.909 },
  yourColor: { svg: colorsSvg, ink: [3, 4, 22, 20], scale: 0.921 },
  channel: { svg: channelSvg, ink: [4, 3, 20, 22], scale: 0.85 },
} satisfies Record<string, Glyph>;

export const EDIT_PROFILE = {
  firstName: 'Capybara',
  lastName: '',
  bio: '',
  phone: '+888 888 888',
  channel: 'Capybara Channel',
} as const;

export const BIRTHDAY_ROW: SettingsRowData = {
  id: 'birthday',
  title: 'Birthday',
  value: 'Add',
  icon: tile(GLYPHS.birthday, 'rgb(91, 162, 248)', 'rgb(66, 141, 247)'),
};

/** Circles of "Your Color" (24 pt each, 18 pt apart, the right one with a 2 pt white ring). */
export function colorCircles(): HTMLElement {
  const wrap = document.createElement('span');
  wrap.className = 'color-circles';
  wrap.innerHTML = '<span class="color-circles__a"></span><span class="color-circles__b"></span>';
  return wrap;
}

export function profileRows(): SettingsRowData[] {
  return [
    { id: 'number', title: 'Number', value: EDIT_PROFILE.phone, chevron: true, icon: tile(GLYPHS.number, 'rgb(133, 228, 134)', 'rgb(111, 203, 112)') },
    { id: 'username', title: 'Username', chevron: true, icon: tile(GLYPHS.username, 'rgb(126, 124, 247)', 'rgb(109, 108, 229)') },
    { id: 'your-color', title: 'Your Color', valueNode: colorCircles(), chevron: true, icon: tile(GLYPHS.yourColor, 'rgb(121, 203, 250)', 'rgb(105, 184, 232)') },
    { id: 'channel', title: 'Channel', value: EDIT_PROFILE.channel, chevron: true, icon: tile(GLYPHS.channel, 'rgb(246, 195, 91)', 'rgb(244, 178, 71)') },
  ];
}
