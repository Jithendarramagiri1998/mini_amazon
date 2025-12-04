const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PORT = process.env.PORT || 3005;

async function init(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS carts (
      id UUID PRIMARY KEY,
      user_id UUID,
      items JSONB,
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
}
init().catch(console.error);

app.post('/cart/:userId/add', async (req,res) => {
  const userId = req.params.userId;
  const { productId, qty } = req.body;
  const r = await pool.query('SELECT id,items FROM carts WHERE user_id=$1', [userId]);
  let cart;
  if(r.rowCount===0){
    const id = uuidv4();
    cart = { id, items: [{ productId, qty }] };
    await pool.query('INSERT INTO carts(id,user_id,items) VALUES($1,$2,$3)', [id,userId, JSON.stringify(cart.items)]);
  } else {
    cart = r.rows[0];
    let items = cart.items || [];
    const found = items.find(i => i.productId === productId);
    if(found) found.qty += qty; else items.push({ productId, qty });
    await pool.query('UPDATE carts SET items=$2, updated_at=now() WHERE user_id=$1', [userId, JSON.stringify(items)]);
    cart.items = items;
  }
  res.json(cart);
});

app.get('/cart/:userId', async (req,res) => {
  const r = await pool.query('SELECT id,items FROM carts WHERE user_id=$1', [req.params.userId]);
  if(r.rowCount===0) return res.json({ items: [] });
  res.json({ id: r.rows[0].id, items: r.rows[0].items });
});

app.listen(PORT, ()=>console.log('Cart on', PORT));
