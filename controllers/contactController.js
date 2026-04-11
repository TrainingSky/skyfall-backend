const Contact = require("../models/Contact");

const createContact = async (req, res) => {
  try {
    const { fullName, email, reasons, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        error: "Name, email and message are required"
      });
    }

    const contact = await Contact.create({
      fullName,
      email,
      reasons,
      message
    });

    res.status(201).json({
      message: "Message sent successfully",
      contact
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  createContact,
  getContacts,
  deleteContact

};
