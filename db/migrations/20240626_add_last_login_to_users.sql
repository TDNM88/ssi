-- Add last_login column to users table
ALTER TABLE users 
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;

-- Update existing users with a default last login time (current timestamp)
UPDATE users 
SET last_login = NOW() 
WHERE last_login IS NULL;
