import express from "express";
import {
  addNote,
  deleteNote,
  editNote,
  getAllNotes,
  searchNote,
  updateNotePinned,
} from "../controllers/note.controller.js";
import {
  createNoteDto,
  noteIdParamDto,
  searchNoteDto,
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
  editNote
);
router.get("/all", getAllNotes);
router.delete(
  "/delete/:noteId",
  validate({ params: noteIdParamDto }),
  deleteNote
);
router.put(
  "/update-note-pinned/:noteId",
  validate({ params: noteIdParamDto, body: updateNotePinnedDto }),
  updateNotePinned
);
router.get("/search", validate({ query: searchNoteDto }), searchNote);

export default router;
