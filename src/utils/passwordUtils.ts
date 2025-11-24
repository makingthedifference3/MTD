import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcryptjs.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcryptjs.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const match = await bcryptjs.compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Generate a random password for new users
 * @returns Random password
 */
export function generateRandomPassword(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return password;
}
