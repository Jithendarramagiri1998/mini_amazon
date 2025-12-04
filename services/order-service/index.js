const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
const redis = new Redis(process.env.REDIS_URL);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PORT = process.env.PORT || 3006;

async function init(){
  await pool.query(`CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY, user_id UUID, items JSONB, total NUMERIC, status TEXT, created_at TIMESTAMP DEFAULT now()
  )`);
}
init().catch(console.error);

// create order
app.post('/orders', async (req,res) => {
  const { userId, items, total } = req.body;
  const id = uuidv4();
  await pool.query('INSERT INTO orders(id,user_id,items,total,status) VALUES($1,$2,$3,$4,$5)', [id,userId, JSON.stringify(items), total, 'created']);
  const ev = { type: 'order.created', data: { id, userId, items, total } };
  await redis.publish('events', JSON.stringify(ev));
  res.json({ id, status:'created' });
});

app.get('/orders/:id', async (req,res) => {
  const r = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
  if(r.rowCount===0) return res.status(404).json({ error:'not found' });
  res.json(r.rows[0]);
});

app.listen(PORT, ()=>console.log('Order on', PORT));
