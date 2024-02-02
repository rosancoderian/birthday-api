import { faker } from '@faker-js/faker'
import { db } from '../connection'
import * as Schema from '../schema'
import date from '../../utils/date'
import { v4 as uid } from 'uuid'

console.log('Seeding...')

const dob = date.tz('1993-03-11', 'Asia/Jakarta').utc().format()

for (let i = 0; i < 50; i++) {
  const firstname = faker.person.firstName()
  const email = `${firstname}${uid()}@email.com`
  const randomDob = date(faker.date.past({ years: 20 }))
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
