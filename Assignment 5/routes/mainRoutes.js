import express from "express";
import { Plan } from "../models/Plan.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Home page
router.get("/", async (req, res) => {
  try {
    // Always show first three plans on the home page for a better look
    const plans = await Plan.find().limit(3).lean();

    res.render("index", {
      title: "SecureLife Insurance | Home",
      plans
    });
  } catch (err) {
    console.error("Error loading home page:", err);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// About page
router.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us | SecureLife Insurance"
  });
});

// Plans page - only after login
router.get("/plans", ensureAuthenticated, async (req, res) => {
  try {
    const plans = await Plan.find().lean();
    res.render("plans", {
      title: "Insurance Plans | SecureLife Insurance",
      plans
    });
  } catch (err) {
    console.error("Error loading plans:", err);
    res.status(500).send("Unable to load plans at the moment.");
  }
});

export default router;

