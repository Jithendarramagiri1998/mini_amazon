/**
 * Payment Service
 * - POST /pay         -> process a payment for an order
 * - GET  /health      -> health check
 *
 * Env:
 *  - PORT (default 3007)
 *  - DATABASE_URL
 *  - REDIS_URL
 *  - ORDER_SERVICE_URL      (e.g. http://order-service.amazon.svc.cluster.local:3006)
 *  - PAYMENT_GATEWAY_KEY    (from Kubernetes secret)
 *
 * Behavior:
 *  - simulates payment processing
 *  - inserts transaction in 'payments' table
 *  - publishes `payment.completed` event on Redis
 *  - attempts to update order status by calling ORDER_SERVICE_URL (if endpoint exists)
 */

const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const Redis = require("ioredis");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3007;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = new Redis(process.env.REDIS_URL);
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://order-service:3006";
const PAYMENT_GATEWAY_KEY = process.env.PAYMENT_GATEWAY_KEY || null;

// Initialize DB table
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY,
      order_id UUID NOT NULL,
      user_id UUID,
      amount NUMERIC,
      currency TEXT DEFAULT 'USD',
      method TEXT,
      status TEXT,
      meta JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT now()
    )
  `);
}
initDb().catch(err => {
  console.error("Error initializing DB:", err);
  process.exit(1);
});

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "payment-service" });
});

/**
 * POST /pay
 * Body: { orderId, userId, amount, currency?, method? }
 */
app.post("/pay", async (req, res) => {
  const { orderId, userId, amount, currency = "USD", method = "card" } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ error: "orderId and amount are required" });
  }

  const txId = uuidv4();
  const status = "processing";

  // Insert initial transaction record
  try {
    await pool.query(
      `INSERT INTO payments(id, order_id, user_id, amount, currency, method, status, meta)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
      [txId, orderId, userId || null, amount, currency, method, status, JSON.stringify({})]
    );
  } catch (err) {
    console.error("DB insert error:", err);
    return res.status(500).json({ error: "db_error" });
  }

  // Simulate payment gateway processing
  try {
    // Here you'd call real payment gateway SDK/API using PAYMENT_GATEWAY_KEY.
    // We simulate latency and outcome.
    await new Promise(r => setTimeout(r, 800)); // simulate processing time

    // Simulate success 95% / failure 5%
    const success = Math.random() > 0.05;

    const finalStatus = success ? "succeeded" : "failed";

    // Update payment record
    await pool.query(
      `UPDATE payments SET status=$1, meta=$2 WHERE id=$3`,
      [finalStatus, JSON.stringify({ processedAt: new Date().toISOString() }), txId]
    );

    const event = {
      type: "payment.completed",
      data: {
        transactionId: txId,
        orderId,
        userId,
        amount,
        currency,
        method,
        status: finalStatus,
        timestamp: new Date().toISOString()
      }
    };

    // Publish event to Redis
    try {
      await redis.publish("events", JSON.stringify(event));
      console.log("Published payment.completed", event.data.transactionId);
    } catch (pubErr) {
      console.error("Error publishing event:", pubErr);
    }

    // Attempt to notify Order Service to update order status
    try {
      // Expecting Order Service to expose an endpoint to update order status.
      // We call: PUT {ORDER_SERVICE_URL}/orders/{orderId}/status  { status: 'paid' / 'payment_failed' }
      const updateStatus = finalStatus === "succeeded" ? "paid" : "payment_failed";
      const url = `${ORDER_SERVICE_URL}/orders/${orderId}/status`;

      // Some order-service implementations may not have this endpoint.
      // Handle failures gracefully.
      await axios.put(url, { status: updateStatus }).catch(err => {
        // log and continue
        console.warn("Order service status update failed (non-fatal):", err.message);
      });
    } catch (err) {
      console.warn("Order status update attempt failed:", err.message);
    }

    return res.json({
      transactionId: txId,
      orderId,
      status: finalStatus
    });

  } catch (err) {
    console.error("Payment processing error:", err);
    // mark as failed
    try {
      await pool.query(`UPDATE payments SET status=$1 WHERE id=$2`, ["failed", txId]);
    } catch (uErr) {
      console.error("Failed to update payment status after error:", uErr);
    }
    return res.status(500).json({ error: "payment_processing_error" });
  }
});

// Optional: fetch transaction
app.get("/payments/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const r = await pool.query("SELECT * FROM payments WHERE id=$1", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "not_found" });
    res.json(r.rows[0]);
  } catch (err) {
    console.error("DB error fetching payment:", err);
    res.status(500).json({ error: "db_error" });
  }
});

app.listen(PORT, () => console.log(`Payment service running on port ${PORT}`));
