import fs from "fs"
import OpenAI from "openai"
import path from "path"
import { execSync } from "child_process"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)

    if (
      file === "node_modules" ||
      file === ".git" ||
      file === ".github" ||
      file === "dist" ||
      file === "build"
    ) {
      continue
    }

    let stat
    try {
      stat = fs.statSync(fullPath)
    } catch {
      continue
    }

    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList)
    } else {
      fileList.push(fullPath)
    }
  }

  return fileList
}

function normalizePath(filePath) {
  return filePath.replace(/^\.\/+/, "").replace(/\\/g, "/")
}

function canModify(normalizedPath, protectedFiles, protectedDirectories) {
  if (protectedFiles.includes(normalizedPath)) return false
  if (protectedDirectories.some(dir => normalizedPath.startsWith(dir))) return false
  return true
}

function findDuplicateCandidates(files) {
  const sourceFiles = files
    .map(normalizePath)
    .filter(file =>
      file.startsWith("src/") &&
      (file.endsWith(".js") ||
        file.endsWith(".jsx") ||
        file.endsWith(".ts") ||
        file.endsWith(".tsx") ||
        file.endsWith(".css"))
    )

  return sourceFiles.filter(file =>
    /(polish|improved|enhancement|visualization|container|display)/i.test(
      path.basename(file)
    )
  )
}

function runBuildCheck() {
  try {
    if (!fs.existsSync("./package.json")) {
      return { ok: false, message: "package.json not found" }
    }

    const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"))

    if (!pkg.scripts || !pkg.scripts.build) {
      return { ok: false, message: "No build script found" }
    }

    execSync("npm run build", { stdio: "pipe" })
    return { ok: true, message: "Build passed" }
  } catch (error) {
    return {
      ok: false,
      message: error?.stdout?.toString() || error?.message || "Build failed"
    }
  }
}

async function runAgent() {
  console.log("🍑 Peachy AI brain starting")

  // -----------------------------
  // Repo files (recursive)
  // -----------------------------

  const files = getAllFiles("./")

  let repoContext = ""

  for (const file of files) {
    if (
      file.endsWith(".js") ||
      file.endsWith(".jsx") ||
      file.endsWith(".ts") ||
      file.endsWith(".tsx") ||
      file.endsWith(".css") ||
      file.endsWith(".md") ||
      file.endsWith(".json")
    ) {
      try {
        const content = fs.readFileSync(file, "utf8")
        const cleanPath = normalizePath(file)

        repoContext += `
FILE: ${cleanPath}
----------------
${content}

`
      } catch {}
    }
  }

  console.log("📂 Repo analyzed")

  // -----------------------------
  // Detect missing core app files
  // -----------------------------

  const coreFiles = [
    "src/App.js",
    "src/index.js"
  ]

  const missingCore = coreFiles.filter(file => !fs.existsSync(file))

  if (missingCore.length > 0) {
    console.log("🧠 Missing core files:", missingCore)
  }

  // -----------------------------
  // Detect duplicate clutter
  // -----------------------------

  const duplicateCandidates = findDuplicateCandidates(files)

  if (duplicateCandidates.length > 0) {
    console.log("🧹 Duplicate/variant candidates found:", duplicateCandidates.length)
  }

  // -----------------------------
  // Load architecture
  // -----------------------------

  let architecture = {}

  try {
    architecture = JSON.parse(
      fs.readFileSync("./ARCHITECTURE_MAP.json", "utf8")
    )
  } catch {}

  // -----------------------------
  // Load roadmap
  // -----------------------------

  let roadmap = ""

  try {
    roadmap = fs.readFileSync("./ROADMAP.md", "utf8")
  } catch {
    roadmap = "No roadmap defined yet."
  }

  // -----------------------------
  // Load goal
  // -----------------------------

  let goal = ""

  try {
    goal = fs.readFileSync("./GOAL.md", "utf8")
  } catch {
    goal = "No goal defined yet."
  }

  // -----------------------------
  // Load memory
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
  // Load task queue
  // -----------------------------

  let taskData

  try {
    taskData = JSON.parse(
      fs.readFileSync("./peachy_tasks.json", "utf8")
    )
  } catch {
    taskData = {
      queue: [],
      completed: []
    }
  }

  // -----------------------------
  // Force core build if app files missing
  // -----------------------------

  if (missingCore.length > 0) {
    const coreBuildTask =
      "Create src/App.js and connect the best existing UI components into a working app"

    if (!taskData.queue.includes(coreBuildTask)) {
      taskData.queue.unshift(coreBuildTask)

      fs.writeFileSync(
        "./peachy_tasks.json",
        JSON.stringify(taskData, null, 2)
      )
    }
  }

  // -----------------------------
  // Force cleanup task if clutter is high
  // -----------------------------

  if (duplicateCandidates.length >= 8) {
    const cleanupTask =
      "Clean repository clutter by selecting canonical components, updating imports, and deleting unused duplicate variants safely"

    if (!taskData.queue.includes(cleanupTask)) {
      taskData.queue.unshift(cleanupTask)

      fs.writeFileSync(
        "./peachy_tasks.json",
        JSON.stringify(taskData, null, 2)
      )
    }
  }

  // -----------------------------
  // Generate tasks if empty
  // -----------------------------

  if (!taskData.queue.length) {
    console.log("🧠 Peachy generating new tasks")

    const planningPrompt = `
You are planning development tasks for the product FLAGGED.

Product roadmap:
${roadmap}

Goal:
${goal}

Generate 5 development tasks that move the product closer to completing the roadmap.

Prioritize:

1. Creating missing application files
2. Connecting existing UI components together
3. Connecting frontend to backend APIs
4. Building working product features
5. Cleaning duplicate or unused component files safely

Avoid repeating tasks like UI polish, CSS improvements, styling tweaks, duplicate wrappers, or duplicate components unless the application is already functional.

Return JSON:

{
  "tasks": ["task1", "task2", "task3", "task4", "task5"]
}
`

    const plan = await client.responses.create({
      model: "gpt-4.1-mini",
      input: planningPrompt
    })

    try {
      const parsed = JSON.parse(plan.output[0].content[0].text)

      taskData.queue.push(...parsed.tasks)

      fs.writeFileSync(
        "./peachy_tasks.json",
        JSON.stringify(taskData, null, 2)
      )
    } catch {}
  }

  // -----------------------------
  // Select current task
  // -----------------------------

  let task = taskData.queue[0] || "Build core application files"

  const recent = memory.completed.slice(-8).join(" ").toLowerCase()

  if (
    recent.includes("ui polish") ||
    recent.includes("css") ||
    recent.includes("style") ||
    recent.includes("polish")
  ) {
    console.log("⚠️ UI loop detected — forcing real product work")

    task =
      "Create src/App.js and connect the best existing analyzer, alert, verdict, share, and dashboard components into a working product interface. Avoid creating duplicate polish components."
  }

  console.log("🧩 Current task:", task)

  // -----------------------------
  // Prompt
  // -----------------------------

  const trimmedContext = repoContext.slice(-35000)

  const prompt = `
You are Peachy, an autonomous AI software engineer building the product FLAGGED.

Current task:
${task}

Product roadmap:
${roadmap}

Goal:
${goal}

Architecture:
${JSON.stringify(architecture, null, 2)}

Memory:
${JSON.stringify(memory, null, 2)}

Repository code:
${trimmedContext}

Repository maintenance rules:
- Prefer reusing and connecting existing files instead of creating duplicates
- When duplicate files exist, choose the best canonical version
- Update imports to point to the canonical version
- Delete redundant files only if they are clearly duplicates or unused
- Do not create more UI polish variants unless absolutely necessary

Rules:
- Never modify protected files
- Never modify backend engine
- Prefer creating new files only when necessary
- Implement ONLY the current task
- Prefer placing UI code in src/components/
- Prefer implementing full working features over UI improvements
- If src/App.js is missing, prioritize creating it
- Do not create duplicate component families when similar files already exist
- Avoid creating more CSS polish files

You may generate MULTIPLE files if needed.
You may also delete files safely.

Respond EXACTLY like this format:

filename: path/to/file1.js

---CODE---
code
---END---

filename: path/to/file2.js

---CODE---
code
---END---

delete: path/to/oldFile1.js
delete: path/to/oldFile2.css

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
  const deleteMatches = [...text.matchAll(/^delete:\s*(.*)$/gm)]

  if (!fileMatches.length && !deleteMatches.length) {
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
    "package-lock.json",
    "src/index.js",

    // Prevent CSS loop
    "src/styles/UiPolish.css",
    "src/styles/UiPolishImprovements.css",
    "src/components/UIPolishEnhancements.css"
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

  let wroteFiles = false

  for (let i = 0; i < fileMatches.length; i++) {
    const filename = fileMatches[i][1].trim()
    const code = codeMatches[i] ? codeMatches[i][1].trim() : ""

    const normalized = normalizePath(filename)

    if (!canModify(normalized, PROTECTED_FILES, PROTECTED_DIRECTORIES)) {
      console.log("🚫 Peachy blocked from modifying:", filename)
      continue
    }

    fs.mkdirSync(path.dirname(filename), { recursive: true })
    fs.writeFileSync(filename, code)

    wroteFiles = true
    console.log("✨ Peachy created:", filename)
  }

  // -----------------------------
  // Delete redundant files
  // -----------------------------

  for (const match of deleteMatches) {
    const deletePath = match[1].trim()
    const normalized = normalizePath(deletePath)

    if (!canModify(normalized, PROTECTED_FILES, PROTECTED_DIRECTORIES)) {
      console.log("🚫 Peachy blocked from deleting:", deletePath)
      continue
    }

    if (fs.existsSync(deletePath)) {
      try {
        fs.unlinkSync(deletePath)
        wroteFiles = true
        console.log("🗑️ Peachy deleted:", deletePath)
      } catch {
        console.log("❌ Failed to delete:", deletePath)
      }
    }
  }

  // -----------------------------
  // Build test
  // -----------------------------

  if (wroteFiles) {
    const buildResult = runBuildCheck()

    if (buildResult.ok) {
      console.log("✅ Build test passed")
    } else {
      console.log("⚠️ Build test skipped/failed:", buildResult.message)
      memory.failed.push(`Build check: ${buildResult.message}`)
    }
  }

  // -----------------------------
  // Update memory
  // -----------------------------

  const descMatch = text.match(/description:\s*([\s\S]*)/)
  const description = descMatch ? descMatch[1].trim() : "No description"

  memory.completed.push(description)

  fs.writeFileSync(
    "./peachy_memory.json",
    JSON.stringify(memory, null, 2)
  )

  // -----------------------------
  // Update tasks
  // -----------------------------

  const finished = taskData.queue.shift()

  if (finished) {
    taskData.completed.push(finished)
  }

  fs.writeFileSync(
    "./peachy_tasks.json",
    JSON.stringify(taskData, null, 2)
  )

  // -----------------------------
  // Log
  // -----------------------------

  fs.appendFileSync(
    "./peachy_log.txt",
    `${new Date().toISOString()} - ${description}\n`
  )

  console.log("🧠 Memory updated")
}

runAgent()