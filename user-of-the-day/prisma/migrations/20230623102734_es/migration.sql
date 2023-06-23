/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserChatStats" (
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "userCount" INTEGER NOT NULL,
    "loserCount" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "chatId"),
    CONSTRAINT "UserChatStats_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserChatStats" ("chatId", "loserCount", "userCount", "userId") SELECT "chatId", "loserCount", "userCount", "userId" FROM "UserChatStats";
DROP TABLE "UserChatStats";
ALTER TABLE "new_UserChatStats" RENAME TO "UserChatStats";
CREATE TABLE "new_Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentUserId" INTEGER NOT NULL,
    "currentLoserId" INTEGER NOT NULL,
    "lastDrawDate" DATETIME NOT NULL
);
INSERT INTO "new_Chat" ("currentLoserId", "currentUserId", "id", "lastDrawDate") SELECT "currentLoserId", "currentUserId", "id", "lastDrawDate" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
