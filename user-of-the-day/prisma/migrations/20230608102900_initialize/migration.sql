-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentUserId" INTEGER NOT NULL,
    "currentLoserId" INTEGER NOT NULL,
    "lastDrawDate" DATETIME NOT NULL,
    CONSTRAINT "Chat_currentUserId_fkey" FOREIGN KEY ("currentUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_currentLoserId_fkey" FOREIGN KEY ("currentLoserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserChatStats" (
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "userCount" INTEGER NOT NULL,
    "loserCount" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "chatId"),
    CONSTRAINT "UserChatStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserChatStats_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
