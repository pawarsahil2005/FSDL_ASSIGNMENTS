require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB Connection + Default Admin Seed
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');

    // Create default admin if not exists
    const adminExists = await User.findOne({ email: 'admin@hospital.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@hospital.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('🔐 Default Admin Created → admin@hospital.com / admin123');
    }
  })
  .catch(err => console.log('❌ MongoDB Error:', err));

// Routes
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
