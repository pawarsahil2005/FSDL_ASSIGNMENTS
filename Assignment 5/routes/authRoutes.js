import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";

const router = express.Router();

// Register page
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register | SecureLife Insurance",
    error: null
  });
});

// Handle registration form
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).render("register", {
        title: "Register | SecureLife Insurance",
        error: "Please fill in all fields."
      });
    }

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).render("register", {
        title: "Register | SecureLife Insurance",
        error: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // After successful registration, redirect to login
    res.redirect("/login");
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).render("register", {
      title: "Register | SecureLife Insurance",
      error: "Something went wrong. Please try again."
    });
  }
});

// Login page
router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login | SecureLife Insurance",
    error: null
  });
});

// Handle login form
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).render("login", {
        title: "Login | SecureLife Insurance",
        error: "Please enter both email and password."
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render("login", {
        title: "Login | SecureLife Insurance",
        error: "Invalid email or password."
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).render("login", {
        title: "Login | SecureLife Insurance",
        error: "Invalid email or password."
      });
    }

    // Store minimal user data in the session (including role)
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user"
    };

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).render("login", {
      title: "Login | SecureLife Insurance",
      error: "Something went wrong. Please try again."
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

export default router;

