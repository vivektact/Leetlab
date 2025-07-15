
import { asyncHandler } from "../utils/async-handler.js";
import { getJudge0LanguageId, submitBatch, pollBatchResults } from "../lib/judge0.lib.js";
import { ApiResponse } from "../utils/api-response.js";
import  db  from "../lib/db.js";

const createProblem = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        hints,
        editorial,
        constraints,
        examples,
        difficulty,
        tags,
        referenceSolutions,
        codeSnippets,
        testCases,
        ifq
    } = req.body;

    if (!referenceSolutions || Object.keys(referenceSolutions).length === 0) {
        return res.status(400).json(
            new ApiResponse(400, null, "Reference solutions are required")
        );
    }

    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
        const languageId = getJudge0LanguageId(language);

        if (!languageId) {
            return res.status(400).json(
                new ApiResponse(400, null, `Language "${language}" is not supported by Judge0`)
            );
        }

        const submissions = testCases.map(({ input, output }) => ({
            source_code: solutionCode,
            language_id: languageId,
            stdin: input,
            expected_output: output,
        }));

        console.log(`Submitting ${submissions.length} test cases for ${language}`);

        const submissionResults = await submitBatch(submissions);

        const tokens = submissionResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

    //   console.log("👌result is", results)

        for (let i = 0; i < results.length; i++) {
            const result = results[i];

            if (result.status.id !== 3) {
                if ((result.stdout || "").trim() !== (result.expected_output || "").trim()) {
                return res.status(400).json(new ApiResponse(400, null, {
                    error: `Testcase ${i + 1} output mismatch for language ${language}`,
                    expected: result.expected_output,
                    got: result.stdout,
                }));
            }

                return res.status(400).json(new ApiResponse(400, null, {
                    error: `Testcase ${i + 1} failed for language ${language}`,
                    details: result.status.description,
                }));
            }
        }
    }

    const newProblem = await db.problem.create({
        data: {
            title,
            description,
            difficulty,
            tags,
            examples,
            constraints,
            testCases,
            hints,
            editorial,
            ifq,
            codeSnippets,
            referenceSolutions,
            userId: req.user.id,
        },
    });

    return res.status(201).json(new ApiResponse(201, newProblem, "Problem created successfully"));
});


const getAllProblems = asyncHandler(async(req, res) => {
    const problems = await db.Problem.findMany()

    if(!problems){
        return res.status(404).json(new ApiResponse(404, problems, "No Problem Found"))
    }

    res.status(200).json(new ApiResponse(200, problems.id, "successfull request"))

    console.log(problems)
})


const getProblemById = asyncHandler(async(req, res) => {
    
    const { id } = req.params

    const problem = await db.Problem.findUnique({
        where:{
            id
        }
    })

    if(!problem){
        return res.status(404).json(new ApiResponse(404, problem, "No Problem Found by id"))
    }

    res.status(200).json(new ApiResponse(200, problem, "successfull request"))

    console.log(problem)
})


const deleteProblem = asyncHandler(async(req, res) => {
    
    const { id } = req.params

    const problem = await db.Problem.findUnique({
        where:{
            id
        }
    })

    if(!problem){
        return res.status(404).json(new ApiResponse(404, problem, "No Problem Found by id"))
    }

    await db.Problem.delete({
        where:{
            id
        }
    })

    res.status(200).json(new ApiResponse(200, problem, "successfull deleted"))

    
})






export { createProblem, getAllProblems , getProblemById, deleteProblem};
