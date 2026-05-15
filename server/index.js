import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import db, { isTurso } from './db.js'

const app = express()
const PORT = process.env.PORT || 3003

app.use(cors())
app.use(express.json())

app.get('/api/messages', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM messages ORDER BY time DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('获取留言失败:', error)
    res.status(500).json({ error: '获取留言失败' })
  }
})

app.post('/api/messages', async (req, res) => {
  try {
    const { name, content, time } = req.body

    if (!name?.trim() || !content?.trim()) {
      return res.status(400).json({ error: '名字和内容不能为空' })
    }

    const result = await db.execute({
      sql: 'INSERT INTO messages (name, content, time) VALUES (?, ?, ?) RETURNING *',
      args: [name.trim(), content.trim(), time || Date.now()]
    })

    res.json(result.rows[0])
  } catch (error) {
    console.error('添加留言失败:', error)
    res.status(500).json({ error: '添加留言失败' })
  }
})

app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params
    await db.execute({
      sql: 'DELETE FROM messages WHERE id = ?',
      args: [id]
    })
    res.json({ success: true })
  } catch (error) {
    console.error('删除留言失败:', error)
    res.status(500).json({ error: '删除留言失败' })
  }
})

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
  console.log(`数据库类型: ${isTurso ? 'Turso (远程)' : 'SQLite (本地)'}`)
})
