import db, { isTurso } from './db.js'

async function initDatabase() {
  console.log('初始化数据库...')
  console.log(`数据库类型: ${isTurso ? 'Turso (远程)' : 'SQLite (本地)'}`)

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        time INTEGER NOT NULL
      )
    `)
    console.log('messages 表创建成功')

    const result = await db.execute('SELECT COUNT(*) as count FROM messages')
    console.log(`当前留言数量: ${result.rows[0].count}`)

    console.log('数据库初始化完成!')
  } catch (error) {
    console.error('数据库初始化失败:', error)
    process.exit(1)
  }
}

initDatabase()
