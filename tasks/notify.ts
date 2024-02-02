import axios from 'axios'
import { eq } from 'drizzle-orm'

import { db } from '../db/connection'
import * as Schema from '../db/schema'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import schedule from 'node-schedule'

dayjs.extend(utc)
dayjs.extend(timezone)

let isRunning = false

const today = () => dayjs()
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .utc()

const push = async () => {
  const users = await db
    .select()
    .from(Schema.users)
    .where(eq(Schema.users.dob, today().format()))
    .execute()

  if (!users.length) return

  for (const user of users) {
    const [findUser] = await db
      .select()
      .from(Schema.birthdayNotifQueue)
      .where(eq(Schema.birthdayNotifQueue.userId, user.id))
      .execute()

    if (findUser) {
      console.log(`${user.id} already in queue`)
      continue
    }

    await db
      .insert(Schema.birthdayNotifQueue)
      .values({ userId: user.id })
      .execute()

    console.log(`${user.id} added to queue`)
  }
}

const notify = async (msg: (user: Schema.User) => void) => {
  isRunning = true

  const queue = await db
    .select()
    .from(Schema.birthdayNotifQueue)
    .groupBy(Schema.birthdayNotifQueue.userId)
    .execute()

  for (const q of queue) {
    setImmediate(async () => {
      const [user]: Schema.User[] = await db
        .select()
        .from(Schema.users)
        .where(eq(Schema.users.id, q.userId))
        .execute()

      if (!user) {
        console.log(`User ${q.userId} is not found`)
        return
      }

      if (today().format() !== user.dob) {
        db.delete(Schema.birthdayNotifQueue)
            .where(eq(Schema.birthdayNotifQueue.userId, user.id))
            .execute()
      }

      const data = {
        email: user.email,
        message: msg(user),
      }

      try {
        const r = await axios.post(
          'https://email-service.digitalenvision.com.au/send-email',
          data
        )

        if (r.status === 200) {
          console.log(`Success: birthday notif was sent to ${user.email}`)

          db.delete(Schema.birthdayNotifQueue)
            .where(eq(Schema.birthdayNotifQueue.userId, user.id))
            .execute()
        }
      } catch (err) {
        console.error(`Fail: birthday notif to ${user.email} wasn't sent`)
      }
    })
  }
}

const job = schedule.scheduleJob({ hour: 9 }, async () => {
  await push()
  await notify((user) => `Hey!, today is ${user.firstname} is your birthday!`)
})

