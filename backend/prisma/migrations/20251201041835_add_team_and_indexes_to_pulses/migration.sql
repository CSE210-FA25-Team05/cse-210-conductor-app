-- AlterTable
ALTER TABLE "pulses" ADD COLUMN     "team_id" INTEGER;

-- CreateIndex
CREATE INDEX "pulses_course_id_created_at_idx" ON "pulses"("course_id", "created_at");

-- CreateIndex
CREATE INDEX "pulses_course_id_user_id_created_at_idx" ON "pulses"("course_id", "user_id", "created_at");

-- CreateIndex
CREATE INDEX "pulses_course_id_team_id_created_at_idx" ON "pulses"("course_id", "team_id", "created_at");

-- CreateIndex
CREATE INDEX "pulses_course_id_value_created_at_idx" ON "pulses"("course_id", "value", "created_at");

-- AddForeignKey
ALTER TABLE "pulses" ADD CONSTRAINT "pulses_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
