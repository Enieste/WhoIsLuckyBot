-- AlterTable
ALTER TABLE "UserChatStats" ADD COLUMN "firstName_transient" TEXT;

-- CreateTable
CREATE TABLE "UserChatStats_dg_tmp" (
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "username_transient" TEXT,
    "userCount" INTEGER NOT NULL,
    "loserCount" INTEGER NOT NULL,
    "deactivated_at" DATETIME,
    "firstName_transient" TEXT,
    "column_name" INTEGER,

    PRIMARY KEY ("userId", "chatId"),
    CONSTRAINT "UserChatStats_dg_tmp_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
