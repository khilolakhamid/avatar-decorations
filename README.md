# Avatar Decorations

Приватная библиотека анимированных декораций для фото профиля (по принципу декораций аватара Discord). Каждая декорация — независимый компонент со своими векторами, раскладкой, анимацией, тестами и версиями. Готовые компоненты в будущем подключаются к отдельному маркету; сам маркет в этом репозитории не разрабатывается.

## Декорации

| Декорация | id | Исходники | Утверждённая версия | Подключение | Веб | Telegram TGS |
|---|---|---|---|---|---|---|
| Halloween Pumpkin | `halloween-pumpkin` | `src/decorations/halloween-pumpkin/` | `releases/halloween-pumpkin/1.0.0/` | `mountHalloweenPumpkin()` | утверждена 28.10.2026 | не экспортирован |
| Ghost Orbit | `ghost-orbit` | `src/decorations/ghost-orbit/` | `releases/ghost-orbit/1.0.0/` | `mountGhostOrbit()` | утверждена 28.10.2026 | не экспортирован |
| Cat Ears | `cat-ears` | `src/decorations/cat-ears/` | `releases/cat-ears/1.1.0/` (актуальная); `releases/cat-ears/1.0.0/` (предыдущая, доступна) | `mountCatEars()` | 1.1.0 и 1.0.0 утверждены 30.10.2026 | не экспортирован |
| Paper Plane Orbit | `paper-plane-orbit` | `src/decorations/paper-plane-orbit/` | `releases/paper-plane-orbit/1.0.0/` | `mountPaperPlaneOrbit()` | утверждена 30.10.2026 | не экспортирован |
| Christmas Lights | `christmas-lights` | `src/decorations/christmas-lights/` | `releases/christmas-lights/1.0.0/` | `mountChristmasLights()` | утверждена 30.10.2026 | не экспортирован |

Декорации полностью независимы: у каждой свои векторы, анимация, тесты и выпуск. Ни одна не импортирует другую, и каждую можно подключить без остальных.

## Структура

```text
avatar-decorations/
├── src/
│   ├── decorations/                 одна папка = одна декорация
│   │   ├── halloween-pumpkin/
│   │   │   ├── assets/              оригинальные SVG (не редактировать) + sources.generated.ts
│   │   │   ├── component/           координаты, сборка SVG, класс компонента
│   │   │   ├── animation/           ключевые кадры и логика анимации
│   │   │   ├── index.ts             публичный интерфейс
│   │   │   └── README.md, STATUS.md документация и статус версии
│   │   ├── ghost-orbit/
│   │   │   ├── assets/              оригинальные SVG ghost, face + sources.generated.ts
│   │   │   ├── component/           орбита, движение (motion.ts), сборка SVG, класс компонента
│   │   │   ├── index.ts             публичный интерфейс
│   │   │   └── README.md, STATUS.md
│   │   ├── cat-ears/
│   │   │   ├── assets/              оригинальный SVG ear + sources.generated.ts
│   │   │   ├── component/           раскладка, изгиб кончиков и покачивание ушек (motion.ts), сборка SVG, класс компонента
│   │   │   ├── index.ts             публичный интерфейс
│   │   │   └── README.md, STATUS.md
│   │   ├── paper-plane-orbit/
│   │   │   ├── assets/              оригинальные SVG paper_plane_1/2/3 + sources.generated.ts
│   │   │   ├── component/           полёт (motion.ts), повороты между рисунками, сборка SVG, класс компонента
│   │   │   ├── index.ts             публичный интерфейс
│   │   │   └── README.md, STATUS.md
│   │   └── christmas-lights/
│   │       ├── assets/              оригинальные SVG lights_1/2 + sources.generated.ts
│   │       ├── component/           сопоставление рисунков (garlandModel.ts), движение и свет (motion.ts), сборка SVG, класс компонента
│   │       ├── index.ts             публичный интерфейс
│   │       └── README.md, STATUS.md
│   ├── shared/                      общий движок анимации и SVG-инструменты
│   ├── demo/                        демо-страницы разработчика (серый аватар, кнопки) — не входят в компоненты
│   │   ├── ghost-orbit/             демо Ghost Orbit (корень demo/ — Halloween Pumpkin)
│   │   ├── cat-ears/                демо Cat Ears (можно загрузить своё фото)
│   │   ├── paper-plane-orbit/       демо Paper Plane Orbit (можно загрузить своё фото)
│   │   └── christmas-lights/        демо Christmas Lights (можно загрузить своё фото)
│   └── types/                       типы для .jpg и .png (только демо)
├── releases/                        утверждённые версии, только чтение
│   ├── halloween-pumpkin/1.0.0/     готовый пакет: dist/, исходники, тесты, документация
│   ├── ghost-orbit/1.0.0/           готовый пакет Ghost Orbit
│   ├── cat-ears/1.1.0/              готовый пакет Cat Ears (актуальная версия)
│   ├── cat-ears/1.0.0/              готовый пакет Cat Ears (предыдущая версия)
│   ├── paper-plane-orbit/1.0.0/     готовый пакет Paper Plane Orbit
│   └── christmas-lights/1.0.0/      готовый пакет Christmas Lights
├── tests/                           автотесты (npm test)
├── reference/                       материалы: референсы композиций (Halloween Pumpkin, cat-ears/, paper-plane-orbit/, christmas-lights/), требования TGS
├── scripts/                         сборка, встраивание SVG, тесты, выпуск версий
├── package.json, tsconfig*.json     настройки сборки
└── .gitignore, .gitattributes
```

Демо лежит в `src/demo/`, а не в корневой `demo/`: так его собирает текущий сборщик, и перенос ничего не дал бы. Демо импортирует декорацию только через её публичный `index.ts`; декорация о демо ничего не знает (это проверяют тесты).

## Команды

Нужен Node.js 20+ (сборке и тестам хватает 18).

```bash
npm install                                  # esbuild и TypeScript, только для разработки
npm run dev                                  # демо: http://localhost:5173 (Halloween Pumpkin), /ghost-orbit, /cat-ears, /paper-plane-orbit, /christmas-lights
npm run build                                # dist/<id>/index.js для каждой декорации + демо-страницы
npm test                                     # автотесты
npm run typecheck                            # проверка типов
npm run release -- <id-декорации>            # выпуск утверждённой версии в releases/
```

## Правила библиотеки

1. **Одна декорация — одна папка** в `src/decorations/<id>/` (id латиницей через дефис, например `winter-snowman`). Свои векторы, раскладка, анимация, `README.md`, `STATUS.md`, тест `tests/<id>.test.ts`.
2. **Общий код** — только в `src/shared/`. Декорации не импортируют друг друга.
3. **Оригинальные SVG не редактируются.** Сборка копирует их текст байт в байт в `assets/sources.generated.ts`; тесты сверяют SHA-256.
4. **Утверждённая версия неприкосновенна.** После утверждения `npm run release -- <id>` замораживает её в `releases/<id>/<версия>/` (со своей копией `shared/`, сборкой и тестами). Скрипт никогда не перезаписывает существующую версию. Любое изменение утверждённой декорации — только по отдельному запросу владельца и как новая версия (`1.0.1`, `1.1.0`, `2.0.0`).
5. **Тесты защищают утверждённое:** в тесте декорации записаны отпечатки её SVG, разметки и всех ключевых кадров. Если тест «approved … is unchanged» падает, изменились внешний вид или движение — это требует согласования, а не правки отпечатка.
6. **Анимация только из операций TGS:** сдвиг, поворот, масштаб и прозрачность группы вокруг опорной точки, морфинг контура с тем же числом точек.

### Как добавить новую декорацию

1. Создать `src/decorations/<id>/` по образцу `halloween-pumpkin/` и положить оригинальные SVG в `assets/`.
2. Собрать статичную композицию (`component/layout.ts`), показать в демо, получить согласование.
3. Добавить анимацию (`animation/timeline.ts`), тесты (`tests/<id>.test.ts`), документацию.
4. После утверждения: версия `1.0.0` в `index.ts`, `npm run release -- <id>`, коммит.

Готовые декорации при этом не меняются: у каждой своя папка, а утверждённый выпуск хранит собственную копию общего кода. Так были добавлены Ghost Orbit, Cat Ears, Paper Plane Orbit и Christmas Lights: предыдущие декорации и их выпуски не затронуты.

## Подключение готового компонента (например, к маркету)

Готовый компонент — папка `releases/<id>/<версия>/`. Это самостоятельный пакет: `dist/index.js` (векторы и анимация внутри, зависимостей при работе нет) и `dist/index.d.ts` (типы).

```ts
// releases/halloween-pumpkin/1.0.0/
import { mountHalloweenPumpkin } from '@avatar-decorations/halloween-pumpkin';
const pumpkin = mountHalloweenPumpkin(element, { size: 128 });

// releases/ghost-orbit/1.0.0/
import { mountGhostOrbit } from '@avatar-decorations/ghost-orbit';
const ghosts = mountGhostOrbit(element, { size: 128 });

// releases/cat-ears/1.1.0/ (предыдущая 1.0.0 — releases/cat-ears/1.0.0/)
import { mountCatEars } from '@avatar-decorations/cat-ears';
const ears = mountCatEars(element, { size: 128 });

// releases/paper-plane-orbit/1.0.0/
import { mountPaperPlaneOrbit } from '@avatar-decorations/paper-plane-orbit';
const plane = mountPaperPlaneOrbit(element, { size: 128 });

// releases/christmas-lights/1.0.0/
import { mountChristmasLights } from '@avatar-decorations/christmas-lights';
const lights = mountChristmasLights(element, { size: 128 });
```

У всех одинаковый набор методов: `setSize`, `show`/`hide`, `play`/`pause`, `seek(кадр)`, `setSpeed`, `destroy`.

Способ доставки в маркет выберем, когда начнём маркет: копия папки выпуска, установка пакета прямо из этого приватного репозитория или приватный реестр пакетов. Во всех случаях анимацию переписывать не нужно. Подробности API и место для фото — в `README.md` каждой декорации.

## Что не хранится в репозитории

`node_modules/`, корневая сборка `dist/`, временные папки тестов и выпусков, ZIP-архивы выпусков (их содержимое лежит в `releases/`), логи, кэши, файлы редакторов и любые секреты (`.env`, ключи).
