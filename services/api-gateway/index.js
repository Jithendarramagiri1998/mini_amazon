const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ---- CONFIG ----
const SERVICES = {
  user: "http://user-service.amazon.svc.cluster.local:3001",
  product: "http://product-service.amazon.svc.cluster.local:3002",
  search: "http://search-service.amazon.svc.cluster.local:3003",
  inventory: "http://inventory-service.amazon.svc.cluster.local:3004",
  cart: "http://cart-service.amazon.svc.cluster.local:3005",
  order: "http://order-service.amazon.svc.cluster.local:3006",
  payment: "http://payment-service.amazon.svc.cluster.local:3007",
  review: "http://review-service.amazon.svc.cluster.local:3009"
};

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Utility for proxying requests
async function proxy(req, res, serviceUrl) {
  try {
    const response = await axios({
      method: req.method,
      url: serviceUrl + req.url.replace("/api", ""),
      data: req.body,
      headers: { Authorization: req.headers.authorization || "" }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: "gateway_error" });
  }
}

// ---- AUTH MIDDLEWARE ----
function authenticate(req, res, next) {
  if (!req.headers.authorization) return res.status(401).json({ error: "missing_token" });
  const token = req.headers.authorization.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token" });
  }
}

// ---- ROUTES ----

// public
app.use("/api/users", (req, res) => proxy(req, res, SERVICES.user));
app.use("/api/products", (req, res) => proxy(req, res, SERVICES.product));
app.use("/api/search", (req, res) => proxy(req, res, SERVICES.search));
app.use("/api/reviews", (req, res) => proxy(req, res, SERVICES.review));

// protected routes
app.use("/api/cart", authenticate, (req, res) => proxy(req, res, SERVICES.cart));
app.use("/api/orders", authenticate, (req, res) => proxy(req, res, SERVICES.order));
app.use("/api/pay", authenticate, (req, res) => proxy(req, res, SERVICES.payment));

app.get("/health", (req, res) => {
  res.json({ status: "ok", gateway: true });
});

app.listen(8080, () => console.log("API Gateway running on port 8080"));
