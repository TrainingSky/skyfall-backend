const mongoose = require("mongoose");
const Joi = require("joi");
const Service = require("../models/Service");

/* Joi schemas*/

const createServiceSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().min(5).max(1000).required(),
  icon: Joi.string().trim().max(255).allow("", null),
});

const updateServiceSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().min(5).max(1000),
  icon: Joi.string().trim().max(255).allow("", null),
}).min(1);



const createService = async (req, res, next) => {
  const { error } = createServiceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { title, description, icon } = req.body;

    const service = await Service.create({
      title,
      description,
      icon,
    });

    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getServices = async (req, res, next) => {
  try {
    const services = await Service.find()
      .sort({ createdAt: 1 })
      .setOptions({
        sanitizeFilter: true,
      });

    res.json(services);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const updateService = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid service id" });
  }

  const { error } = updateServiceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { title, description, icon } = req.body;

    const updatedData = {};

    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (icon !== undefined) updatedData.icon = icon;

    const service = await Service.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).setOptions({
      sanitizeFilter: true,
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const deleteService = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid service id" });
  }

  try {
    const service = await Service.findByIdAndDelete(id).setOptions({
      sanitizeFilter: true,
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  createService,
  getServices,
  updateService,
  deleteService,
};