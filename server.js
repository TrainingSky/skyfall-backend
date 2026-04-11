const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const adminAuthRoutes = require("./routes/adminAuthRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const contactRoutes = require("./routes/contactRoutes");
const User = require("./models/User");

dotenv.config();

const app = express();

// ✅ CORS must be first — before everything
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://sky-fall1.netlify.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); 

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/contacts", contactRoutes);

const createAdmin = async () => {
  const existingAdmin = await User.findOne({ email: "admin@example.com" });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("123456", 10);
    await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
    });
    console.log("Admin created");
  } else {
    console.log("Admin already exists");
  }
};

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log("DB Connected");
    await createAdmin();
  })
  .catch(err => console.error("DB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));