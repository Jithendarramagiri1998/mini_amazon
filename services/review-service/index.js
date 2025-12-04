/**
 * Review Service
 * - POST /reviews/:productId     -> add a review
 * - GET  /reviews/:productId     -> list reviews
 * - GET  /reviews/:productId/avg -> average rating
 *
 * Publishes: review.created event
 *
 * Env:
 *  - PORT (default 3009)
 *  - DATABASE_URL
 *  - REDIS_URL
 */

const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const Redis = require("ioredis");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3009;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = new Redis(process.env.REDIS_URL);

// Initialize reviews table
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY,
      product_id UUID,
      user_id UUID,
      rating INT CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT now()
    );
  `);
}
initDb().catch(console.error);

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "review-service" });
});

// Create review
app.post("/reviews/:productId", async (req, res) => {
  const productId = req.params.productId;
  const { userId, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1–5" });
  }

  const id = uuidv4();

  try {
    await pool.query(
      `INSERT INTO reviews(id, product_id, user_id, rating, comment)
       VALUES($1, $2, $3, $4, $5)`,
      [id, productId, userId || null, rating, comment || null]
    );

    // Publish event
    await redis.publish("events", JSON.stringify({
      type: "review.created",
      data: { id, productId, userId, rating, comment }
    }));

    res.json({ id, productId, userId, rating, comment });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "db_error" });
  }
});

// Get reviews for a product
app.get("/reviews/:productId", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, user_id, rating, comment, created_at FROM reviews WHERE product_id=$1 ORDER BY created_at DESC",
      [req.params.productId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "db_error" });
  }
});

// Average rating
app.get("/reviews/:productId/avg", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT AVG(rating)::numeric(10,2) AS avg_rating, COUNT(*) AS total_reviews FROM reviews WHERE product_id=$1",
      [req.params.productId]
    );
    res.json(r.rows[0] || { avg_rating: 0, total_reviews: 0 });
  } catch (err) {
    console.error("Error computing average:", err);
    res.status(500).json({ error: "db_error" });
  }
});

app.listen(PORT, () => console.log(`Review service running on port ${PORT}`));
