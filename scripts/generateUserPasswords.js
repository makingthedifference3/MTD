#!/usr/bin/env node
// Generate bcrypt hashes for missing user passwords
// Run: node generateUserPasswords.js

import bcryptjs from 'bcryptjs';

const users = [
  { username: 'lokesh', password: 'lokesh123' },
  { username: 'priya', password: 'priya123' },
  { username: 'rahul', password: 'rahul123' },
  { username: 'sneha', password: 'sneha123' },
  { username: 'anjali', password: 'anjali123' },
  { username: 'vikram', password: 'vikram123' },
  { username: 'kavita', password: 'kavita123' },
  { username: 'amit', password: 'amit123' },
  { username: 'pooja', password: 'pooja123' },
];

async function generateHashes() {
  console.log('\n🔐 Generating bcrypt hashes for missing users...\n');
  
  let sqlScript = `-- SQL Script to update missing usernames and passwords
-- Run this in Supabase SQL Editor

`;

  for (const user of users) {
    const hashedPassword = await bcryptjs.hash(user.password, 10);
    console.log(`Username: ${user.username}, Password: ${user.password}, Hash: ${hashedPassword}`);
    
    sqlScript += `-- Update ${user.username}
UPDATE public.users 
SET username = '${user.username}', 
    password = '${hashedPassword}'
WHERE email = '${user.username}@mtd.com' AND username IS NULL;

`;
  }

  sqlScript += `-- Verify all users now have username and password
SELECT email, full_name, username, password, is_active 
FROM public.users 
WHERE username IS NULL OR password IS NULL;
`;

  console.log('\n' + sqlScript);
  console.log('\n✅ Copy the SQL script above and run it in Supabase SQL Editor\n');
}

generateHashes().catch(console.error);
