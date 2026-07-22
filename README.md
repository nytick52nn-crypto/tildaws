# Личный Kanban-трекер

Простая доска задач (To Do / In Progress / Done) для личного использования, с интеграцией GA4 / GTM / Яндекс.Метрики через кастомные события — учебный полигон для практики с аналитикой на реальных действиях (создание/перемещение/удаление задачи). У каждой задачи есть страница `/task/[id]` с комментариями, ссылкой для шаринга и чек-листом подзадач, приоритет и произвольные метки, по дедлайну (`dueDate`) можно получить несколько push-напоминаний (вовремя/за час/за день), есть недельный agenda-вид (`/agenda`) и .ics-подписка для обычного календаря.

Стек: Next.js (App Router) + Prisma + Postgres + Tailwind.

## Локальный запуск

```bash
npm install
# заполнить .env по образцу .env.example (DATABASE_URL обязателен)
npm run db:migrate   # применяет prisma/migrations к БД
npm run db:seed      # создаёт дефолтную доску с 3 колонками
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

## Переменные окружения

См. `.env.example`:

- `DATABASE_URL` — строка подключения к Postgres.
- `NEXT_PUBLIC_GTM_ID` — Container ID из Google Tag Manager (`GTM-XXXXXXX`). Если не задан, скрипт GTM просто не рендерится — для локальной разработки не обязателен.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` — ключи Web Push (генерируются один раз: `npx web-push generate-vapid-keys --json`).
- `CRON_SECRET` — защищает `/api/cron/send-reminders`; настраивается как заголовок `Authorization: Bearer <секрет>` во внешнем планировщике (cron-job.org).
- `NEXT_PUBLIC_PUSH_TOKEN` — попадает в клиентский бандл, защищает `/api/push/*` от случайного сканирования (не настоящий секрет, см. комментарий в коде роутов).
- `NEXT_PUBLIC_SITE_URL` — публичный URL сайта, используется для абсолютных ссылок в пуш-уведомлениях и в .ics-фиде.
- `ICS_FEED_TOKEN` — секрет для `.ics`-фида (`/api/ics/<токен>`), часть URL, а не заголовок (календарные приложения не умеют слать кастомные заголовки при подписке).

## Кастомные события аналитики

Пушатся в `window.dataLayer` через `lib/analytics.ts` → `pushDataLayerEvent`:

| Событие | Когда | Параметры |
|---|---|---|
| `task_created` | создание задачи | `task_id`, `column_id`, `column_name`, `has_due_date`, `has_tag` |
| `task_moved` | перемещение между колонками | `task_id`, `from_column_id`, `from_column_name`, `to_column_id`, `to_column_name` |
| `task_deleted` | удаление задачи | `task_id`, `column_id`, `column_name` |
| `comment_added` | добавление комментария к задаче | `task_id`, `author_provided` |
| `task_shared` | клик "скопировать ссылку" на странице задачи | `task_id` |

## Web Push напоминания

Каждой задаче с `dueDate` соответствует push-уведомление примерно в момент дедлайна. Схема:

- `public/sw.js` — service worker, принимает push и открывает `/task/[id]` по клику на уведомление.
- `components/PushManager.tsx` (кнопки на доске) — запрашивает разрешение, подписывает браузер, шлёт тестовый пуш.
- `app/api/cron/send-reminders/route.ts` — ищет задачи с `dueDate` в ближайшем 30-минутном окне и ещё не отправленным напоминанием (`reminderSentAt IS NULL`), шлёт пуш всем подпискам, помечает отправленным.
- Vercel Hobby не поддерживает cron чаще раза в день, поэтому расписание держит внешний бесплатный **cron-job.org**: задание раз в 5 минут дёргает `GET /api/cron/send-reminders` с заголовком `Authorization: Bearer <CRON_SECRET>`.
- На iPhone (Safari) push работает только для сайта, добавленного на экран "Домой" (ограничение iOS) — на Android/десктопе работает сразу.

## Agenda-вид и .ics-подписка

`/agenda` — те же задачи, сгруппированные по дням недели (а не по статусам), плюс отдельный блок "Без даты". Навигация по неделям — через `?week=YYYY-MM-DD` (понедельник недели), сегодняшний день подсвечен акцентом. Группировка и "что сегодня" считаются через `fakeUtcNow()` из `lib/dueDate.ts` — тот же виртуальный UTC, что и в push-напоминаниях, иначе задачи могли бы съезжать на соседний день у полуночи.

`.ics`-фид (`app/api/ics/[token]/route.ts`, генератор — `lib/ics.ts`) отдаёт задачи с `dueDate` в формате RFC5545 для подписки в Google/Apple Calendar:

1. Собери URL: `https://<домен>/api/ics/<значение ICS_FEED_TOKEN>`.
2. **Google Calendar**: Settings → Add calendar → From URL → вставить адрес.
3. **Apple Calendar**: File → New Calendar Subscription → вставить адрес.
4. Событие должно показать то же время, что и в трекере (например, 15:00, а не 18:00/12:00) — календарь читает `DTSTART;TZID=Europe/Moscow`, без реального UTC-сдвига.

Кнопки "скопировать календарную ссылку" в интерфейсе нет намеренно — токен не должен попасть в клиентский код, собери URL вручную один раз.

## Деплой (бесплатно)

1. Создать пустой репозиторий на GitHub и запушить проект.
2. Зайти на [vercel.com](https://vercel.com) через "Continue with GitHub", импортировать репозиторий.
3. В проекте на Vercel: **Storage → Create Database → Postgres** — подключится автоматически, `DATABASE_URL` появится в Environment Variables.
4. Добавить `NEXT_PUBLIC_GTM_ID` в Environment Variables проекта (после создания GTM-контейнера, см. ниже).
5. Задеплоить. После первого деплоя миграции нужно применить к прод-базе: `npx prisma migrate deploy` (локально, с `DATABASE_URL` от прод-базы) или через Vercel Postgres UI → Query.
6. Прогнать `npm run db:seed` с прод-`DATABASE_URL`, чтобы создать дефолтную доску.
7. Добавить Web Push переменные (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`, `NEXT_PUBLIC_PUSH_TOKEN`, `NEXT_PUBLIC_SITE_URL`) и `ICS_FEED_TOKEN` в Environment Variables, задеплоить ещё раз.
8. Завести аккаунт на [cron-job.org](https://cron-job.org), создать задание: `GET https://<домен>/api/cron/send-reminders` раз в 5 минут, заголовок `Authorization: Bearer <CRON_SECRET>`.

## Настройка аналитики

1. **GA4**: создать property в Google Analytics → получить Measurement ID (`G-XXXXXXX`).
2. **GTM**: создать контейнер → получить Container ID (`GTM-XXXXXXX`); внутри настроить:
   - тег GA4 Configuration (Measurement ID из шага 1), триггер "All Pages";
   - тег Яндекс.Метрики (шаблон из галереи или Custom HTML), триггер "All Pages".
3. **Яндекс.Метрика**: создать счётчик в Яндекс.Метрике → ID вставить в тег GTM из шага 2.
4. Вставить `NEXT_PUBLIC_GTM_ID` в `.env.local` и в Environment Variables на Vercel.
5. Проверить через GTM Preview mode: теги GA4/Метрики стреляют на загрузке, кастомные события (`task_created` и т.д.) видны в списке событий со своими параметрами.

## Идеи на будущее (не реализовано)

Продуктовые фичи:

- **Умное быстрое добавление** — парсить одну строку вида "стрижка завтра в 15:00 #личное" на название/дату/тег.
- **Drag-and-drop** между колонками вместо кнопок ←/→ (`@dnd-kit`).
- **Офлайн-режим** — расширить уже существующий `public/sw.js` кэшированием доски.
- **Повторяющиеся задачи** — при переносе в Done с пометкой "повторять" создавать копию с новым `dueDate`; естественно ложится на уже готовую систему пуш-напоминаний.
- **Голосовой ввод** задачи через Web Speech API, без бэкенда.
- **WIP-лимит** на колонку "In Progress" — мягкое предупреждение при превышении.

Фичи, завязанные на GA4 / GTM / Яндекс.Метрику (усиливают учебную часть проекта):

- **`/stats` внутри приложения** — воронка `task_created → task_moved → task_deleted` через GA4 Data API, без выхода в консоль GA4.
- **Key Event / цель "задача выполнена"** — считать перенос в Done конверсией в GA4 (Admin → Key Events) и целью в Яндекс.Метрике, строить воронку до/после.
- **User Properties через GTM** — например, слать `total_tasks_created` как свойство пользователя, потом сегментировать отчёты GA4 по "активным" пользователям (актуально, даже если пользователь один — сам механизм стоит попрактиковать).
- **UTM-метки на ссылке шаринга** — при копировании `/task/[id]` автоматически добавлять `?utm_source=share&utm_medium=link`, чтобы в GA4/Метрике было видно трафик именно с расшаренных ссылок отдельно от прямых заходов.
- **Вебвизор Яндекс.Метрики** — без всякого кода: настроить и посмотреть запись сессии реального использования сайта — наглядная фича, которой нет в GA4.
- **Событие `app_error`** — пушить в dataLayer из существующих `try/catch` в `Board.tsx`/`app/error.tsx`, чтобы в GA4 строить отчёт по частоте ошибок — учит использовать аналитику не только для маркетинга, но и для мониторинга.
- **GTM Consent Mode** — баннер согласия на cookies, который через встроенный в GTM Consent Mode управляет, стреляют ли теги GA4/Метрики до согласия пользователя — практика реального требования GDPR-стиля privacy-инструментов.
