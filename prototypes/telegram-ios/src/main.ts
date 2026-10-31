import './styles/app.css';
import { DeviceFrame, resolveMode } from './components/DeviceFrame';
import { Navigator } from './navigation/Navigator';
import { SettingsScreen } from './screens/SettingsScreen';
import { EditProfileScreen } from './screens/EditProfileScreen';
import { YourColorScreen } from './screens/YourColorScreen';
import { DECORATIONS } from './decor/catalog';
import { DecorationCarousel } from './components/DecorationCarousel';
import { bindProfileTheme } from './color/profileTheme';

const app = document.getElementById('app');
if (!app) throw new Error('#app container is missing');

// Profile colour (blue by default) → Settings header, glass rims, Edit circles.
bindProfileTheme();

const settings = SettingsScreen();
let lastYourColor: ReturnType<typeof YourColorScreen> | null = null;
const navigator = new Navigator(settings.element);
app.append(DeviceFrame(navigator.element, resolveMode()));

// Settings → Edit → Your Color, Settings → Your Color, and back (× / ✓ on Edit, ‹ on Your Color).
// Lower screens stay mounted, so Edit Profile keeps its scroll position.
// Other taps are only logged for now.
navigator.element.addEventListener('prototype:action', (event) => {
  const detail = (event as CustomEvent<{ type: string; id?: string }>).detail;
  console.info('[prototype]', detail);
  const top = navigator.top.dataset.screen;
  // Your Color opens from Edit Profile (row "Your Color") and straight from
  // Settings (row "Change Profile Decoration"). Same screen component; only
  // one is ever open. ‹ goes back to whichever screen opened it.
  const opensYourColor =
    (detail.id === 'your-color' && top === 'edit-profile') || (detail.id === 'change-profile-decoration' && top === 'settings');
  if (detail.type === 'row' && opensYourColor) {
    lastYourColor = YourColorScreen();
    navigator.push(lastYourColor.element);
    return;
  }
  if (detail.type !== 'button') return;
  if (detail.id === 'edit-profile' && top === 'settings') {
    navigator.push(EditProfileScreen().element);
  } else if ((detail.id === 'edit-close' || detail.id === 'edit-done') && top === 'edit-profile') {
    navigator.pop();
  } else if (detail.id === 'color-back' && top === 'your-color') {
    navigator.pop();
  } else if (detail.id === 'apply-style' && top === 'your-color') {
    // Saved by the screen (Apply Style) → straight back to Settings, which
    // already shows the new decoration.
    navigator.popToRoot();
  }
});

// Handy for manual checks in the browser console.
Object.assign(window, { prototype: { settings, navigator, decorations: DECORATIONS, DecorationCarousel, yourColor: () => lastYourColor } });
