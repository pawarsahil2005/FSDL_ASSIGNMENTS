import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure models can be imported by resolving relative path to project root
import('../models/User.js').then(async ({ User }) => {
  const MONGO_URI = 'mongodb://127.0.0.1:27017/simpleInsuranceDB';
  try {
    await mongoose.connect(MONGO_URI);
    const admin = await User.findOne({ role: 'admin' }).lean();
    if (!admin) {
      console.log('No admin user found in the database.');
    } else {
      console.log('Admin user found:');
      console.log({ name: admin.name, email: admin.email, role: admin.role, id: admin._id });
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error connecting to DB or fetching admin:', err);
  }
});
