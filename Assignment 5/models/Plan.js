import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Plan = mongoose.models.Plan || mongoose.model("Plan", planSchema);

// Seed helper to insert default plans once when the collection is empty.
export async function seedDefaultPlans() {
  const count = await Plan.countDocuments();
  if (count > 0) {
    return;
  }

  const defaultPlans = [
    {
      planName: "Basic Plan",
      price: 1999,
      duration: "1 Year",
      description: "Basic life insurance coverage."
    },
    {
      planName: "Premium Plan",
      price: 4999,
      duration: "2 Years",
      description: "Extended coverage with extra benefits."
    },
    {
      planName: "Family Plan",
      price: 7999,
      duration: "3 Years",
      description: "Complete family protection plan."
    }
  ];

  await Plan.insertMany(defaultPlans);
  console.log("Default insurance plans seeded into the database.");
}

