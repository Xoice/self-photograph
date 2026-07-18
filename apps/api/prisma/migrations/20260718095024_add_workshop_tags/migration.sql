-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_workshops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "summary" TEXT,
    "content" TEXT,
    "cover_image" TEXT,
    "price_text" TEXT,
    "price_cents" INTEGER,
    "location" TEXT,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "capacity" INTEGER,
    "enrolled_count" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT,
    "duration_text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_workshops" ("capacity", "content", "cover_image", "created_at", "duration_text", "end_date", "enrolled_count", "id", "is_featured", "is_published", "level", "location", "price_cents", "price_text", "slug", "sort_order", "start_date", "status", "subtitle", "summary", "title", "updated_at") SELECT "capacity", "content", "cover_image", "created_at", "duration_text", "end_date", "enrolled_count", "id", "is_featured", "is_published", "level", "location", "price_cents", "price_text", "slug", "sort_order", "start_date", "status", "subtitle", "summary", "title", "updated_at" FROM "workshops";
DROP TABLE "workshops";
ALTER TABLE "new_workshops" RENAME TO "workshops";
CREATE UNIQUE INDEX "workshops_slug_key" ON "workshops"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
