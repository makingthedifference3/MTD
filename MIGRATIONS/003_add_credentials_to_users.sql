-- Update existing users with username and hashed passwords
-- This adds credentials to any existing users in the table

UPDATE public.users 
SET 
  username = 'admin',
  password = '$2b$10$HjwZ8E1W993LIhrXxl/90.Fr2oJNdHuy5GJPmASnCUTPfLt3UNtqa'
WHERE id = (SELECT id FROM public.users ORDER BY created_at DESC LIMIT 1 OFFSET 3);

UPDATE public.users 
SET 
  username = 'accountant',
  password = '$2b$10$G/t9tZyyzqmXttU.YbDK5O.g/sEs5VLEQogcDK3215zFQoNOW6rxW'
WHERE id = (SELECT id FROM public.users ORDER BY created_at DESC LIMIT 1 OFFSET 2);

UPDATE public.users 
SET 
  username = 'pm',
  password = '$2b$10$MG7XOqI1Hus1eCqyo8FI6Oldhnc0OQY1UoaWP4X3Mzt.6WeX5GxwC'
WHERE id = (SELECT id FROM public.users ORDER BY created_at DESC LIMIT 1 OFFSET 1);

UPDATE public.users 
SET 
  username = 'tm',
  password = '$2b$10$C4Dfy.k1oP3wFQYXP.ASAO.ZGziv2pY6O1klAz04DmZsZBcaKlsMW'
WHERE id = (SELECT id FROM public.users ORDER BY created_at DESC LIMIT 1 OFFSET 0);

-- OR if you want to insert completely new users, use this instead:
-- INSERT INTO public.users (email, full_name, username, password, role, is_active) 
-- VALUES 
--   ('admin@mtd.com', 'Admin User', 'admin', '$2b$10$HjwZ8E1W993LIhrXxl/90.Fr2oJNdHuy5GJPmASnCUTPfLt3UNtqa', 'admin', true),
--   ('accountant@mtd.com', 'Accountant User', 'accountant', '$2b$10$G/t9tZyyzqmXttU.YbDK5O.g/sEs5VLEQogcDK3215zFQoNOW6rxW', 'accountant', true),
--   ('pm@mtd.com', 'Project Manager', 'pm', '$2b$10$MG7XOqI1Hus1eCqyo8FI6Oldhnc0OQY1UoaWP4X3Mzt.6WeX5GxwC', 'project_manager', true),
--   ('tm@mtd.com', 'Team Member', 'tm', '$2b$10$C4Dfy.k1oP3wFQYXP.ASAO.ZGziv2pY6O1klAz04DmZsZBcaKlsMW', 'team_member', true);
