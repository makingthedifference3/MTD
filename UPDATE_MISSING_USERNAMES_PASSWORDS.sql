-- SQL Script to fill missing usernames and passwords for users
-- Run this in Supabase SQL Editor

-- Update Lokesh Joshi
UPDATE public.users 
SET username = 'lokesh', 
    password = '$2b$10$mKj9N8p7qL2r5X8vY9mK2e5K3m7q9s2v4w6x8z0a2c4e6g8i0k2m'
WHERE email = 'lokesh@mtd.com' AND username IS NULL;

-- Update Priya Sharma
UPDATE public.users 
SET username = 'priya', 
    password = '$2b$10$nL3o6P2qR9s4T7u0V3w6X9y2Z5a8b1c4d7e0f3g6h9i2j5k8l1m4n'
WHERE email = 'priya@mtd.com' AND username IS NULL;

-- Update Rahul Verma
UPDATE public.users 
SET username = 'rahul', 
    password = '$2b$10$o8M5n2K9p6Q3r0S7t4U1v2W5x8Y1z4A7b0C3d6E9f2G5h8I1j4K7l'
WHERE email = 'rahul@mtd.com' AND username IS NULL;

-- Update Sneha Patel
UPDATE public.users 
SET username = 'sneha', 
    password = '$2b$10$p9N6o3L0q7R4s1T8u5V2w3X6y9Z2a5B8c1D4e7F0g3H6i9J2k5L8m'
WHERE email = 'sneha@mtd.com' AND username IS NULL;

-- Update Anjali Desai
UPDATE public.users 
SET username = 'anjali', 
    password = '$2b$10$q0O7p4M1r8S5t2U9v6W3x4Y7z0A3b6C9d2E5f8G1h4I7j0K3l6M9n'
WHERE email = 'anjali@mtd.com' AND username IS NULL;

-- Update Vikram Singh
UPDATE public.users 
SET username = 'vikram', 
    password = '$2b$10$r1P8q5N2s9T6u3V0w7X4y5Z8a1B4c7D0e3F6g9H2i5J8k1L4m7N0o'
WHERE email = 'vikram@mtd.com' AND username IS NULL;

-- Update Kavita Nair
UPDATE public.users 
SET username = 'kavita', 
    password = '$2b$10$s2Q9r6O3t0U7v4W1x8Y5z6A9b2C5d8E1f4G7h0I3j6K9l2M5n8O1p'
WHERE email = 'kavita@mtd.com' AND username IS NULL;

-- Update Amit Bhardwaj
UPDATE public.users 
SET username = 'amit', 
    password = '$2b$10$t3R0s7P4u1V8w5X2y9Z6a7B0c3D6e9F2g5H8i1J4k7L0m3N6o9P2q'
WHERE email = 'amit@mtd.com' AND username IS NULL;

-- Update Pooja Mehta
UPDATE public.users 
SET username = 'pooja', 
    password = '$2b$10$u4S1t8Q5v2W9x6Y3z0A7b8C1d4E7f0G3h6I9j2K5l8M1n4O7p0Q3r'
WHERE email = 'pooja@mtd.com' AND username IS NULL;

-- Verify all users now have username and password
SELECT id, email, full_name, username, password, is_active 
FROM public.users 
WHERE username IS NULL OR password IS NULL;
