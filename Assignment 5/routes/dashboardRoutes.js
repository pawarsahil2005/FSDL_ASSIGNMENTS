import express from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import { Plan } from "../models/Plan.js";
import { User } from "../models/User.js";

const router = express.Router();

// Dashboard (protected) - show user and their plans
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id)
      .populate("selectedPlans")
      .lean();
    const plans = await Plan.find().lean();

    const ownedPlanIds =
      user && user.selectedPlans
        ? user.selectedPlans.map((p) => String(p._id))
        : [];

    res.render("dashboard", {
      title: "Dashboard | SecureLife Insurance",
      user,
      plans,
      ownedPlanIds
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).send("Unable to load dashboard right now.");
  }
});

// Add a plan to the user's selectedPlans
router.post("/plans/:id/add", ensureAuthenticated, async (req, res) => {
  const planId = req.params.id;

  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.redirect("/dashboard");
    }

    await User.findByIdAndUpdate(req.session.user.id, {
      $addToSet: { selectedPlans: planId }
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error adding plan:", err);
    res.redirect("/dashboard");
  }
});

// Remove a plan from the user's selectedPlans
router.post("/plans/:id/remove", ensureAuthenticated, async (req, res) => {
  const planId = req.params.id;

  try {
    await User.findByIdAndUpdate(req.session.user.id, {
      $pull: { selectedPlans: planId }
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error removing plan:", err);
    res.redirect("/dashboard");
  }
});

export default router;

