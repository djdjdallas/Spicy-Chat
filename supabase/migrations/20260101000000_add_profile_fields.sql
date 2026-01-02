-- Migration: Add missing profile fields for Poise app
-- This migration adds preferred_platforms and updates enum values

-- Add preferred_platforms column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_platforms text[] DEFAULT '{}';

-- Update relationship_goal column to support new values (if it's an enum, we need to modify it)
-- Since it's stored as text, we just need to ensure the column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_goal text DEFAULT 'not_sure_yet';

-- Ensure communication_style column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS communication_style text DEFAULT 'casual_friendly';

-- Ensure all other expected columns exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hobbies text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS values text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_profile_complete boolean DEFAULT false;

-- Create index for faster user profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);

-- Add comment to document valid values
COMMENT ON COLUMN profiles.relationship_goal IS 'Valid values: not_sure_yet, long_term_relationship, casual_dating, friendship, enm_exploration, polyamory';
COMMENT ON COLUMN profiles.communication_style IS 'Valid values: casual_friendly, direct_straightforward, thoughtful_reserved, playful_humorous, flirtatious';
COMMENT ON COLUMN profiles.preferred_platforms IS 'Array of platforms: feeld, tinder, hinge, bumble, okcupid, 3fun, other';
