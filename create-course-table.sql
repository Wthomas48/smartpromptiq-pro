-- Create Course table in PostgreSQL
CREATE TABLE IF NOT EXISTS "Course" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "duration" INTEGER NOT NULL,
  "accessTier" TEXT NOT NULL DEFAULT 'free',
  "priceUSD" DECIMAL(10,2) DEFAULT 0,
  "instructor" TEXT,
  "thumbnailUrl" TEXT,
  "videoUrl" TEXT,
  "averageRating" DECIMAL(3,2) DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "enrollmentCount" INTEGER DEFAULT 0,
  "isPublished" BOOLEAN DEFAULT true,
  "isFeatured" BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert 3 sample courses to test
INSERT INTO "Course" ("id", "title", "slug", "description", "category", "difficulty", "duration", "accessTier", "isPublished", "order")
VALUES
  ('course1', 'Prompt Writing 101', 'prompt-writing-101', 'Learn the fundamentals of prompt engineering and how to write effective prompts for AI models.', 'prompt-engineering', 'beginner', 120, 'free', true, 1),
  ('course2', 'Advanced Prompt Engineering', 'advanced-prompt-engineering', 'Master advanced techniques for creating complex prompts and getting better results from AI.', 'prompt-engineering', 'advanced', 180, 'pro', true, 2),
  ('course3', 'SmartPromptIQ Mastery', 'smartpromptiq-mastery', 'Complete guide to using SmartPromptIQ for business and personal projects.', 'smartpromptiq', 'intermediate', 150, 'smartpromptiq_included', true, 3);
