/*
  Warnings:

  - Added the required column `username` to the `UserChatStats` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserChatStats" (
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "userCount" INTEGER NOT NULL,
    "loserCount" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "chatId"),
    CONSTRAINT "UserChatStats_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserChatStats" ("chatId", "loserCount", "userCount", "userId") SELECT "chatId", "loserCount", "userCount", "userId" FROM "UserChatStats";
DROP TABLE "UserChatStats";
ALTER TABLE "new_UserChatStats" RENAME TO "UserChatStats";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
