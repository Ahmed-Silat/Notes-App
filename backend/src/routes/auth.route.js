import express from "express";
import { signin, signout, signup } from "../controllers/auth.controller.js";
import { signinDto, signupDto } from "../dtos/auth.dto.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post("/signup", validate({ body: signupDto }), signup);
router.post("/signin", validate({ body: signinDto }), signin);
router.get("/signout", verifyToken, signout);

export default router;
