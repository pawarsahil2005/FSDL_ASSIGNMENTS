import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";

// Route modules
import mainRoutes from "./routes/mainRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Database helpers
import { seedDefaultPlans } from "./models/Plan.js";
import { seedDefaultAdmin } from "./models/User.js";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string
const MONGO_URI = "mongodb://127.0.0.1:27017/simpleInsuranceDB";

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parser for form data
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: "securelife_insurance_secret_key", // for demo only; use env variable in real apps
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  })
);

// Make user available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.error = null;
  res.locals.success = null;
  next();
});

// Mount routes
app.use("/", mainRoutes);
app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render("index", {
    title: "Page Not Found | SecureLife Insurance",
    errorMessage: "The page you are looking for does not exist."
  });
});

// Connect to MongoDB, seed plans, and start server
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Seed default plans if collection is empty
    await seedDefaultPlans();
    // Ensure there's a default admin user
    await seedDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`SecureLife Insurance app listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

