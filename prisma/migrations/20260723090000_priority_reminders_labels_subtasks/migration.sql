-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "offsetMinutes" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Label_name_key" ON "Label"("name");

-- CreateTable
CREATE TABLE "TaskLabel" (
    "taskId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "TaskLabel_pkey" PRIMARY KEY ("taskId", "labelId")
);

-- CreateTable
CREATE TABLE "Subtask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskLabel" ADD CONSTRAINT "TaskLabel_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskLabel" ADD CONSTRAINT "TaskLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: перенести reminderSentAt в Reminder (offsetMinutes = 0 = "вовремя",
-- сохраняем текущее состояние отправки один-в-один) ДО того как колонка будет удалена.
INSERT INTO "Reminder" ("id", "taskId", "offsetMinutes", "sentAt", "createdAt")
SELECT md5(random()::text || clock_timestamp()::text), "id", 0, "reminderSentAt", now()
FROM "Task"
WHERE "dueDate" IS NOT NULL;

-- DataMigration: перенести tag в Label + TaskLabel ДО того как колонка будет удалена.
INSERT INTO "Label" ("id", "name", "color")
SELECT md5(random()::text || clock_timestamp()::text), t."tag", '#6366f1'
FROM (SELECT DISTINCT "tag" FROM "Task" WHERE "tag" IS NOT NULL) t;

INSERT INTO "TaskLabel" ("taskId", "labelId")
SELECT task."id", label."id"
FROM "Task" task
JOIN "Label" label ON label."name" = task."tag"
WHERE task."tag" IS NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "priority" TEXT;
ALTER TABLE "Task" DROP COLUMN "tag";
ALTER TABLE "Task" DROP COLUMN "reminderSentAt";
