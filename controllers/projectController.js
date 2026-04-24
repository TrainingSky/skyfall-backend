const mongoose = require("mongoose");
const Joi = require("joi");
const Project = require("../models/Project");

/*Joi schemas  */

const createProjectSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  subtitle: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().min(5).required(),
  url: Joi.string().uri().required(),
});

const updateProjectSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100),
  subtitle: Joi.string().trim().min(2).max(150),
  description: Joi.string().trim().min(5),
  url: Joi.string().uri(),
}).min(1);



const createProject = async (req, res, next) => {
  const { error } = createProjectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { title, subtitle, description, url } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const images = req.files.map((file) => file.path);

    if (images.length === 0) {
      return res.status(400).json({ message: "At least one image required" });
    }

    const project = await Project.create({
      title,
      subtitle,
      description,
      url,
      images,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().setOptions({
      sanitizeFilter: true,
    });

    res.json(projects);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  const { error } = updateProjectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { title, subtitle, description, url } = req.body;

    const updatedData = {};

    if (title !== undefined) updatedData.title = title;
    if (subtitle !== undefined) updatedData.subtitle = subtitle;
    if (description !== undefined) updatedData.description = description;
    if (url !== undefined) updatedData.url = url;

    if (req.files?.length > 0) {
      updatedData.images = req.files.map((file) => file.path);
    }

    const project = await Project.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).setOptions({
      sanitizeFilter: true,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  try {
    const project = await Project.findByIdAndDelete(id).setOptions({
      sanitizeFilter: true,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
};