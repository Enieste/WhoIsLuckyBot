/*
  Warnings:

  - You are about to drop the column `lastDrawDate` on the `Chat` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentUserId" INTEGER,
    "currentLoserId" INTEGER,
    "lastWinnerDrawDate" DATETIME,
    "lastLoserDrawDate" DATETIME
);
INSERT INTO "new_Chat" ("currentLoserId", "currentUserId", "id") SELECT "currentLoserId", "currentUserId", "id" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
