-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "aiTone" TEXT NOT NULL DEFAULT 'sarcastique',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSeries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tmdbSeriesId" INTEGER NOT NULL,
    "seriesName" TEXT NOT NULL,
    "posterPath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TO_WATCH',
    "currentSeason" INTEGER NOT NULL DEFAULT 0,
    "currentEpisode" INTEGER NOT NULL DEFAULT 0,
    "totalSeasons" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISummary" (
    "id" TEXT NOT NULL,
    "userSeriesId" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "tone" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AISummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedProfile" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserSeries_userId_idx" ON "UserSeries"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSeries_userId_tmdbSeriesId_key" ON "UserSeries"("userId", "tmdbSeriesId");

-- CreateIndex
CREATE INDEX "AISummary_userSeriesId_idx" ON "AISummary"("userSeriesId");

-- CreateIndex
CREATE UNIQUE INDEX "AISummary_userSeriesId_seasonNumber_tone_key" ON "AISummary"("userSeriesId", "seasonNumber", "tone");

-- CreateIndex
CREATE UNIQUE INDEX "SharedProfile_shareToken_key" ON "SharedProfile"("shareToken");

-- CreateIndex
CREATE INDEX "SharedProfile_ownerId_idx" ON "SharedProfile"("ownerId");

-- AddForeignKey
ALTER TABLE "UserSeries" ADD CONSTRAINT "UserSeries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISummary" ADD CONSTRAINT "AISummary_userSeriesId_fkey" FOREIGN KEY ("userSeriesId") REFERENCES "UserSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedProfile" ADD CONSTRAINT "SharedProfile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
