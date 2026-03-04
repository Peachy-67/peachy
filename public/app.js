const state = {
  lastResult: null,
};

async function analyze(text) {
  const resp = await fetch("/v1/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.message || data?.error || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSummaryWhy(result) {
  if (Array.isArray(result?.why) && result.why.length) return String(result.why[0]);
  if (Array.isArray(result?.reaction) && result.reaction.length)
    return String(result.reaction[0]);
  return "Some mixed signals showed up. Keep your eyes open.";
}

function getWatchLine(result) {
  if (Array.isArray(result?.watch_next) && result.watch_next.length)
    return String(result.watch_next[0]);
  return "Consistency over time.";
}

function getShareText(result) {
  const verdictLabel = result?.verdict?.label ?? "Unknown";
  const verdictScore =
    typeof result?.verdict?.score === "number" ? result.verdict.score : "?";

  return [
    `FLAGGED: ${verdictLabel} (${verdictScore}/10)`,
    getSummaryWhy(result),
    `Watch next: ${getWatchLine(result)}`,
    window.location.origin,
  ].join("\n");
}

function render(result) {
  const verdictLabel = result?.verdict?.label ?? "Unknown";
  const verdictScore =
    typeof result?.verdict?.score === "number" ? result.verdict.score : "?";
  const verdictBand = ["green", "yellow", "red"].includes(result?.verdict?.band)
    ? result.verdict.band
    : "yellow";

  const watchNext = Array.isArray(result?.watch_next) ? result.watch_next : [];
  const why = Array.isArray(result?.why) ? result.why : [];

  return `
    <div class="result-card ${escapeHtml(verdictBand)}">
      <h2>Verdict: ${escapeHtml(verdictLabel)} (${escapeHtml(verdictScore)}/10)</h2>

      <h3>Why</h3>
      <ul>${why.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>

      <h3>What to watch next</h3>
      <ul>${watchNext.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </div>
  `;
}

function updateCredits(result) {
  const creditsEl = document.getElementById("creditsInfo");
  const usage = result?.usage && typeof result.usage === "object" ? result.usage : {};

  const freeRunsRemaining =
    typeof usage.free_runs_remaining === "number"
      ? usage.free_runs_remaining
      : null;

  const creditsRemaining =
    typeof usage.credits_remaining === "number" ? usage.credits_remaining : null;

  if (freeRunsRemaining === null && creditsRemaining === null) {
    creditsEl.textContent = "3 free runs • Credits: --";
    return;
  }

  const freeText =
    freeRunsRemaining === null ? "3 free runs" : `${freeRunsRemaining} free runs`;
  const creditText = creditsRemaining === null ? "Credits: --" : `Credits: ${creditsRemaining}`;
  creditsEl.textContent = `${freeText} • ${creditText}`;
}

function dataUrlToFile(dataUrl, filename) {
  const [header, b64] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(header)?.[1] || "image/png";
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);

  lines.forEach((line, idx) => {
    ctx.fillText(line, x, y + idx * lineHeight);
  });

  return y + lines.length * lineHeight;
}

function createShareCardDataUrl(result) {
  const size = 1080;
  const pad = 84;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const band = result?.verdict?.band || "yellow";
  const colorMap = {
    green: { bg: "#EAFBF0", accent: "#2ECC71", text: "#0E2215" },
    yellow: { bg: "#FFF9E4", accent: "#F1C40F", text: "#2A2300" },
    red: { bg: "#FFECEC", accent: "#E74C3C", text: "#2A0C08" },
  };
  const palette = colorMap[band] || colorMap.yellow;

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = palette.accent;
  ctx.fillRect(0, 0, size, 18);

  let y = pad;

  ctx.fillStyle = "#444";
  ctx.font = "600 42px system-ui";
  ctx.fillText("FLAGGED", pad, y);

  y += 86;
  const label = result?.verdict?.label || "Unknown";
  const score = typeof result?.verdict?.score === "number" ? result.verdict.score : "?";
  ctx.fillStyle = palette.text;
  ctx.font = "700 94px system-ui";
  ctx.fillText(`${label} ${score}/10`, pad, y);

  y += 74;
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(size - pad, y);
  ctx.stroke();

  y += 70;
  ctx.fillStyle = palette.text;
  ctx.font = "600 42px system-ui";
  ctx.fillText("Why", pad, y);

  y += 54;
  ctx.font = "500 34px system-ui";
  const whyBullets = (Array.isArray(result?.why) ? result.why : []).slice(0, 3);
  if (!whyBullets.length) whyBullets.push(getSummaryWhy(result));

  whyBullets.forEach((line) => {
    ctx.fillText("•", pad, y);
    y = drawWrappedText(ctx, line, pad + 28, y, size - pad * 2 - 30, 46, 2) + 12;
  });

  y += 20;
  ctx.font = "600 40px system-ui";
  ctx.fillText("Watch next", pad, y);
  y += 50;
  ctx.font = "500 34px system-ui";
  y = drawWrappedText(
    ctx,
    getWatchLine(result),
    pad,
    y,
    size - pad * 2,
    46,
    2
  );

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.font = "500 26px system-ui";
  ctx.fillText(window.location.origin, pad, size - pad);

  return canvas.toDataURL("image/png");
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function copyVerdict() {
  if (!state.lastResult) return;
  const text = getShareText(state.lastResult);
  await navigator.clipboard.writeText(text);
}

async function shareResult() {
  if (!state.lastResult) return;

  const text = getShareText(state.lastResult);
  const dataUrl = createShareCardDataUrl(state.lastResult);

  if (navigator.share) {
    try {
      const file = dataUrlToFile(dataUrl, "flagged-share-card.png");
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "FLAGGED",
          text,
          files: [file],
        });
        return;
      }

      await navigator.share({
        title: "FLAGGED",
        text,
        url: window.location.origin,
      });
      return;
    } catch (_err) {
      // fallback below
    }
  }

  await copyVerdict();
  downloadDataUrl(dataUrl, "flagged-share-card.png");
  alert("Share fallback used: copied text + downloaded card.");
}

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const input = document.getElementById("inputText").value;
  const resultEl = document.getElementById("result");
  const actionsEl = document.getElementById("resultActions");

  resultEl.innerHTML = "Analyzing…";
  actionsEl.classList.add("hidden");

  try {
    const data = await analyze(input);
    state.lastResult = data;
    resultEl.innerHTML = render(data);
    updateCredits(data);
    actionsEl.classList.remove("hidden");
  } catch (e) {
    state.lastResult = null;
    resultEl.innerHTML = `<p class="error"><b>Error:</b> ${escapeHtml(
      e?.message || e
    )}</p>`;
  }
});

document.getElementById("copyVerdictBtn").addEventListener("click", async () => {
  try {
    await copyVerdict();
    alert("Verdict copied.");
  } catch {
    alert("Could not copy. Please copy manually.");
  }
});

document.getElementById("downloadCardBtn").addEventListener("click", () => {
  if (!state.lastResult) return;
  const dataUrl = createShareCardDataUrl(state.lastResult);
  downloadDataUrl(dataUrl, "flagged-share-card.png");
});

document.getElementById("shareBtn").addEventListener("click", async () => {
  try {
    await shareResult();
  } catch {
    alert("Share failed.");
  }
});
