-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('tiktok', 'instagram', 'youtube', 'linkedin', 'x', 'facebook');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('owner', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('free', 'pro', 'business');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('active', 'expiring', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'generating', 'rendering', 'ready', 'publishing', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "RenderProvider" AS ENUM ('veo', 'canvas');

-- CreateEnum
CREATE TYPE "RenderState" AS ENUM ('queued', 'processing', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "PostState" AS ENUM ('queued', 'posted', 'retry', 'failed');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'owner',
    "plan" "PlanTier" NOT NULL DEFAULT 'free',
    "postQuota" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "remoteUserId" TEXT NOT NULL,
    "handle" TEXT,
    "tokenRef" TEXT NOT NULL,
    "scopes" TEXT[],
    "status" "ConnectionStatus" NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_kits" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "voice" TEXT,
    "logoUrl" TEXT,
    "colors" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "brandKitId" TEXT,
    "product" TEXT NOT NULL,
    "description" TEXT,
    "platforms" "Platform"[],
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "topHook" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hooks" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "angle" TEXT,
    "script" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renders" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "hookId" TEXT,
    "ratio" TEXT NOT NULL,
    "provider" "RenderProvider" NOT NULL DEFAULT 'veo',
    "state" "RenderState" NOT NULL DEFAULT 'queued',
    "storageUrl" TEXT,
    "durationS" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "hookId" TEXT,
    "renderId" TEXT,
    "platform" "Platform" NOT NULL,
    "caption" TEXT,
    "state" "PostState" NOT NULL DEFAULT 'queued',
    "scheduledAt" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "remoteId" TEXT,
    "permalink" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight_snapshots" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "insight_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_runs" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "refId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "job_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_accountId_idx" ON "sessions"("accountId");

-- CreateIndex
CREATE INDEX "connections_accountId_idx" ON "connections"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "connections_accountId_platform_remoteUserId_key" ON "connections"("accountId", "platform", "remoteUserId");

-- CreateIndex
CREATE INDEX "brand_kits_accountId_idx" ON "brand_kits"("accountId");

-- CreateIndex
CREATE INDEX "campaigns_accountId_idx" ON "campaigns"("accountId");

-- CreateIndex
CREATE INDEX "hooks_campaignId_idx" ON "hooks"("campaignId");

-- CreateIndex
CREATE INDEX "renders_campaignId_idx" ON "renders"("campaignId");

-- CreateIndex
CREATE INDEX "posts_campaignId_idx" ON "posts"("campaignId");

-- CreateIndex
CREATE INDEX "posts_connectionId_idx" ON "posts"("connectionId");

-- CreateIndex
CREATE INDEX "posts_state_idx" ON "posts"("state");

-- CreateIndex
CREATE INDEX "insight_snapshots_postId_idx" ON "insight_snapshots"("postId");

-- CreateIndex
CREATE INDEX "insight_snapshots_capturedAt_idx" ON "insight_snapshots"("capturedAt");

-- CreateIndex
CREATE INDEX "job_runs_kind_idx" ON "job_runs"("kind");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_kits" ADD CONSTRAINT "brand_kits_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_brandKitId_fkey" FOREIGN KEY ("brandKitId") REFERENCES "brand_kits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hooks" ADD CONSTRAINT "hooks_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renders" ADD CONSTRAINT "renders_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renders" ADD CONSTRAINT "renders_hookId_fkey" FOREIGN KEY ("hookId") REFERENCES "hooks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_hookId_fkey" FOREIGN KEY ("hookId") REFERENCES "hooks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_renderId_fkey" FOREIGN KEY ("renderId") REFERENCES "renders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_snapshots" ADD CONSTRAINT "insight_snapshots_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
