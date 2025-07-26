import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import { submitBatch } from "../lib/judge0.lib.js"
import { pollBatchResults } from "../lib/judge0.lib.js"

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

  const submissionsResult = await submitBatch(submissions)

  const token = submissionsResult.map((result) => result.token)

  const result = await pollBatchResults(token)

  console.log("😎result is", result)

  return res
    .status(200)
    .json(new ApiResponse(200, "", "Code executed succesfully"))
})

export { executeCode }
