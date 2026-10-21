import express from "express";
import noteRouter from "./note.route.js";
import publicRouter from "./public.route.js";

// /api/auth/* is handled by Better Auth (see app.js)
const router = express.Router();

router.use("/note", noteRouter);
router.use("/public", publicRouter);

export default router;
