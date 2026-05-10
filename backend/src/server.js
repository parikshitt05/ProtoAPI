require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Dashboard API routes (protected)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/resources", require("./routes/resources"));

// Live mock engine (public, rate-limited)
app.use("/mock", require("./routes/mock"));

app.get("/health", (_, res) => res.json({ status: "ok" }));

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL, // set this to your Vercel URL after deploy
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman, curl, Hoppscotch)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
