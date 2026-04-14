const Testimonial = require("../models/Testimonial");
const cloudinaryModule = require("../config/cloudinary");

const cloudinary = cloudinaryModule.cloudinary;

const createTestimonial = async (req, res) => {
  try {
    const { heading, body, name, role, initials, url } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Avatar image is required" });
    }

    if (!heading || !body || !name || !role  || !url) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const avatar = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    const testimonial = await Testimonial.create({
      heading,
      body,
      name,
      role,
      initials,
      url,
      avatar,
    });

    res.status(201).json(testimonial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body };

    if (req.file) {
      const existing = await Testimonial.findById(id);

      if (existing?.avatar?.public_id) {
        await cloudinary.uploader.destroy(existing.avatar.public_id);
      }

      updatedData.avatar = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const testimonial = await Testimonial.findByIdAndUpdate(id, updatedData, { new: true });

    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (testimonial?.avatar?.public_id) {
      await cloudinary.uploader.destroy(testimonial.avatar.public_id);
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial
};
