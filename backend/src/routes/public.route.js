import express from "express";
import { getSharedNote } from "../controllers/note.controller.js";
import { shareIdParamDto } from "../dtos/note.dto.js";
import { validate } from "../middlewares/validate.middleware.js";

// Routes anyone can use without logging in.
const router = express.Router();

router.get(
  "/notes/:shareId",
  validate({ params: shareIdParamDto }),
  getSharedNote,
);

export default router;
