import type { SettingsGroupData } from '../components/SettingsGroup';
import type { TabData } from '../components/BottomTabBar';
import type { ProfileInfo } from '../components/ProfileHeader';

import photo from '../assets/avatar/capybara-profile.png'; // the user's profile photo (one source for every screen)
import emojiStatus from '../assets/icons/icon-emoji-status.svg';
import changeDecoration from '../assets/icons/icon-change-profile-decoration.svg';
import changePhoto from '../assets/icons/icon-change-photo.svg';
import addAccount from '../assets/icons/icon-add-account.svg';
import myProfile from '../assets/icons/glyph-my-profile.svg';
import savedMessages from '../assets/icons/glyph-saved-messages.svg';
import recentCalls from '../assets/icons/glyph-recent-calls.svg';
import devices from '../assets/icons/glyph-devices.svg';
import chatFolders from '../assets/icons/glyph-chat-folders.svg';
import tabContacts from '../assets/tabs/tab-contacts@2x.png';
import tabCalls from '../assets/tabs/tab-calls@2x.png';
import tabChats from '../assets/tabs/tab-chats@2x.png';
import tabSettings from '../assets/icons/tab-settings.svg';

/** Content of the Settings screen as in the Figma file (+ Change Profile Decoration). */
export const PROFILE: ProfileInfo = {
  name: 'Capybara',
  phone: '+888 888 888',
  photo,
  starBadge: true,
};

// Icon offsets: plain icons relative to the row (card starts at frame x 16),
// glyphs relative to their tile.
export const SETTINGS_GROUPS: SettingsGroupData[] = [
  {
    id: 'profile-actions',
    rows: [
      { id: 'set-emoji-status', title: 'Set Emoji Status', icon: { kind: 'plain', svg: emojiStatus, x: 27.398, y: 13.717 } },
      // Added (not in Figma): the user's own icon file, unchanged. Its drawing
      // fills only 20.6 × 20.5 of the 28 × 28 canvas and its lines are 1.10 thick,
      // while the neighbours' lines are 1.29. It is shown through a viewBox cut to
      // the drawing and scaled ×1.17 (lines 1.10 → 1.29, drawing 24.1 × 24.0 —
      // between the neighbours' 23.6–25.7). Centre: frame x 55, row y 26.2, like them.
      {
        id: 'change-profile-decoration',
        title: 'Change Profile Decoration',
        icon: {
          kind: 'plain',
          svg: changeDecoration,
          x: 26.94,
          y: 14.21,
          fit: { viewBox: '3.567 3.834 20.615 20.5', width: 24.12, height: 23.985 },
        },
      },
      { id: 'change-profile-photo', title: 'Change Profile Photo', icon: { kind: 'plain', svg: changePhoto, x: 25.084, y: 15.152 } },
    ],
  },
  {
    id: 'accounts',
    rows: [{ id: 'add-account', title: 'Add Account', icon: { kind: 'plain', svg: addAccount, x: 27.223, y: 14.098 } }],
  },
  {
    id: 'profile',
    rows: [
      { id: 'my-profile', title: 'My Profile', chevron: true, icon: { kind: 'tile', svg: myProfile, color: '#FF2D55', x: 5.971, y: 5.908 } },
    ],
  },
  {
    id: 'shortcuts',
    rows: [
      { id: 'saved-messages', title: 'Saved Messages', chevron: true, icon: { kind: 'tile', svg: savedMessages, color: '#0088FF', x: 6.779, y: 5.908 } },
      { id: 'recent-calls', title: 'Recent Calls', chevron: true, icon: { kind: 'tile', svg: recentCalls, color: '#34C759', x: 6.779, y: 5.908 } },
      { id: 'devices', title: 'Devices', value: '3', chevron: true, icon: { kind: 'tile', svg: devices, color: '#FF8D28', x: 5.14, y: 7.548 } },
      { id: 'chat-folders', title: 'Chat Folders', chevron: true, icon: { kind: 'tile', svg: chatFolders, color: '#00C0E8', x: 5.971, y: 7.548 } },
    ],
  },
];

/** Four tabs, in the Figma order. No search button. */
export const TABS: TabData[] = [
  { id: 'contacts', label: 'Contacts', icon: { kind: 'image', src: tabContacts, width: 24, height: 24 } },
  { id: 'calls', label: 'Calls', icon: { kind: 'image', src: tabCalls, width: 23.5, height: 24 } },
  { id: 'chats', label: 'Chats', icon: { kind: 'image', src: tabChats, width: 26.5, height: 24 } },
  { id: 'settings', label: 'Settings', icon: { kind: 'svg', svg: tabSettings } },
];
