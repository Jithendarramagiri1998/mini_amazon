const express = require("express");
const bodyParser = require("body-parser");
const Redis = require("ioredis");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3008;
const redis = new Redis(process.env.REDIS_URL);

// SMTP Setup (can be SES, Gmail SMTP, Mailtrap, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "demo",
    pass: process.env.SMTP_PASS || "demo"
  }
});

// Utility: Send email
async function sendEmail(to, subject, message) {
  try {
    await transporter.sendMail({
      from: process.env.NOTIFICATION_EMAIL_FROM || "no-reply@mini-amazon.com",
      to,
      subject,
      html: `<p>${message}</p>`
    });
    console.log("Email sent →", subject);
  } catch (err) {
    console.error("Email error:", err.message);
  }
}

// Health Route
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "notification-service" });
});

// Listen to Redis events
redis.subscribe("events", (err, count) => {
  if (err) console.error("Redis subscription error:", err);
  console.log("Notification Service subscribed to Redis events.");
});

// Handle incoming events
redis.on("message", async (channel, message) => {
  try {
    const event = JSON.parse(message);

    switch (event.type) {
      case "user.created":
        await sendEmail(
          event.data.email,
          "Welcome to Mini-Amazon!",
          `Hi ${event.data.name}, your account has been created successfully!`
        );
        break;

      case "order.created":
        await sendEmail(
          event.data.userEmail || "user@example.com",
          "Your Order Has Been Placed!",
          `Your order ${event.data.id} has been created. Total: $${event.data.total}`
        );
        break;

      case "payment.completed":
        await sendEmail(
          event.data.userEmail || "user@example.com",
          "Payment Successful",
          `Payment for order ${event.data.orderId} is completed successfully.`
        );
        break;

      default:
        console.log("Unhandled event type:", event.type);
    }
  } catch (err) {
    console.error("Error processing event:", err.message);
  }
});

app.listen(PORT, () => console.log(`Notification service running on port ${PORT}`));
