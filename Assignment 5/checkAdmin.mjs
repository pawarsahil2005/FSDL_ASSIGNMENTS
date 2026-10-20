import mongoose from "mongoose";
import { User } from "./models/User.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/simpleInsuranceDB";

try {
  await mongoose.connect(MONGO_URI, { dbName: "simpleInsuranceDB" });
  console.log("Connected to MongoDB for admin check");

  const admin = await User.findOne({ email: "admin@securelife.com" }).lean();
  if (admin) {
    console.log("ADMIN FOUND:");
    console.log({ id: admin._id.toString(), email: admin.email, role: admin.role, name: admin.name });
  } else {
    console.log("ADMIN NOT FOUND");
  }

  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error("Error checking admin:", err);
  process.exit(1);
}
