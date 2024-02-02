import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').unique().notNull(),
  firstname: text('firstname').notNull(),
  lastname: text('lastname'),
  dob: text('dob').notNull(), // date of birth
  pob: text('pob').notNull(), // place of birth (country code)
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const birthdayNotifQueue = sqliteTable('birthdayNotifQueue', {
  id: integer('id').primaryKey(),
  userId: integer('userId').notNull(),
})