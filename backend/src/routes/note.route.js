import express from "express";
import {
  addNote,
  deleteNote,
  editNote,
  getAllNotes,
  searchNote,
  shareNote,
  stopSharingNote,
  updateNoteArchived,
  updateNoteColor,
  updateNotePinned,
} from "../controllers/note.controller.js";
import {
  createNoteDto,
  listNotesDto,
  noteIdParamDto,
  searchNoteDto,
  updateNoteArchivedDto,
  updateNoteColorDto,
  updateNoteDto,
  updateNotePinnedDto,
} from "../dtos/note.dto.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/add", validate({ body: createNoteDto }), addNote);
router.put(
  "/edit/:noteId",
  validate({ params: noteIdParamDto, body: updateNoteDto }),
  editNote,
);
router.get("/all", validate({ query: listNotesDto }), getAllNotes);
router.delete(
  "/delete/:noteId",
  validate({ params: noteIdParamDto }),
  deleteNote,
);
router.put(
  "/update-note-pinned/:noteId",
  validate({ params: noteIdParamDto, body: updateNotePinnedDto }),
  updateNotePinned,
);
router.put(
  "/update-note-archived/:noteId",
  validate({ params: noteIdParamDto, body: updateNoteArchivedDto }),
  updateNoteArchived,
);
router.put(
  "/update-note-color/:noteId",
  validate({ params: noteIdParamDto, body: updateNoteColorDto }),
  updateNoteColor,
);
router.get("/search", validate({ query: searchNoteDto }), searchNote);
router.put("/share/:noteId", validate({ params: noteIdParamDto }), shareNote);
router.delete(
  "/share/:noteId",
  validate({ params: noteIdParamDto }),
  stopSharingNote,
);

export default router;
