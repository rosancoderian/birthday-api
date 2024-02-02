import fastify from 'fastify'
import { deleteUserByUserId, postUser, putUserByUserId } from './modules/users'

const app = fastify()
app.listen({ port: 3000 }, (err, addr) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  console.log(`Listening on ${addr}`)
})

app.get('/', (_, rep) => rep.status(200).send('ok'))

app.post('/user', postUser)
app.delete('/user/:userId', deleteUserByUserId)
app.put('/user/:userId', putUserByUserId)
