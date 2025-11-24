-- Insert test users with hashed passwords and credentials
-- Generated: 2025-11-22
-- These are the test credentials you can use to login

INSERT INTO public.users (email, full_name, username, password, role, is_active) 
VALUES 
  ('admin@mtd.com', 'Admin User', 'admin', '$2b$10$HjwZ8E1W993LIhrXxl/90.Fr2oJNdHuy5GJPmASnCUTPfLt3UNtqa', 'admin', true),
  ('accountant@mtd.com', 'Accountant User', 'accountant', '$2b$10$G/t9tZyyzqmXttU.YbDK5O.g/sEs5VLEQogcDK3215zFQoNOW6rxW', 'accountant', true),
  ('pm@mtd.com', 'Project Manager', 'pm', '$2b$10$MG7XOqI1Hus1eCqyo8FI6Oldhnc0OQY1UoaWP4X3Mzt.6WeX5GxwC', 'project_manager', true),
  ('tm@mtd.com', 'Team Member', 'tm', '$2b$10$C4Dfy.k1oP3wFQYXP.ASAO.ZGziv2pY6O1klAz04DmZsZBcaKlsMW', 'team_member', true);

-- Login credentials:
-- Username: admin, Password: admin123
-- Username: accountant, Password: acc123
-- Username: pm, Password: pm123
-- Username: tm, Password: tm123
