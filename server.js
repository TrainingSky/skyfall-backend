const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");


const adminAuthRoutes = require("./routes/adminAuthRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const contactRoutes = require("./routes/contactRoutes");

const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

app.set("trust proxy", 1);

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
       "http://localhost:5175",
    "http://localhost:3000",
    "https://sky-fall1.netlify.app",
    "https://first-task-dusky.vercel.app",
    "https://first-task-4xsodswj5-raghad-alzghouls-projects.vercel.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ================= Mongoose Security Settings ================= */
mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", true);
/* ============================================================= */

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/contacts", contactRoutes);

app.use(errorHandler);


mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
  .then(async () => {
    console.log("DB Connected");

  })
  .catch((err) => console.error("DB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

