-- Add visualTheme column to User table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'visualTheme') THEN
        ALTER TABLE "User" ADD COLUMN "visualTheme" TEXT NOT NULL DEFAULT 'classic';
    END IF;
END $$;
