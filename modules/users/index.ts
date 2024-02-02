import { eq } from 'drizzle-orm'
import { db } from '../../db/connection'
import ct from 'countries-and-timezones'
import date from '../../utils/date'
import * as Schema from '../../db/schema'
import { FastifyReply, FastifyRequest } from 'fastify'

type UserBody = {
  pob: string
  d: string
  m: string
  y: string
  firstname: string
  lastname: string
  email: string
}

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

export const updateUser = async (
  userId: number,
  user: Partial<Schema.NewUser>
) => {
  return await db
    .update(Schema.users)
    .set(user)
    .where(eq(Schema.users.id, userId))
    .returning()
}

export const postUser = async (
  req: FastifyRequest<{ Body: UserBody }>,
  rep: FastifyReply
) => {
  try {
    const { pob, d, m, y, firstname, lastname, email } = req.body
    const [tz] = ct.getTimezonesForCountry(pob) || []
    const dob = date.tz(`${y}-${m}-${d}`, tz.name).utc().format()
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
}

export const deleteUserByUserId = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  rep: FastifyReply
) => {
  try {
    await deleteUser(Number(req.params.userId))
    rep.status(204).send()
  } catch (error) {
    console.error(error)
    rep.status(500).send({ error })
  }
}

export const putUserByUserId = async (
  req: FastifyRequest<{ Params: { userId: string }; Body: UserBody }>,
  rep: FastifyReply
) => {
  try {
    const { pob, d, m, y, ...body } = req.body
    let data = {}
    if (pob && d && m && y) {
      const [tz] = ct.getTimezonesForCountry(pob) || []
      const dob = date.tz(`${y}-${m}-${d}`, tz.name).utc().format()
      data = { pob, dob }
    }
    await updateUser(Number(req.params.userId), { ...data, ...body })
    rep.status(200).send()
  } catch (error) {
    console.error(error)
    rep.status(500).send({ error })
  }
}
