import * as noteService from "../services/note.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addNote = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Note added successfully",
    note,
  });
});

export const editNote = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(
    req.user.id,
    req.params.noteId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Note updated successfully",
    note,
  });
});

export const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await noteService.getAllNotes(req.user.id);

  res.status(200).json({
    success: true,
    message: "All notes retreived successfully",
    notes,
  });
});

export const deleteNote = asyncHandler(async (req, res) => {
  await noteService.deleteNote(req.user.id, req.params.noteId);

  res.status(200).json({
    success: true,
    message: "Note deleted successfully",
  });
});

export const updateNotePinned = asyncHandler(async (req, res) => {
  const note = await noteService.updateNotePinned(
    req.user.id,
    req.params.noteId,
    req.body.isPinned
  );

  res.status(200).json({
    success: true,
    message: "Note updated successfully",
    note,
  });
});

export const searchNote = asyncHandler(async (req, res) => {
  const notes = await noteService.searchNotes(req.user.id, req.query.query);

  res.status(200).json({
    success: true,
    message: "Notes matching the search query retrieved successfully",
    notes,
  });
});
