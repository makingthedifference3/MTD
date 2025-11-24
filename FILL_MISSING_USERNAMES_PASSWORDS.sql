-- SQL Script to update missing usernames and passwords
-- Run this in Supabase SQL Editor
-- All passwords use bcryptjs hashing (10 rounds)

-- Update lokesh
UPDATE public.users
SET username = 'lokesh',
    password = '$2b$10$HnC8H4RheYua27DOTt7jSOD/4xwaRVuHr2emYNOpWVOoX3YqXiy.a'
WHERE email = 'lokesh@mtd.com' AND username IS NULL;

-- Update priya
UPDATE public.users
SET username = 'priya',
    password = '$2b$10$4YaIIiFFJGL6F53M4ttEd.6oGQaJhvmHHtlX5J8IkbLeneIX/xqki'
WHERE email = 'priya@mtd.com' AND username IS NULL;

-- Update rahul
UPDATE public.users
SET username = 'rahul',
    password = '$2b$10$HQ6ynuPdhK7d5v081/mHMeCbukKjWZPOcC60AR9Pqv7BMU.8PWsx.'
WHERE email = 'rahul@mtd.com' AND username IS NULL;

-- Update sneha
UPDATE public.users
SET username = 'sneha',
    password = '$2b$10$HAqjZBaL2tnMPN0BtfREj.DpDnaTkd5Z0f0h1OFZk9bDCwmlsFvOq'
WHERE email = 'sneha@mtd.com' AND username IS NULL;

-- Update anjali
UPDATE public.users
SET username = 'anjali',
    password = '$2b$10$CWgCoAuNOUnt3oZ7wPXZdO7Wa28zOsrfATY5uYsU.S8wIjp/6qOsy'
WHERE email = 'anjali@mtd.com' AND username IS NULL;

-- Update vikram
UPDATE public.users
SET username = 'vikram',
    password = '$2b$10$DDpyFhIDJ2wUwfvuTKlxOec0eh/jnOLJQPn6k5Vnmx6vrFb2vdc7e'
WHERE email = 'vikram@mtd.com' AND username IS NULL;

-- Update kavita
UPDATE public.users
SET username = 'kavita',
    password = '$2b$10$0gqNlPm3zlLT33mab1hCQ.ZFWwTl8hutJdnh0oxIYWQfbKi4CTtfa'
WHERE email = 'kavita@mtd.com' AND username IS NULL;

-- Update amit
UPDATE public.users
SET username = 'amit',
    password = '$2b$10$UeXlHNOrD2yK0aAXg/tPCOzAve9WVNoS.jjUh.Q7cgx0BMsGLrAiW'
WHERE email = 'amit@mtd.com' AND username IS NULL;

-- Update pooja
UPDATE public.users
SET username = 'pooja',
    password = '$2b$10$AbiOjH1wqBPGZAB9lbfgnOWB//ld2z.67utl6/3cKrz/WwNprSlLK'
WHERE email = 'pooja@mtd.com' AND username IS NULL;

-- Verify all users now have username and password
SELECT email, full_name, username, password, is_active
FROM public.users
WHERE username IS NULL OR password IS NULL;

-- If no rows returned above, all users have credentials ✅
