import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from '../connection'

console.log('Running migration...')

try {
  migrate(db, { migrationsFolder: 'db/migrations' })
} catch (error) {
  console.error(error)
}
