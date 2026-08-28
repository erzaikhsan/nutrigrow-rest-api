-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "enum_users_role" AS ENUM ('Parent', 'Officer', 'Admin');

-- CreateEnum
CREATE TYPE "enum_region" AS ENUM ('RW1', 'RW2', 'RW3', 'RW4', 'RW5', 'Village');

-- CreateEnum
CREATE TYPE "enum_gender" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "enum_wfa_status" AS ENUM ('Severely Underweight', 'Underweight', 'Normal', 'Overweight and Obese', 'Unknown');

-- CreateEnum
CREATE TYPE "enum_hfa_status" AS ENUM ('Severely Stunted', 'Stunted', 'Normal', 'Unknown');

-- CreateEnum
CREATE TYPE "enum_wfh_status" AS ENUM ('Severely Wasting', 'Wasting', 'Normal', 'Overweight and Obese', 'Unknown');

-- CreateEnum
CREATE TYPE "enum_muac_status" AS ENUM ('Gizi Buruk Akut', 'Gizi Kurang Akut', 'Normal', 'Tidak Berlaku');

-- CreateEnum
CREATE TYPE "enum_hca_status" AS ENUM ('Mikrosefali', 'Normal', 'Makrosefali', 'Unknown');

-- CreateEnum
CREATE TYPE "enum_weight_gain_status" AS ENUM ('N', 'T', 'O', 'B');

-- CreateEnum
CREATE TYPE "enum_child_status" AS ENUM ('ACTIVE', 'GRADUATED', 'MOVED_OUT', 'DECEASED');

-- CreateEnum
CREATE TYPE "enum_audit_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "enum_users_role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "full_name" VARCHAR(100) NOT NULL,
    "gender" "enum_gender" NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "region" "enum_region" NOT NULL,
    "active_period" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "children_id" UUID NOT NULL,
    "parents_id" UUID NOT NULL,
    "nik" VARCHAR(16),
    "full_name" VARCHAR(75) NOT NULL,
    "gender" "enum_gender" NOT NULL,
    "place_of_birth" VARCHAR(100) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "father" VARCHAR(100),
    "mother" VARCHAR(100),
    "order_of_child" SMALLINT NOT NULL,
    "region" "enum_region" NOT NULL,
    "status" "enum_child_status" NOT NULL DEFAULT 'ACTIVE',
    "birth_weight" DOUBLE PRECISION NOT NULL,
    "birth_height" DOUBLE PRECISION NOT NULL,
    "birth_head_circum" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("children_id")
);

-- CreateTable
CREATE TABLE "growth" (
    "id" UUID NOT NULL,
    "children_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "period" CHAR(7),
    "age" SMALLINT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "head_circum" DOUBLE PRECISION NOT NULL,
    "arm_circum" DOUBLE PRECISION NOT NULL,
    "wfa_zscore" DOUBLE PRECISION,
    "hfa_zscore" DOUBLE PRECISION,
    "wfh_zscore" DOUBLE PRECISION,
    "head_circum_zscore" DOUBLE PRECISION,
    "wfa_status" "enum_wfa_status" NOT NULL,
    "hfa_status" "enum_hfa_status" NOT NULL,
    "wfh_status" "enum_wfh_status" NOT NULL,
    "muac_status" "enum_muac_status" NOT NULL,
    "head_circum_status" "enum_hca_status" NOT NULL,
    "weight_gain" DOUBLE PRECISION,
    "gain_status" "enum_weight_gain_status" NOT NULL,
    "consecutive_no_gain" SMALLINT NOT NULL DEFAULT 0,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "flag_reason" VARCHAR(255),
    "note" VARCHAR(255),
    "measured_by" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "growth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccines" (
    "id" UUID NOT NULL,
    "children_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "vaccine_name" VARCHAR(100) NOT NULL,
    "place" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "vaccines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "place" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "region" "enum_region" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_requests" (
    "id" UUID NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "code_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "attempts" SMALLINT NOT NULL DEFAULT 0,
    "consumed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" "enum_audit_action" NOT NULL,
    "entity" VARCHAR(40) NOT NULL,
    "entity_id" VARCHAR(64) NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_region_idx" ON "users"("role", "region");

-- CreateIndex
CREATE INDEX "users_role_full_name_idx" ON "users"("role", "full_name");

-- CreateIndex
CREATE UNIQUE INDEX "children_nik_key" ON "children"("nik");

-- CreateIndex
CREATE INDEX "children_parents_id_idx" ON "children"("parents_id");

-- CreateIndex
CREATE INDEX "children_region_status_idx" ON "children"("region", "status");

-- CreateIndex
CREATE INDEX "children_region_full_name_idx" ON "children"("region", "full_name");

-- CreateIndex
CREATE UNIQUE INDEX "children_parent_order_unique" ON "children"("parents_id", "order_of_child");

-- CreateIndex
CREATE INDEX "growth_children_id_date_idx" ON "growth"("children_id", "date" DESC);

-- CreateIndex
CREATE INDEX "growth_date_idx" ON "growth"("date");

-- CreateIndex
CREATE INDEX "growth_period_idx" ON "growth"("period");

-- CreateIndex
CREATE UNIQUE INDEX "growth_child_period_unique" ON "growth"("children_id", "period");

-- CreateIndex
CREATE INDEX "vaccines_children_id_date_idx" ON "vaccines"("children_id", "date" DESC);

-- CreateIndex
CREATE INDEX "events_region_date_idx" ON "events"("region", "date");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "events"("date");

-- CreateIndex
CREATE INDEX "otp_requests_email_created_at_idx" ON "otp_requests"("email", "created_at" DESC);

-- CreateIndex
CREATE INDEX "otp_requests_expires_at_idx" ON "otp_requests"("expires_at");

-- CreateIndex
CREATE INDEX "password_resets_user_id_created_at_idx" ON "password_resets"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "password_resets_expires_at_idx" ON "password_resets"("expires_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_created_at_idx" ON "audit_logs"("entity", "entity_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_parents_id_fkey" FOREIGN KEY ("parents_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth" ADD CONSTRAINT "growth_children_id_fkey" FOREIGN KEY ("children_id") REFERENCES "children"("children_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth" ADD CONSTRAINT "growth_measured_by_fkey" FOREIGN KEY ("measured_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccines" ADD CONSTRAINT "vaccines_children_id_fkey" FOREIGN KEY ("children_id") REFERENCES "children"("children_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

