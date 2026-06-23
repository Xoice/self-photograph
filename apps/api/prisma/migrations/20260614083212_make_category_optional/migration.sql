-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_gallery_works" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "cover_image" TEXT NOT NULL,
    "thumbnail_image" TEXT,
    "shoot_date" DATETIME,
    "location" TEXT,
    "camera_info" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "category_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "gallery_works_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "gallery_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_gallery_works" ("camera_info", "category_id", "cover_image", "created_at", "description", "id", "is_featured", "is_published", "location", "shoot_date", "slug", "sort_order", "summary", "thumbnail_image", "title", "updated_at") SELECT "camera_info", "category_id", "cover_image", "created_at", "description", "id", "is_featured", "is_published", "location", "shoot_date", "slug", "sort_order", "summary", "thumbnail_image", "title", "updated_at" FROM "gallery_works";
DROP TABLE "gallery_works";
ALTER TABLE "new_gallery_works" RENAME TO "gallery_works";
CREATE UNIQUE INDEX "gallery_works_slug_key" ON "gallery_works"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
