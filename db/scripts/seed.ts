import { faker } from '@faker-js/faker'
import { db } from '../connection'
import * as Schema from '../schema'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { v4 as uid } from 'uuid'

dayjs.extend(utc)
dayjs.extend(timezone)

console.log('Seeding...')

const dob = dayjs.tz('1993-03-11', 'Asia/Jakarta').utc().format()

for (let i = 0; i < 50; i++) {
  const firstname = faker.person.firstName()
  const email = `${firstname}${uid()}@email.com`
  const randomDob = dayjs(faker.date.past({ years: 20 }))
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .utc()
    .format()

  db.insert(Schema.users)
    .values({
      email,
      firstname,
      lastname: faker.person.lastName(),
      dob: faker.helpers.arrayElement([dob, randomDob]),
      pob: faker.location.country(),
    })
    .returning()
    .then(([r]) => console.log(`${r.firstname} inserted`))
}
