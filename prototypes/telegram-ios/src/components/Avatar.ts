import { el } from '../dom';
import { HEADER } from '../layout/figma';

/**
 * Profile photo as a separate element, ready for a future animated
 * decoration.
 *
 *   .avatar                      104 × 104 box at (149, 90) in the Figma frame
 *   ├── .avatar__glow            the soft white glow from the Figma file
 *   ├── .avatar__photo           the round photo
 *   └── .avatar__decoration      empty transparent layer above the photo
 *
 * The decoration layer is centred on the photo and does not catch taps.
 * Its size is the CSS variable --avatar-decoration-size (default: the photo
 * size); a decoration that is drawn larger than the photo can set it, and the
 * layer is not clipped. Nothing is mounted into it yet.
 */
export interface AvatarHandle {
  element: HTMLDivElement;
  photo: HTMLImageElement;
  /** Empty container where a decoration can be mounted later. */
  decorationLayer: HTMLDivElement;
  /** Photo diameter in points (104). */
  size: number;
}

export function Avatar({ src, alt }: { src: string; alt: string }): AvatarHandle {
  const photo = el('img', {
    className: 'avatar__photo',
    attrs: { src, alt, draggable: 'false', width: String(HEADER.avatar.size), height: String(HEADER.avatar.size) },
  });
  const decorationLayer = el('div', {
    className: 'avatar__decoration',
    attrs: { 'aria-hidden': 'true', 'data-slot': 'avatar-decoration' },
  });
  const glow = el('span', { className: 'avatar__glow', attrs: { 'aria-hidden': 'true' } });
  const element = el('div', { className: 'avatar', attrs: { 'data-component': 'avatar' } }, [glow, photo, decorationLayer]);
  return { element, photo, decorationLayer, size: HEADER.avatar.size };
}
