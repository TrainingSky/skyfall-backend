const mongoose = require("mongoose");
const Joi = require("joi");
const Contact = require("../models/Contact");

/* Joi schemas */

const createContactSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  reasons: Joi.alternatives().try(
    Joi.string().trim().max(200),
    Joi.array().items(Joi.string().trim().max(100))
  ).optional(),
  message: Joi.string().trim().min(5).max(2000).required(),
});



const createContact = async (req, res, next) => {
  const { error } = createContactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  try {
    const { fullName, email, reasons, message } = req.body;

    const contact = await Contact.create({
      fullName,
      email,
      reasons,
      message,
    });

    res.status(201).json({
      message: "Message sent successfully",
      contact,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .setOptions({
        sanitizeFilter: true,
      });

    res.json(contacts);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const deleteContact = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid contact id" });
  }

  try {
    const contact = await Contact.findByIdAndDelete(id).setOptions({
      sanitizeFilter: true,
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  createContact,
  getContacts,
  deleteContact,
};