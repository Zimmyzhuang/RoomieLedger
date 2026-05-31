-- Create groups table and backfill existing data into a default group
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🏠',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Group" ("id", "name", "emoji") VALUES ('seed-apt-4b', 'Apt 4B', '🏠');

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Roommate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#64748b',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Roommate_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Roommate" ("id", "groupId", "name", "handle", "color", "createdAt")
SELECT "id", 'seed-apt-4b', "name", "handle", "color", "createdAt" FROM "Roommate";
DROP TABLE "Roommate";
ALTER TABLE "new_Roommate" RENAME TO "Roommate";
CREATE UNIQUE INDEX "Roommate_groupId_handle_key" ON "Roommate"("groupId", "handle");

CREATE TABLE "new_Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "paidById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expense_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Expense_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "Roommate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("id", "groupId", "title", "amount", "category", "paidById", "createdAt")
SELECT "id", 'seed-apt-4b', "title", "amount", "category", "paidById", "createdAt" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";

CREATE TABLE "new_Settlement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "settledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Settlement_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Settlement_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Roommate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Settlement_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Roommate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Settlement" ("id", "groupId", "payerId", "receiverId", "amount", "settledAt")
SELECT "id", 'seed-apt-4b', "payerId", "receiverId", "amount", "settledAt" FROM "Settlement";
DROP TABLE "Settlement";
ALTER TABLE "new_Settlement" RENAME TO "Settlement";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
