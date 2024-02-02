import fastify from 'fastify'
import { createUser, deleteUser, updateUser } from './modules/users'
import ct from 'countries-and-timezones'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const app = fastify()
app.listen({ port: 3000 }, (err, addr) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  console.log(`Listening on ${addr}`)
})

app.get('/', (req, rep) => {
  rep.status(200).send('ok')
})

type UserBody = {
  pob: string
  d: string
  m: string
  y: string
  firstname: string
  lastname: string
  email: string
}

app.post<{ Body: UserBody }>('/user', async (req, rep) => {
  try {
    const { pob, d, m, y, firstname, lastname, email } = req.body
    const [tz] = ct.getTimezonesForCountry(pob) || []
    const dob = dayjs.tz(`${y}-${m}-${d}`, tz.name).utc().format()
    const data = {
      pob,
      firstname,
      lastname,
      dob,
      email,
    }
    const createdUser = await createUser(data)
    rep.status(201).send(createdUser)
  } catch (error) {
    console.error(error)
    rep.status(500).send({ error })
  }
})

app.delete<{ Params: { userId: string } }>(
  '/user/:userId',
  async (req, rep) => {
    try {
      await deleteUser(Number(req.params.userId))
      rep.status(204).send()
    } catch (error) {
      console.error(error)
      rep.status(500).send({ error })
    }
  }
)

app.put<{ Params: { userId: string }; Body: UserBody }>(
  '/user/:userId',
  async (req, rep) => {
    try {
      const { pob, d, m, y, ...body } = req.body
      let data = {}
      if (pob && d && m && y) {
        const [tz] = ct.getTimezonesForCountry(pob) || []
        const dob = dayjs.tz(`${y}-${m}-${d}`, tz.name).utc().format()
        data = { pob, dob }
      }
      await updateUser(Number(req.params.userId), {...data, ...body})
      rep.status(200).send()
    } catch (error) {
      console.error(error)
      rep.status(500).send({ error })
    }
  }
)
