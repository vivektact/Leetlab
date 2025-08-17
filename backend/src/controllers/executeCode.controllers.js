import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import { submitBatch } from "../lib/judge0.lib.js"
import { pollBatchResults } from "../lib/judge0.lib.js"
import db from "../lib/db.js"
import { getJudge0Language } from "../lib/judge0.lib.js"


const executeCode = asyncHandler(async (req, res) => {
  //taking test cases
  const { source_code, language_id, stdin, expected_outputs, problemId } =
    req.body

  //user id
  const userId = req.user.id

  //check stdin and expected output is array or not
  if (
    !Array.isArray(stdin) ||
    !Array.isArray(expected_outputs) ||
    stdin.length === 0 ||
    expected_outputs.length !== stdin.length
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, "", "Input and Output is not array"))
  }

  //preparing testcases
  const submissions = stdin.map((input) => ({
    source_code: source_code,
    language_id: language_id,
    stdin: input,
    // expected_outputs // no expected output
  }))

  //submission 
  const submissionsResult = await submitBatch(submissions)
  console.log("🤞", submissionsResult);

  //transform array only to token
  const token = submissionsResult.map((result) => result.token)

  //passing token
  const result = await pollBatchResults(token)

  //result display
  console.log("😎result is", result)

  //anaylize testcases
  let allPassed = true

  const detailedResults = result.map((result, i) => {
    const stdout = result.stdout?.trim()
    const expected_output = expected_outputs[i]?.trim()
    const passed = stdout === expected_output

    if(!passed) allPassed = false

    return{
      testCase: i + 1,
      passed,
      stdout,
      expected: expected_output,
      stderr: result.stderr || null,
      compileOutput: result.compile_output || null,
      status: result.status.description,
      memory: result.memory? `${result.memory} KB` : undefined,
      time: result.time? `${result.time} s`: undefined
    }
  })

  console.log(detailedResults)


  // save into submission table
  const submission = await db.submission.create({
    data: {
      userId,
      problemId,
      sourceCode: source_code,
      language: getJudge0Language(language_id),
      stdin: stdin.join("\n"),
      stdout: JSON.stringify(detailedResults.map(r => r.stdout)),
      stderr: detailedResults.some((r) => r.stderr)
          ? JSON.stringify(detailedResults.map((r) => r.stderr))
          : null,
        compileOutput: detailedResults.some((r) => r.compile_output)
          ? JSON.stringify(detailedResults.map((r) => r.compile_output))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResults.some((r) => r.memory)
          ? JSON.stringify(detailedResults.map((r) => r.memory))
          : null,
        time: detailedResults.some((r) => r.time)
          ? JSON.stringify(detailedResults.map((r) => r.time))
          : null,
    }
  })

  //problem solved entry
  if(allPassed){
    await db.ProblemSolved.upsert({
      where:{
        userId_problemId: {
        userId : submission.userId,
        problemId: submission.problemId
        }
      },
      create:{
        userId : submission.userId,
        problemId: submission.problemId
      },
      update: {},
    })
  }

  //store each test cases
  const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));

    await db.testCaseResult.createMany({
      data: testCaseResults,
    });

  //submisson with test cases
  const submissionWithTestCase = await db.submission.findUnique({
    where:{
      id: submission.id,
    },
    include: {
      testCases: true,
    }
  })


  //success response
  return res
    .status(200)
    .json(new ApiResponse(200, submissionWithTestCase, "Code executed succesfully"))
})

export { executeCode }
