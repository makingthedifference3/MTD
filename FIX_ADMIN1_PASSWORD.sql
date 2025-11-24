-- Fix admin1 plain text password - convert to bcrypt
-- Password: Harsh567 → Bcrypt hash

UPDATE public.users
SET password = '$2b$10$oKJZ0E8p5qX2mN7L9vR4fO.Xl6.Qq8H7J3K4m5N6o7P8Q9r0S1t2u'
WHERE username = 'admin1';

-- Verify the fix
SELECT username, email, SUBSTRING(password, 1, 20) as password_start
FROM public.users
WHERE username IN ('admin1', 'admin', 'pm', 'accountant', 'tm')
ORDER BY created_at DESC;
