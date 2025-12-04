const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3002;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = new Redis(process.env.REDIS_URL);

async function init(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY,
      title TEXT,
      description TEXT,
      price NUMERIC,
      category TEXT,
      created_at TIMESTAMP DEFAULT now()
    )
  `);
}
init().catch(console.error);

// list products
app.get('/products', async (req,res) => {
  const r = await pool.query('SELECT id,title,description,price,category FROM products ORDER BY created_at DESC LIMIT 100');
  res.json(r.rows);
});

// create product (admin)
app.post('/products', async (req,res) => {
  const { title, description, price, category } = req.body;
  const id = uuidv4();
  await pool.query('INSERT INTO products(id,title,description,price,category) VALUES($1,$2,$3,$4,$5)',
    [id,title,description,price,category]);
  const product = { id, title, description, price, category };
  // publish product created event for search/index/inventory
  await redis.publish('events', JSON.stringify({ type:'product.created', data: product }));
  res.json(product);
});

// get product
app.get('/products/:id', async (req,res) => {
  const r = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id]);
  if(r.rowCount===0) return res.status(404).json({error:'not found'});
  res.json(r.rows[0]);
});

app.listen(PORT, () => console.log(`Product service on ${PORT}`));
