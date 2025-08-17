import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import db from "../lib/db.js";


const getAllSubmission = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if(!userId){
        return res.status(400).json(new ApiResponse(400, "", "User not found"));
    }

    const submission = await db.Submission.findMany({
        where: {
            userId: userId
        }
    })

    return res.status(200).json(new ApiResponse(200, submission, "Submission fetched successfully"))

})

const getSubmissionById = asyncHandler(async (req, res) => {
     const userId = req.user.id;
        const problemId = req.params.problemId;

        const submissions = await db.Submission.findMany({
            where:{
                userId:userId,
                problemId:problemId
            }
        })

        res.status(200).json(new ApiResponse(200, submissions, "Fetched Successfully"));
})

const getSubmissionByIdCount = asyncHandler(async (req, res) => {
    const problemId = req.params.problemId;
        const submission = await db.Submission.count({
            where:{
                problemId:problemId
            }
        })

        res.status(200).json(new ApiResponse(200, {count : submission}, "Fetched successfully"))
})


export {getAllSubmission, getSubmissionByIdCount, getSubmissionById}