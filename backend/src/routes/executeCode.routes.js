import express from "express"
import { authMiddleware } from "../middlewares/auth.middlewares"
import { executeCode } from "../controllers/executeCode.controllers.js"




const router = express.Router()

router.post("/", authMiddleware, executeCode)


export default router