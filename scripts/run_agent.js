import fs from "fs"
import OpenAI from "openai"
import path from "path"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function runAgent() {

  console.log("🍑 Peachy AI brain starting")

  // -----------------------------
  // Repo files
  // -----------------------------

  const files = fs.readdirSync("./").filter(
    f => !["node_modules", ".git", ".github"].includes(f)
  )

  let repoContext = ""

  for (const file of files) {

    if (
      file.endsWith(".js") ||
      file.endsWith(".md") ||
      file.endsWith(".json")
    ) {

      try {

        const content = fs.readFileSync(file, "utf8")

        repoContext += `
FILE: ${file}
----------------
${content}

`

      } catch {}

    }

  }

  console.log("📂 Repo analyzed")

  // -----------------------------
  // Goal
  // -----------------------------

  let goal = ""

  try {
    goal = fs.readFileSync("./GOAL.md", "utf8")
  } catch {
    goal = "No goal defined yet."
  }

  // -----------------------------
  // Memory
  // -----------------------------

  let memory = {}

  try {
    memory = JSON.parse(
      fs.readFileSync("./peachy_memory.json", "utf8")
    )
  } catch {
    memory = {
      completed: [],
      failed: []
    }
  }

  // -----------------------------
  // Task system
  // -----------------------------

  const TASKS = [
    "Create conversation input UI component",
    "Create analyze button component",
    "Connect UI to /api/analyze endpoint",
    "Display verdict result UI",
    "Add share result button",
    "Improve UI styling and usability"
  ]

  const task = TASKS[memory.completed.length] || "Improve UI polish"

  console.log("🧩 Current task:", task)

  // -----------------------------
  // Prompt
  // -----------------------------

  const trimmedContext = repoContext.slice(-12000)

  const prompt = `
You are Peachy, an autonomous AI software engineer building the product FLAGGED.

Current task:
${task}

Goal:
${goal}

Memory:
${JSON.stringify(memory, null, 2)}

Repository code:
${trimmedContext}

Rules:
- Never modify protected files
- Never modify backend engine
- Prefer creating new files
- Implement ONLY the current task
- Prefer placing UI code in src/components/

Respond EXACTLY like this:

filename: path/to/file.js

---CODE---
full code here
---END---

description: short explanation
`

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  })

  const text = response.output[0].content[0].text

  console.log("🧠 Raw Peachy response:\n", text)

  // -----------------------------
  // Extract files
  // -----------------------------

  const fileMatches = [...text.matchAll(/filename:\s*(.*)/g)]
  const codeMatches = [...text.matchAll(/---CODE---([\s\S]*?)---END---/g)]

  if (fileMatches.length === 0 || codeMatches.length === 0) {

    console.log("❌ Failed to parse Peachy response")

    memory.failed.push("Parse failure")

    fs.writeFileSync(
      "./peachy_memory.json",
      JSON.stringify(memory, null, 2)
    )

    return
  }

  // -----------------------------
  // Protected paths
  // -----------------------------

  const PROTECTED_FILES = [
    "src/server.js",
    "scripts/run_agent.js",
    "package.json",
    "package-lock.json"
  ]

  const PROTECTED_DIRECTORIES = [
    "src/server",
    "src/detection",
    "src/formatters",
    "scripts"
  ]

  // -----------------------------
  // Write generated files
  // -----------------------------

  for (let i = 0; i < fileMatches.length; i++) {

    const filename = fileMatches[i][1].trim()
    const code = codeMatches[i][1].trim()

    const normalized = filename.replace(/^\.\/+/, "")

    if (
      PROTECTED_FILES.includes(normalized) ||
      PROTECTED_DIRECTORIES.some(dir => normalized.startsWith(dir))
    ) {
      console.log("🚫 Peachy blocked from modifying protected path:", filename)
      continue
    }

    fs.mkdirSync(path.dirname(filename), { recursive: true })

    fs.writeFileSync(filename, code)

    console.log("✨ Peachy created:", filename)

  }

  // -----------------------------
  // Update memory
  // -----------------------------

  const descMatch = text.match(/description:\s*([\s\S]*)/)

  const description = descMatch
    ? descMatch[1].trim()
    : "No description"

  memory.completed.push(description)

  fs.writeFileSync(
    "./peachy_memory.json",
    JSON.stringify(memory, null, 2)
  )

  console.log("🧠 Memory updated")

}

runAgent()