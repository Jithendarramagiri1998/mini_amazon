const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');

const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3003;
const redis = new Redis(process.env.REDIS_URL);

// in-memory index for demo
const index = [];

redis.subscribe('events', (err, count) => {});
redis.on('message', (channel, msg) => {
  try {
    const ev = JSON.parse(msg);
    if(ev.type === 'product.created') {
      index.push(ev.data);
      console.log('indexed product', ev.data.id);
    }
  } catch(e){ console.error(e); }
});

app.get('/search', (req,res) => {
  const q = (req.query.q || '').toLowerCase();
  const results = index.filter(p => p.title.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
  res.json(results.slice(0,50));
});

app.listen(PORT, () => console.log('Search service on', PORT));
