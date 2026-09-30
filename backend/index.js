const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const { connectDB } = require("./config/db");

const productRoutes = require("./routes/products.route");
const categoryRoutes = require("./routes/categories.route");
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/users.route");
const cartRoutes = require("./routes/cart.route");
const orderRoutes = require("./routes/orders.route");
const settingsRoutes = require("./routes/settings.route");
const bannerRoutes = require("./routes/banner.route");

const app = express();
const port = process.env.PORT || 5000;

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : "";
const allowedOrigins = [
    clientUrl,
    "https://sharimela.store",
    "https://www.sharimela.store",
    "https://sharee-mela.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            const cleanOrigin = origin.replace(/\/$/, "");
            if (
                allowedOrigins.includes(cleanOrigin) ||
                cleanOrigin.endsWith(".vercel.app") ||
                cleanOrigin.includes("shareemela.com") ||
                process.env.NODE_ENV !== "production"
            ) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "30d" }));

// Cache-Control headers for public API GET endpoints
app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.includes("/auth") && !req.path.includes("/orders") && !req.path.includes("/cart") && !req.path.includes("/users")) {
        res.set("Cache-Control", "public, max-age=600, s-maxage=600, stale-while-revalidate=1200");
    }
    next();
});

if (process.env.VERCEL) {
    app.use(async (req, res, next) => {
        try {
            await connectDB();
            next();
        } catch (error) {
            res.status(500).json({ message: "Database connection failed" });
        }
    });
}

app.get(["/", "/api"], (req, res) => {
    res.send("Sharee Mela Server is Running...");
});

app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/users", "/users"], userRoutes);
app.use(["/api/products", "/products"], productRoutes);
app.use(["/api/categories", "/categories"], categoryRoutes);
app.use(["/api/cart", "/cart"], cartRoutes);
app.use(["/api/orders", "/orders"], orderRoutes);
app.use(["/api/settings", "/settings"], settingsRoutes);
app.use(["/api/banners", "/banners"], bannerRoutes);

if (process.env.VERCEL) {
    module.exports = app;
} else {
    startServer();
}

async function startServer() {
    try {
        await connectDB();
        const server = app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
        server.keepAliveTimeout = 65000;
        server.headersTimeout = 66000;
    } catch (error) {
        console.log(error);
    }
}
