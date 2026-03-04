async function runAgent() {
  console.log("Peachy agent starting...");

  try {
    const res = await fetch("http://localhost:3000/heartbeat");
    const data = await res.text();

    console.log("Agent heartbeat:", data);
  } catch (err) {
    console.error("Agent error:", err.message);
  }

  console.log("Agent run complete.");
}

runAgent();