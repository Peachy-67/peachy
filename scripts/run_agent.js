import fs from "fs"
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function runAgent() {

  console.log("🍑 Peachy AI brain starting")

  const files = fs.readdirSync("./")

  console.log("📂 Repo files:", files)

  const prompt = `
You are Peachy, an autonomous AI software developer.

Current repo files:
${files.join(", ")}

Your job is to improve this project.

Respond with JSON in this format:

{
  "filename": "new_file_name.js",
  "code": "full code for the file",
  "description": "short explanation"
}
`

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  })

  const text = response.output[0].content[0].text

  console.log("🧠 Peachy response:", text)

  try {

    const result = JSON.parse(text)

    fs.writeFileSync(result.filename, result.code)

    console.log("✨ Peachy created file:", result.filename)

  } catch (err) {

    console.log("⚠️ Peachy returned non-JSON response")

  }

}

runAgent()