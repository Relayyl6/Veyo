/**
 * Generates a high-entropy 16-character secure password satisfying all auth policies:
 * - At least 2 uppercase letters
 * - At least 2 lowercase letters
 * - At least 2 numbers
 * - At least 2 special symbols
 * - Guaranteed minimum 16 characters
 */
export const generateSecurePassword = (length: number = 16): string => {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude easily confused characters like I, O
  const lowercase = 'abcdefghijkmnopqrstuvwxyz'; // Exclude l
  const numbers = '23456789'; // Exclude 0, 1
  const symbols = '!@#$%^&*_-+=';

  // Strictly enforce at least 16 characters
  const targetLength = Math.max(16, length);

  const passwordChars: string[] = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  const allChars = uppercase + lowercase + numbers + symbols;
  while (passwordChars.length < targetLength) {
    passwordChars.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Fisher-Yates shuffle for true randomness
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join('');
};
