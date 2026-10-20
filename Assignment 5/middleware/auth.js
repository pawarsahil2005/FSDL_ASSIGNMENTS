// Simple middleware to protect routes that require authentication.
export function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  return res.redirect("/login");
}

import { User } from "../models/User.js";

// Middleware to ensure the current session user is an admin.
export async function ensureAdmin(req, res, next) {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    // Fetch fresh user record to be safe
    const user = await User.findById(req.session.user.id).lean();
    if (!user || user.role !== "admin") {
      return res.status(403).send("Access denied: admin only");
    }

    // Keep session user in sync with DB
    req.session.user.role = user.role;
    return next();
  } catch (err) {
    console.error("Error in ensureAdmin:", err);
    return res.status(500).send("Server error");
  }
}

