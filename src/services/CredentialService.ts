import bcrypt from 'bcrypt';

export const comparePassword = async (
  userPassword: string,
  passwordHash: string,
): Promise<boolean> => {
  return await bcrypt.compare(userPassword, passwordHash);
};
