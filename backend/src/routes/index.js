import express from "express";
import noteRouter from "./note.route.js";

// /api/auth/* is handled by Better Auth (see app.js)
const router = express.Router();

router.use("/note", noteRouter);

export default router;
