import Note from "../models/note.model.js";

export const create = (data) => Note.create(data);

export const findById = (id) => Note.findById(id);

export const findByIdAndUser = (id, userId) => Note.findOne({ _id: id, userId });

export const findAllByUser = (userId) =>
  Note.find({ userId }).sort({ isPinned: -1 });

export const searchByUser = (userId, regex) =>
  Note.find({
    userId,
    $or: [{ title: { $regex: regex } }, { content: { $regex: regex } }],
  });

export const save = (note) => note.save();

export const deleteById = (id) => Note.deleteOne({ _id: id });
