import fastify from 'fastify'
import { createUser, deleteUser } from './modules/users'
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

type NewUserReqBody = {
  pob: string
  d: string
  m: string
  y: string
  firstname: string
  lastname: string
  email: string
}

app.post<{ Body: NewUserReqBody }>('/user', async (req, rep) => {
  try {
    const { pob, d, m, y, firstname, lastname, email } = req.body
    const [tz] = ct.getTimezonesForCountry(pob) || []
    const dob = dayjs.tz(`${y}-${m}-${d}`, tz.name).utc().format()
    const createdUser = await createUser({ pob, firstname, lastname, dob, email })
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
