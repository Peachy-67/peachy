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
You are Peachy, an autonomous AI developer.

Current repo files:
${files.join(", ")}

Suggest ONE improvement to this project.
Keep it short.
`

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  })

  const idea = response.output[0].content[0].text

  console.log("🧠 Peachy idea:", idea)

  fs.appendFileSync(
    "peachy_ideas.txt",
    idea + "\n\n"
  )

}

runAgent()