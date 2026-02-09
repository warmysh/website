# Site Audit v0

Дата: 2026-02-09

## Что проверялось

- Локальная сборка сайта (без GitHub Pages).
- Внутренние ссылки и роуты через автоматический crawl.
- Якорные ссылки в markdown-контенте.

## Команды

```powershell
npm ci
npm run build
npx serve dist -l 4173 --no-clipboard
npx linkinator http://127.0.0.1:4173 --recurse --skip "mailto:|tel:" --format csv --output linkcheck-static.csv
```

## Что было сломано

На первичном проходе были 404/битые ссылки:

- `/docs.md` (из `content/index.md`)
- `/docs/roadmap.md` (из `content/docs.md`)
- `/oem/safety.md` (из `content/oem.md`)
- `/oem/platform.md` (из `content/oem.md`)
- `/oem/configurations.md` (из `content/oem.md`)
- `/oem/roadmap.md` (из `content/oem.md`)

Причина: использовались относительные markdown-пути `./*.md` внутри страниц, которые рендерятся как URL-роуты.

## Что исправлено

- `content/index.md`: `./docs.md` -> `/docs/`
- `content/docs.md`: `./roadmap.md` -> `/roadmap/`
- `content/oem.md`: все ссылки `./safety.md`, `./platform.md`, `./configurations.md`, `./roadmap.md` -> соответствующие route-ссылки вида `/.../`

## Результат после исправлений

- `npm run build` проходит успешно.
- Повторный link-check не показывает битых внутренних ссылок/роутов.
- В markdown-контенте не найдено ссылок формата `#anchor` (явные якорные ссылки отсутствуют).

## Осталось DIZ

- Добавить link-check в CI, чтобы не ловить регрессии вручную.
- Отдельно контролировать внешние ссылки (сейчас они проверяются только в момент ручного аудита).
