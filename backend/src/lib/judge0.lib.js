import axios from "axios"

// Maps supported languages to Judge0 IDs
const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
    "C++": 54,
  }
  return languageMap[language.toUpperCase()] || null
}

const getJudge0Language = (id) => {
  const languageMap = {
    71: "PYTHON",
    62: "JAVA",
    63: "JAVASCRIPT",
    54: "C++"
  }
  return languageMap[id] || "Unknown Language"
}

// Submit a batch of testcases
const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    "https://judge0-ce.p.rapidapi.com/submissions/batch",
    { submissions },
    {
      params: {
        base64_encoded: "false",
        wait: "false",
        fields: "*",
      },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    }
  )

  console.log("🔁 Tokens submitted:", data)

  return data
}

// Poll Judge0 until all results are done
const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

const pollBatchResults = async (tokens) => {
  while (true) {
    const { data } = await axios.get(
      "https://judge0-ce.p.rapidapi.com/submissions/batch",
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: "false",
          fields: "*",
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        },
      }
    )

    console.log("📥 Poll result:", data)

    if (!data || !data.submissions || !Array.isArray(data.submissions)) {
      throw new Error(
        "❌ Invalid response from Judge0: " + JSON.stringify(data)
      )
    }

    const results = data.submissions

    const allDone = results.every(
      (submission) =>
        submission &&
        submission.status &&
        submission.status.id !== 1 &&
        submission.status.id !== 2
    )

    if (allDone) return results

    await sleep(1000)
  }
}

export { getJudge0LanguageId, submitBatch, pollBatchResults, getJudge0Language }
