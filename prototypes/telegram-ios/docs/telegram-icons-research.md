# Оригинальные цветные иконки Telegram — результаты поиска

Источник: официальный репозиторий [TelegramMessenger/Telegram-iOS](https://github.com/TelegramMessenger/Telegram-iOS), ветка `master`, коммит [`fb0e62b`](https://github.com/TelegramMessenger/Telegram-iOS/tree/fb0e62ba8a147f0821da6aa63c09da7d79a10111) (22.10.2026).

**В наш репозиторий ничего из этого не скопировано** (решение от 29.10.2026). Здесь только ссылки.

## Где что лежит

1. Какую иконку берёт каждая строка Edit Profile — [`PeerInfoSettingsItems.swift`, строки 442–531](https://github.com/TelegramMessenger/Telegram-iOS/blob/fb0e62ba8a147f0821da6aa63c09da7d79a10111/submodules/TelegramUI/Components/PeerInfo/PeerInfoScreen/Sources/PeerInfoSettingsItems.swift#L442-L531).
2. Как рисуется цветной квадрат и какого он цвета — [`PresentationResourcesSettings.swift`](https://github.com/TelegramMessenger/Telegram-iOS/blob/fb0e62ba8a147f0821da6aa63c09da7d79a10111/submodules/TelegramPresentationData/Sources/Resources/PresentationResourcesSettings.swift). Функция `renderSettingsIcon`: квадрат 30 × 30, цвет, поверх «блик» `Gradient` (режим plus-lighter) и светлая обводка `Backdrop` (режим overlay), затем белый символ по центру и скругление 8.
3. Сами символы — векторные PDF (только белая форма, без фона).

| Строка | Ресурс в коде | Файл символа | Цвет квадрата |
|---|---|---|---|
| Birthday | `PresentationResourcesSettings.birthday` | [`Item List/Icons/Cake.imageset/birthday.pdf`](https://github.com/TelegramMessenger/Telegram-iOS/blob/fb0e62ba8a147f0821da6aa63c09da7d79a10111/submodules/TelegramUI/Images.xcassets/Item%20List/Icons/Cake.imageset/birthday.pdf) | `#0A84FF` |
| Number | `PresentationResourcesSettings.recentCalls` | [`Item List/Icons/Phone.imageset/phone.pdf`](https://github.com/TelegramMessenger/Telegram-iOS/blob/fb0e62ba8a147f0821da6aa63c09da7d79a10111/submodules/TelegramUI/Images.xcassets/Item%20List/Icons/Phone.imageset/phone.pdf) | `#34C759` |
| Username (в интерфейс не добавляется) | `PresentationResourcesSettings.email` | [`Item List/Icons/Email.imageset/email.pdf`](https://github.com/TelegramMessenger/Telegram-iOS/blob/fb0e62ba8a147f0821da6aa63c09da7d79a10111/submodules/TelegramUI/Images.xcassets/Item%20List/Icons/Email.imageset/email.pdf) | `#5E5CE6` |
| Your Color | `PresentationResourcesSettings.yourColor` | [`Item List/Icons/Brush.imageset/brush.pdf`](https://github.com/TelegramMessenger/Telegram-iOS/blob/fb0e62ba8a147f0821da6aa63c09da7d79a10111/submodules/TelegramUI/Images.xcassets/Item%20List/Icons/Brush.imageset/brush.pdf) | `#32ADE6` |
| Channel | `PresentationResourcesSettings.channels` | [`Item List/Icons/Channel.imageset/channel.pdf`](https://github.com/TelegramMessenger/Telegram-iOS/blob/fb0e62ba8a147f0821da6aa63c09da7d79a10111/submodules/TelegramUI/Images.xcassets/Item%20List/Icons/Channel.imageset/channel.pdf) | `#FF9F0A` |
| Chat Automation | `PresentationResourcesSettings.aiTools` | [`Item List/Icons/AITools.imageset/ai.pdf`](https://github.com/TelegramMessenger/Telegram-iOS/blob/fb0e62ba8a147f0821da6aa63c09da7d79a10111/submodules/TelegramUI/Images.xcassets/Item%20List/Icons/AITools.imageset/ai.pdf) | `#AF52DE` |
| общий блик | — | [`Item List/Icons/Gradient.imageset/gradient.pdf`](https://github.com/TelegramMessenger/Telegram-iOS/blob/fb0e62ba8a147f0821da6aa63c09da7d79a10111/submodules/TelegramUI/Images.xcassets/Item%20List/Icons/Gradient.imageset/gradient.pdf) | — |
| общая обводка | — | [`Item List/Icons/Backdrop.imageset/Backdrop@3x.png`](https://github.com/TelegramMessenger/Telegram-iOS/blob/fb0e62ba8a147f0821da6aa63c09da7d79a10111/submodules/TelegramUI/Images.xcassets/Item%20List/Icons/Backdrop.imageset/Backdrop@3x.png) | — |

Все символы — квадрат 30 × 30 pt.

Важная находка: строка **Number** использует ту же иконку, что и **Recent Calls** на главном экране (`recentCalls`).

Кружки «Your Color» Telegram рисует программно (`generateSettingsMenuPeerColorsLabelIcon`), отдельного файла у них нет. В прототипе они нарисованы с нуля по размерам со скриншота.

## Лицензия

- Исходный код Telegram для iOS распространяется по лицензии **GNU GPL v2**.
- В текущей ветке `master` файла LICENSE в корне нет. README требует публиковать свой код, «чтобы соблюдать лицензии», и не использовать название и логотип Telegram для своих приложений.
- Если ресурсы скопировать, проект, который их распространяет, должен будет выйти под GPL с открытым исходным кодом. Для будущего маркетплейса это существенно.

(Это не юридическая консультация.)

## Что используется в прототипе

Решение от 29.10.2026: иконки Telegram и ранее нарисованные варианты прототипа не используются. Используются **только SVG-файлы пользователя** без изменений: `src/assets/icons/edit-profile/cake.svg`, `Icon.svg` (телефон), `username.svg`, `colors.svg` (кисть), `channel.svg`.
