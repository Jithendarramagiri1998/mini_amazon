const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = new Redis(process.env.REDIS_URL);
const PORT = process.env.PORT || 3004;

async function init(){
  await pool.query(`CREATE TABLE IF NOT EXISTS inventory (product_id UUID PRIMARY KEY, qty INT)`);
}
init().catch(console.error);

redis.subscribe('events');
redis.on('message', async (_, msg) => {
  try {
    const ev = JSON.parse(msg);
    if(ev.type === 'product.created') {
      // initialize inventory to 100 for new product
      await pool.query('INSERT INTO inventory(product_id,qty) VALUES($1,$2) ON CONFLICT (product_id) DO NOTHING', [ev.data.id, 100]);
    } else if(ev.type === 'order.created') {
      // adjust inventory for order.items
      const items = ev.data.items || [];
      for(const it of items){
        await pool.query('UPDATE inventory SET qty = GREATEST(qty - $1, 0) WHERE product_id=$2', [it.qty, it.productId]);
      }
    }
  } catch(e){ console.error(e); }
});

app.get('/inventory/:productId', async (req,res) => {
  const r = await pool.query('SELECT qty FROM inventory WHERE product_id=$1', [req.params.productId]);
  if(r.rowCount===0) return res.json({ qty: 0 });
  res.json({ qty: r.rows[0].qty });
});

app.listen(PORT, () => console.log('Inventory service on', PORT));
