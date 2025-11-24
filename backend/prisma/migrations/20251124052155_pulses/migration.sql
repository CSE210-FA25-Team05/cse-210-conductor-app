-- CreateTable
CREATE TABLE "pulse_configs" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "is_editable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "pulse_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulses" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pulse_config_id" INTEGER NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pulses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pulse_configs" ADD CONSTRAINT "pulse_configs_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pulses" ADD CONSTRAINT "pulses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pulses" ADD CONSTRAINT "pulses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pulses" ADD CONSTRAINT "pulses_pulse_config_id_fkey" FOREIGN KEY ("pulse_config_id") REFERENCES "pulse_configs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
