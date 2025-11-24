// Script to generate bcrypt hashed passwords for test users
// Run: node scripts/generateHashedPasswords.js

import bcryptjs from 'bcryptjs';

const testUsers = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'accountant', password: 'acc123', role: 'accountant' },
  { username: 'pm', password: 'pm123', role: 'project_manager' },
  { username: 'tm', password: 'tm123', role: 'team_member' },
];

async function generateHashes() {
  console.log('\n🔐 Generating bcrypt hashes for test users...\n');
  
  for (const user of testUsers) {
    const hashedPassword = await bcryptjs.hash(user.password, 10);
    console.log(`Username: ${user.username}`);
    console.log(`Plain Password: ${user.password}`);
    console.log(`Hashed Password: ${hashedPassword}`);
    console.log(`Role: ${user.role}`);
    console.log('---');
  }

  console.log('\n✅ Copy the hashed passwords above and use them in the SQL INSERT statements below:\n');
  
  console.log('SQL to insert into Supabase:');
  console.log('(Replace the $hash values with the hashed passwords above)\n');
  
  let sqlInsert = "INSERT INTO public.users (email, full_name, username, password, role, is_active) VALUES";
  const sqlValues = testUsers.map(user => 
    `('${user.username}@mtd.com', '${user.username.charAt(0).toUpperCase() + user.username.slice(1)} User', '${user.username}', '$hash_${user.username}', '${user.role}', true)`
  );
  sqlInsert += '\n' + sqlValues.join(',\n') + ';';
  
  console.log(sqlInsert);
  console.log('\n');
}

generateHashes().catch(console.error);
