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
  const { notes, total, nextCursor } = await noteService.getNotes(
    req.user.id,
    req.query
  );

  res.status(200).json({
    success: true,
    message: "All notes retreived successfully",
    notes,
    total,
    nextCursor,
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

export const updateNoteArchived = asyncHandler(async (req, res) => {
  const note = await noteService.updateNoteArchived(
    req.user.id,
    req.params.noteId,
    req.body.isArchived
  );

  res.status(200).json({
    success: true,
    message: note.isArchived ? "Note archived" : "Note unarchived",
    note,
  });
});

export const updateNoteColor = asyncHandler(async (req, res) => {
  const note = await noteService.updateNoteColor(
    req.user.id,
    req.params.noteId,
    req.body.color
  );

  res.status(200).json({
    success: true,
    message: "Note color updated",
    note,
  });
});

export const shareNote = asyncHandler(async (req, res) => {
  const note = await noteService.shareNote(req.user.id, req.params.noteId);

  res.status(200).json({
    success: true,
    message: "Share link created",
    note,
  });
});

export const stopSharingNote = asyncHandler(async (req, res) => {
  const note = await noteService.stopSharingNote(
    req.user.id,
    req.params.noteId
  );

  res.status(200).json({
    success: true,
    message: "Note is no longer shared",
    note,
  });
});

// Public: no login needed, only the share link's id.
export const getSharedNote = asyncHandler(async (req, res) => {
  const note = await noteService.getSharedNote(req.params.shareId);

  res.status(200).json({
    success: true,
    message: "Shared note retrieved successfully",
    note,
  });
});

export const searchNote = asyncHandler(async (req, res) => {
  const { query, ...page } = req.query;
  const { notes, total, nextCursor } = await noteService.searchNotes(
    req.user.id,
    query,
    page
  );

  res.status(200).json({
    success: true,
    message: "Notes matching the search query retrieved successfully",
    notes,
    total,
    nextCursor,
  });
});
