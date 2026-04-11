const Project = require("../models/Project");

const createProject = async (req, res) => {
  try {
    const { title, subtitle, description, url } = req.body;

    console.log("FILES:", JSON.stringify(req.files, null, 2));

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const images = req.files.map(file => file.path);

    console.log("img url", images);

    if (images.length === 0) {
      return res.status(400).json({ message: "At least one image required" });
    }

    const project = await Project.create({
      title,
      subtitle,
      description,
      url,
      images
    });

    res.status(201).json(project);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    let updatedData = { ...req.body };

    if (req.files?.length > 0) {
      updatedData.images = req.files.map(file => file.path);
    }

    const project = await Project.findByIdAndUpdate(id, updatedData, { new: true });

    res.json(project);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject
};
