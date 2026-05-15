import 'dotenv/config'
import { createClient } from '@libsql/client'

const isTurso = process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith('libsql://')

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: isTurso ? process.env.TURSO_AUTH_TOKEN : undefined,
})

export default async function handler(req, res) {
  const { method, url, body } = req

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (url === '/api/messages' && method === 'GET') {
      const result = await client.execute('SELECT * FROM messages ORDER BY time DESC')
      return res.status(200).json(result.rows)
    }

    if (url === '/api/messages' && method === 'POST') {
      const { name, content, time } = body

      if (!name?.trim() || !content?.trim()) {
        return res.status(400).json({ error: '名字和内容不能为空' })
      }

      const result = await client.execute({
        sql: 'INSERT INTO messages (name, content, time) VALUES (?, ?, ?) RETURNING *',
        args: [name.trim(), content.trim(), time || Date.now()]
      })

      return res.status(200).json(result.rows[0])
    }

    if (url.match(/^\/api\/messages\/\d+$/) && method === 'DELETE') {
      const id = url.split('/').pop()
      await client.execute({
        sql: 'DELETE FROM messages WHERE id = ?',
        args: [id]
      })
      return res.status(200).json({ success: true })
    }

    return res.status(404).json({ error: 'Not found' })
  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: '服务器错误' })
  }
}
