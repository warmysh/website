# Deploy base-path audit (`/website`)

Дата: 2026-02-09

## Что было сломано на GitHub Pages

Сайт публикуется как project-site: `https://warmysh.github.io/website/`.

Были выявлены две системные проблемы:

1. Base-path не был зафиксирован в Astro-конфиге.
2. Часть ссылок в markdown использовала root-relative вид (`/docs/...`, `/oem/...`) без гарантированного учёта base-path.

Эти условия приводили к 404 на GitHub Pages, когда ссылки разрешались как будто сайт размещён в корне домена.

## Что изменили

Ключевые изменения:

- `astro.config.mjs`
  - добавлены `site: "https://warmysh.github.io"` и `base: "/website"`;
  - добавлен rehype-трансформер, который префиксует root-relative `href/src` в markdown через base-path.
- `src/layouts/BaseLayout.astro`
  - исправлена сборка URL навигации: корректное соединение `BASE_URL` и маршрутов с обязательным `/` между сегментами;
  - маршруты `404` и `index` также приведены к base-aware виду.
- `content/_nav.md`
  - локализованы пункты docs-меню на русский язык.

## Как проверяли именно режим `/website`

Использовался локальный preview-сервер с тем же base-path, что и на GitHub Pages:

```powershell
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
npx linkinator http://127.0.0.1:4173/website/ --recurse --skip "mailto:|tel:" --format csv --output linkcheck-basepath.csv
```

Результат link-check:

- внутренние страницы: `0 x 404`;
- переходы вида `/website/ -> /website/docs/ -> /website/docs/technical-specification/` проходят корректно.

Отдельная проверка якорей по собранному `dist`:

- просканировано `15` HTML-файлов;
- `Broken anchors: 0`.

## Примечание

Для будущих правок необходимо сохранять правило:

- не добавлять жёсткие пути, обходящие `base="/website"`;
- при добавлении новых внутренних ссылок проверять сайт через URL с префиксом `/website/`.
