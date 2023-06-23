-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserChatStats" (
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "username" TEXT,
    "userCount" INTEGER NOT NULL,
    "loserCount" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "chatId"),
    CONSTRAINT "UserChatStats_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserChatStats" ("chatId", "loserCount", "userCount", "userId", "username") SELECT "chatId", "loserCount", "userCount", "userId", "username" FROM "UserChatStats";
DROP TABLE "UserChatStats";
ALTER TABLE "new_UserChatStats" RENAME TO "UserChatStats";
ALTER TABLE "UserChatStats" RENAME COLUMN "username" TO "username_transient";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
