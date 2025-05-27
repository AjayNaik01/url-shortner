import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/mongo.config.js";
import shortUrlRoutes from "./src/routes/shorturl.routes.js";
import auth_routes from "./src/routes/auth.routes.js";
import { redirectShortUrl } from "./src/controller/shortul.controller.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Middlewares
app.use(cookieParser());

const allowedOrigins = [
  "https://url-shortner-fonend.vercel.app",
  "https://url-shortner-fonend-git-main-ajaynaik01s-projects.vercel.app",
  "https://url-shortner-fonend-jgltdn956-ajaynaik01s-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", shortUrlRoutes);        // POST /api/create
app.get("/:id", redirectShortUrl);      // GET /:shortUrlId
app.use("/api/auth", auth_routes);
app.get("/", (req, res) => {
    res.send("Welcome to the URL Shortener API");
});

// MongoDB connection
connectDB(); // Just connect; don't start listening

// ✅ Export the Express app for Vercel
export default app;
