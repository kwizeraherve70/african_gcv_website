-- Net-new News model + NewsCategory enum for the frontend's News & Media
-- country hub. Parallel to the existing Blog model, not a repurposing of
-- it — see the schema.prisma comment above the News model for why.
CREATE TYPE "NewsCategory" AS ENUM ('PI_NETWORK', 'GCV_MOVEMENT', 'EVENTS', 'COMMUNITY');

CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT NOT NULL,
    "category" "NewsCategory" NOT NULL,
    "author" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readTime" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");
