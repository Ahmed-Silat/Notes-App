import express from "express";
import authRouter from "./auth.route.js";
import noteRouter from "./note.route.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/note", noteRouter);

export default router;
