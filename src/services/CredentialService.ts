import bcrypt from 'bcryptjs';

export const comparePassword = async (
  userPassword: string,
  passwordHash: string,
): Promise<boolean> => {
  return await bcrypt.compare(userPassword, passwordHash);
};
