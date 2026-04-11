const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    body: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    initials: { type: String, },
    url: { type: String, required: true },
    avatar: {
      url: { type: String, required: true },
      public_id: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
