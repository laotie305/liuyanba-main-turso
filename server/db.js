import { createClient } from '@libsql/client'

const isTurso = process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith('libsql://')

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: isTurso ? process.env.TURSO_AUTH_TOKEN : undefined,
})

export { client, isTurso }
export default client
