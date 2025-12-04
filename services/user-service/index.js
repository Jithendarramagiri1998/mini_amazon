// user-service/index.js
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const Redis = require('ioredis');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = new Redis(process.env.REDIS_URL);

async function initDb(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      created_at TIMESTAMP DEFAULT now()
    )
  `);
}
initDb().catch(console.error);

// signup
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if(!email || !password) return res.status(400).json({error:'invalid'});
  const hash = await bcrypt.hash(password, 10);
  const id = require('uuid').v4();
  await pool.query('INSERT INTO users(id,name,email,password) VALUES($1,$2,$3,$4)', [id,name,email,hash]);
  // publish event
  await redis.publish('events', JSON.stringify({ type:'user.created', data:{ id, name, email } }));
  res.json({ id, name, email });
});

// login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  if(r.rowCount === 0) return res.status(400).json({ error:'invalid' });
  const user = r.rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({ error:'invalid' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// get profile
app.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if(!auth) return res.status(401).json({error:'no token'});
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const r = await pool.query('SELECT id,name,email,created_at FROM users WHERE id=$1', [payload.id]);
    if(r.rowCount === 0) return res.status(404).json({error:'not found'});
    res.json(r.rows[0]);
  } catch(err) {
    res.status(401).json({ error: 'invalid token' });
  }
});

app.listen(PORT, () => console.log(`User service listening ${PORT}`));
