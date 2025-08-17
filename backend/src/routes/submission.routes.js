import express from "express";
import {authMiddleware, checkAdmin} from "../middlewares/auth.middlewares.js"
import { getSubmissionByIdCount, getSubmissionById, getAllSubmission } from "../controllers/submission.controllers.js";


const router = express.Router();

router.get("/get-all-submision", authMiddleware, getAllSubmission);
router.get("/get-submision/:problemId", authMiddleware, getSubmissionById);
router.get("/get-all-submision-count/:problemId", authMiddleware, getSubmissionByIdCount);


export default router
