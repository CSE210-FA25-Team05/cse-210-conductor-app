-- CreateTable
CREATE TABLE "journals" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "content" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
