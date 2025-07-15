import express from "express"
import { register, login, logout, check } from "../controllers/auth.controllers.js"
import { authMiddleware } from "../middlewares/auth.middlewares.js"



const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", authMiddleware, logout)
router.get("/check", authMiddleware, check)

export default router