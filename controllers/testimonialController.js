const mongoose = require("mongoose");
const Joi = require("joi");
const Testimonial = require("../models/Testimonial");
const cloudinaryModule = require("../config/cloudinary");

const cloudinary = cloudinaryModule.cloudinary;

/* Joi schemas */

const createTestimonialSchema = Joi.object({
  heading: Joi.string().trim().min(2).max(150).required(),
  body: Joi.string().trim().min(5).max(2000).required(),
  name: Joi.string().trim().min(2).max(100).required(),
  role: Joi.string().trim().min(2).max(100).required(),
  initials: Joi.string().trim().max(10).allow("", null),
  url: Joi.string().uri().required(),
});

const updateTestimonialSchema = Joi.object({
  heading: Joi.string().trim().min(2).max(150),
  body: Joi.string().trim().min(5).max(2000),
  name: Joi.string().trim().min(2).max(100),
  role: Joi.string().trim().min(2).max(100),
  initials: Joi.string().trim().max(10).allow("", null),
  url: Joi.string().uri(),
}).min(1);

const createTestimonial = async (req, res, next) => {
  const { error } = createTestimonialSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { heading, body, name, role, initials, url } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Avatar image is required" });
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
    console.error(err);
    next(err);
  }
};

const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().setOptions({
      sanitizeFilter: true,
    });

    res.json(testimonials);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const updateTestimonial = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid testimonial id" });
  }

  const { error } = updateTestimonialSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { heading, body, name, role, initials, url } = req.body;

    const updatedData = {};

    if (heading !== undefined) updatedData.heading = heading;
    if (body !== undefined) updatedData.body = body;
    if (name !== undefined) updatedData.name = name;
    if (role !== undefined) updatedData.role = role;
    if (initials !== undefined) updatedData.initials = initials;
    if (url !== undefined) updatedData.url = url;

    if (req.file) {
      const existing = await Testimonial.findById(id).setOptions({
        sanitizeFilter: true,
      });

      if (!existing) {
        return res.status(404).json({ message: "Testimonial not found" });
      }

      if (existing.avatar?.public_id) {
        await cloudinary.uploader.destroy(existing.avatar.public_id);
      }

      updatedData.avatar = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const testimonial = await Testimonial.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).setOptions({
      sanitizeFilter: true,
    });

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.json(testimonial);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const deleteTestimonial = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid testimonial id" });
  }

  try {
    const testimonial = await Testimonial.findById(id).setOptions({
      sanitizeFilter: true,
    });

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    if (testimonial.avatar?.public_id) {
      await cloudinary.uploader.destroy(testimonial.avatar.public_id);
    }

    await Testimonial.findByIdAndDelete(id).setOptions({
      sanitizeFilter: true,
    });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial,
};