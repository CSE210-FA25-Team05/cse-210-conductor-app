/*
  Warnings:

  - You are about to drop the column `student_id` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `journals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lecture_id,user_id]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `journals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_student_id_fkey";

-- DropForeignKey
ALTER TABLE "journals" DROP CONSTRAINT "journals_student_id_fkey";

-- DropIndex
DROP INDEX "attendances_lecture_id_student_id_key";

-- AlterTable
ALTER TABLE "attendances" RENAME COLUMN "student_id" TO "user_id";

-- AlterTable
ALTER TABLE "journals" RENAME COLUMN "student_id" TO "user_id";

-- CreateIndex
CREATE UNIQUE INDEX "attendances_lecture_id_user_id_key" ON "attendances"("lecture_id", "user_id");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
