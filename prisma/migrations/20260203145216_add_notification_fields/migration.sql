-- AlterTable
ALTER TABLE "TaskTemplate" ADD COLUMN "ownerEmail" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActiveTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "joinerId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isNotified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" DATETIME,
    "completedDate" DATETIME,
    CONSTRAINT "ActiveTask_joinerId_fkey" FOREIGN KEY ("joinerId") REFERENCES "Joiner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActiveTask_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TaskTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActiveTask" ("completedDate", "dueDate", "id", "joinerId", "status", "templateId") SELECT "completedDate", "dueDate", "id", "joinerId", "status", "templateId" FROM "ActiveTask";
DROP TABLE "ActiveTask";
ALTER TABLE "new_ActiveTask" RENAME TO "ActiveTask";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
