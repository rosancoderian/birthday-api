import { eq } from 'drizzle-orm'
import { db } from '../../db/connection'
import * as Schema from '../../db/schema'

export const createUser = async (user: Schema.NewUser) => {
  const [createdUser]: Schema.User[] = await db
    .insert(Schema.users)
    .values(user)
    .returning()
  return createdUser
}

export const deleteUser = async (userId: number) => {
  return await db
    .delete(Schema.users)
    .where(eq(Schema.users.id, userId))
    .returning()
}