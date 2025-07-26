import express from "express"
import { authMiddleware, checkAdmin } from "../middlewares/auth.middlewares.js"
import { executeCode } from "../controllers/executeCode.controllers.js"

const router = express.Router()

router.post("", authMiddleware, executeCode)

export default router
