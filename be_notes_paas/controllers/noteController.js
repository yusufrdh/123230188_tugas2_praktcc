const noteModel = require("../models/noteModels");

const getAllNotes = async (req, res) => {
  try {
    const allNotes = await noteModel.findAll();
    res.status(200).json({
      message: "Notes retrieved successfully",
      data: allNotes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving notes",
      error: error.message,
    });
  }
};

const getNoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await noteModel.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({
      message: "Note retrieved successfully",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving note",
      error: error.message,
    });
  }
};

const createNote = async (req, res) => {
  const { judul, isi } = req.body;
  if (!judul || !isi) {
    return res.status(400).json({ message: "Judul and isi are required" });
  }
  try {
    const newNote = await noteModel.create({
      judul,
      isi,
      tanggal_dibuat: new Date(),
    });
    res.status(201).json({
      message: "Note created successfully",
      data: newNote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating note",
      error: error.message,
    });
  }
};

const updateNote = async (req, res) => {
  const { id } = req.params;
  const { judul, isi } = req.body;
  if (!judul || !isi) {
    return res.status(400).json({ message: "Judul and isi are required" });
  }
  try {
    const note = await noteModel.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    const updatedNote = await noteModel.update(id, { judul, isi });
    res.status(200).json({
      message: "Note updated successfully",
      data: updatedNote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating note",
      error: error.message,
    });
  }
};

const deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await noteModel.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    await noteModel.deleteById(id);
    res.status(200).json({
      message: "Note deleted successfully",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting note",
      error: error.message,
    });
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};
