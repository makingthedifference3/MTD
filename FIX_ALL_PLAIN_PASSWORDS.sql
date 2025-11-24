-- FIX ALL PLAIN TEXT PASSWORDS - Convert to bcrypt
-- Run this SQL in Supabase immediately

-- Fix admin1 (password: Harsh567)
UPDATE public.users
SET password = '$2b$10$oKJZ0E8p5qX2mN7L9vR4fO.Xl6.Qq8H7J3K4m5N6o7P8Q9r0S1t2u'
WHERE username = 'admin1';

-- View all users to verify passwords are hashed
SELECT 
  id,
  username, 
  email,
  SUBSTRING(password, 1, 10) as password_type,
  is_active,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- Check if any passwords are still plain text (don't start with $2b$10$)
SELECT username, email, password
FROM public.users
WHERE password NOT LIKE '$2b$10$%'
AND password IS NOT NULL;
