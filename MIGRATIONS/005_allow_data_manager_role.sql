-- Allow 'data_manager' role in users.role constraint
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'accountant', 'project_manager', 'team_member', 'client', 'data_manager'));
