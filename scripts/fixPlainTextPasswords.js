#!/usr/bin/env node
// Fix plain text passwords - convert to bcrypt
import bcryptjs from 'bcryptjs';

const usersWithPlainPasswords = [
  { username: 'admin1', password: 'Harsh567' },
];

async function fixPasswords() {
  console.log('\n🔐 Generating bcrypt hashes for plain text passwords...\n');
  
  let sqlScript = `-- SQL Script to fix plain text passwords
-- Run this in Supabase SQL Editor

`;

  for (const user of usersWithPlainPasswords) {
    const hashedPassword = await bcryptjs.hash(user.password, 10);
    console.log(`Username: ${user.username}, Plain Password: ${user.password}, Bcrypt Hash: ${hashedPassword}`);
    
    sqlScript += `-- Fix ${user.username} password
UPDATE public.users
SET password = '${hashedPassword}'
WHERE username = '${user.username}';

`;
  }

  sqlScript += `-- Verify all passwords are bcrypt hashed (should start with $2b$10$)
SELECT username, email, SUBSTRING(password, 1, 10) as password_prefix, password
FROM public.users
ORDER BY created_at DESC;
`;

  console.log('\n' + sqlScript);
  console.log('\n✅ Copy the SQL script above and run it in Supabase SQL Editor\n');
}

fixPasswords().catch(console.error);
