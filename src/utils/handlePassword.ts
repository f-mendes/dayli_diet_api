import bcrypt from 'bcrypt'

export async function createHash(password: string) {
  return await bcrypt.hash(password, 1)
}

export async function comparePassword(
  inputPasswor: string,
  hashPassword: string,
) {
  return bcrypt.compare(inputPasswor, hashPassword)
}
