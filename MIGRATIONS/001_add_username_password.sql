-- Add username and password columns to users table
-- Password will be hashed with bcrypt (salt rounds: 10) before storing in DB
-- Run this in your Supabase SQL editor

ALTER TABLE public.users 
ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL;

ALTER TABLE public.users 
ADD COLUMN password VARCHAR(255) NOT NULL;

-- Create an index on username for faster lookups
CREATE INDEX idx_users_username ON public.users(username);

-- Example test data (passwords should be hashed in production):
-- INSERT INTO public.users (email, full_name, username, password, role, is_active)
-- VALUES 
--   ('admin@mtd.com', 'Admin User', 'admin', '$2b$10$...hashed_password...', 'admin', true),
--   ('accountant@mtd.com', 'Accountant User', 'accountant', '$2b$10$...hashed_password...', 'accountant', true),
--   ('pm@mtd.com', 'Project Manager', 'pm', '$2b$10$...hashed_password...', 'project_manager', true),
--   ('tm@mtd.com', 'Team Member', 'tm', '$2b$10$...hashed_password...', 'team_member', true);
CREATE INDEX idx_users_username ON public.users(username);

-- Update RLS policy if needed (depending on your setup)
-- Users should only be able to view/edit their own credentials
