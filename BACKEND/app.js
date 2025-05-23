import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/mongo.config.js";
import shortUrlRoutes from "./src/routes/shorturl.routes.js";
import auth_routes from "./src/routes/auth.routes.js";
import { redirectShortUrl } from "./src/controller/shortul.controller.js";
import cors from "cors";
import cookieParser from "cookie-parser";



// Load environment variables

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", shortUrlRoutes);        // POST /api/create
app.get("/:id", redirectShortUrl);      // GET /:shortUrlId

app.use("/api/auth", auth_routes);


// Home test route
app.get("/", (req, res) => {
    res.send("Welcome to the URL Shortener API");
});

// Connect DB and start server
const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
};

startServer();
