-- AlterTable
ALTER TABLE "Task" ADD COLUMN "reminderSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: не дать уже просроченным задачам устроить лавину напоминаний в
-- момент включения фичи. Сдвиг на 180 минут — тот же TASK_TZ_OFFSET_MINUTES,
-- что и в lib/push.ts, потому что dueDate хранится как введённые пользователем
-- числа "как есть", а не как настоящий UTC-момент.
UPDATE "Task" SET "reminderSentAt" = now()
WHERE "dueDate" < (now() + interval '180 minutes') AND "reminderSentAt" IS NULL;
