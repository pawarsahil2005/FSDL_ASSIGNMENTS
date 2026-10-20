import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    selectedPlans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan"
      }
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  {
    timestamps: true
  }
);

// Reuse model if already compiled (helps with hot reloads)
export const User = mongoose.models.User || mongoose.model("User", userSchema);

// Seed helper to ensure there is at least one admin user in the DB.
export async function seedDefaultAdmin() {
  try {
    const adminEmail = "admin@securelife.com";
    const existing = await User.findOne({ email: adminEmail }).lean();
    if (existing) {
      // If admin exists but not an admin role, upgrade it
      if (existing.role !== "admin") {
        await User.updateOne({ _id: existing._id }, { $set: { role: "admin" } });
        console.log("Existing user promoted to admin:", adminEmail);
      }
      return;
    }

    const plain = "admin123"; // default admin password (change in production)
    const hashed = await bcrypt.hash(plain, 10);

    const adminUser = new User({
      name: "Administrator",
      email: adminEmail,
      password: hashed,
      role: "admin"
    });

    await adminUser.save();
    console.log("Default admin user created:", adminEmail);
  } catch (err) {
    console.error("Error seeding default admin:", err);
  }
}

