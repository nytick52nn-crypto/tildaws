# Личный Kanban-трекер

Простая доска задач (To Do / In Progress / Done) для личного использования, с интеграцией GA4 / GTM / Яндекс.Метрики через кастомные события — учебный полигон для практики с аналитикой на реальных действиях (создание/перемещение/удаление задачи).

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

## Кастомные события аналитики

Пушатся в `window.dataLayer` через `lib/analytics.ts` → `pushDataLayerEvent`:

| Событие | Когда | Параметры |
|---|---|---|
| `task_created` | создание задачи | `task_id`, `column_id`, `column_name`, `has_due_date`, `has_tag` |
| `task_moved` | перемещение между колонками | `task_id`, `from_column_id`, `from_column_name`, `to_column_id`, `to_column_name` |
| `task_deleted` | удаление задачи | `task_id`, `column_id`, `column_name` |

## Деплой (бесплатно)

1. Создать пустой репозиторий на GitHub и запушить проект.
2. Зайти на [vercel.com](https://vercel.com) через "Continue with GitHub", импортировать репозиторий.
3. В проекте на Vercel: **Storage → Create Database → Postgres** — подключится автоматически, `DATABASE_URL` появится в Environment Variables.
4. Добавить `NEXT_PUBLIC_GTM_ID` в Environment Variables проекта (после создания GTM-контейнера, см. ниже).
5. Задеплоить. После первого деплоя миграции нужно применить к прод-базе: `npx prisma migrate deploy` (локально, с `DATABASE_URL` от прод-базы) или через Vercel Postgres UI → Query.
6. Прогнать `npm run db:seed` с прод-`DATABASE_URL`, чтобы создать дефолтную доску.

## Настройка аналитики

1. **GA4**: создать property в Google Analytics → получить Measurement ID (`G-XXXXXXX`).
2. **GTM**: создать контейнер → получить Container ID (`GTM-XXXXXXX`); внутри настроить:
   - тег GA4 Configuration (Measurement ID из шага 1), триггер "All Pages";
   - тег Яндекс.Метрики (шаблон из галереи или Custom HTML), триггер "All Pages".
3. **Яндекс.Метрика**: создать счётчик в Яндекс.Метрике → ID вставить в тег GTM из шага 2.
4. Вставить `NEXT_PUBLIC_GTM_ID` в `.env.local` и в Environment Variables на Vercel.
5. Проверить через GTM Preview mode: теги GA4/Метрики стреляют на загрузке, кастомные события (`task_created` и т.д.) видны в списке событий со своими параметрами.
