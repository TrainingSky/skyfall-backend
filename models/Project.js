const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    description: String,
    url: String,
    images: {
      type: [String],
      validate: [arr => arr.length <= 4, "Max 4 images"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
