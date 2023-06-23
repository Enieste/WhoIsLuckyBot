-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentUserId" INTEGER,
    "currentLoserId" INTEGER,
    "lastDrawDate" DATETIME
);
INSERT INTO "new_Chat" ("currentLoserId", "currentUserId", "id", "lastDrawDate") SELECT "currentLoserId", "currentUserId", "id", "lastDrawDate" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
