import express from "express";
import { ensureAdmin } from "../middleware/auth.js";
import { Plan } from "../models/Plan.js";

const router = express.Router();

// Admin dashboard - list all plans with edit/delete actions
router.get("/admin", ensureAdmin, async (req, res) => {
  try {
    const plans = await Plan.find().lean();
    res.render("admin", {
      title: "Admin Dashboard | SecureLife Insurance",
      plans,
      layout: "layout-admin"
    });
  } catch (err) {
    console.error("Error loading admin dashboard:", err);
    res.status(500).send("Unable to load admin dashboard.");
  }
});

// Show create plan form
router.get("/admin/plans/new", ensureAdmin, (req, res) => {
  res.render("admin-add-plan", { title: "Add Plan | Admin", layout: "layout-admin" });
});

// Handle create plan
router.post("/admin/plans/new", ensureAdmin, async (req, res) => {
  const { planName, price, duration, description } = req.body;
  try {
    if (!planName || !price || !duration || !description) {
      return res.status(400).render("admin-add-plan", {
        title: "Add Plan | Admin",
        error: "Please fill all fields.",
        layout: "layout-admin"
      });
    }

    await Plan.create({ planName, price: Number(price), duration, description });
    res.redirect("/admin");
  } catch (err) {
    console.error("Error creating plan:", err);
    res.status(500).render("admin-add-plan", {
      title: "Add Plan | Admin",
      error: "Unable to create plan.",
      layout: "layout-admin"
    });
  }
});

// Show edit form
router.get("/admin/plans/:id/edit", ensureAdmin, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).lean();
    if (!plan) return res.redirect("/admin");
    res.render("edit-plan", { title: "Edit Plan | Admin", plan, layout: "layout-admin" });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.redirect("/admin");
  }
});

// Handle update
router.post("/admin/plans/:id/edit", ensureAdmin, async (req, res) => {
  const { planName, price, duration, description } = req.body;
  try {
    await Plan.findByIdAndUpdate(req.params.id, {
      planName,
      price: Number(price),
      duration,
      description
    });
    res.redirect("/admin");
  } catch (err) {
    console.error("Error updating plan:", err);
    res.redirect("/admin");
  }
});

// Handle delete
router.post("/admin/plans/:id/delete", ensureAdmin, async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    console.error("Error deleting plan:", err);
    res.redirect("/admin");
  }
});

export default router;
