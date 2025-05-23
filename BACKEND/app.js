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
app.use(cors({
    origin: "https://url-shortner-fonend.vercel.app", 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
