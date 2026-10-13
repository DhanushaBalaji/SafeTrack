
async function analyzeClaim() {
  const claim = document.getElementById("claim").value.trim();
  const status = document.getElementById("status");
  const button = document.getElementById("analyzeBtn");
  const result = document.getElementById("result");

  if (!claim) {
    status.textContent = "Please enter a claim first.";
    return;
  }

  button.disabled = true;
  status.textContent = "Searching the web and analyzing evidence...";
  result.classList.add("hidden");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ claim })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed.");
    }

    // The backend returns these fields directly in data
    document.getElementById("category").textContent =
      data.category || "Insufficient evidence";

    document.getElementById("summary").textContent =
      data.summary || "No summary available.";

    document.getElementById("context").textContent =
      Array.isArray(data.missing_context)
        ? data.missing_context.join(" ")
        : data.missing_context || "No additional context provided.";

    document.getElementById("uncertainty").textContent =
      data.uncertainty || "Uncertainty not specified.";

    showEvidence(
      "supporting",
      data.supporting_evidence || []
    );

    showEvidence(
      "contradicting",
      data.contradicting_evidence || []
    );

    result.classList.remove("hidden");
    status.textContent = "Analysis complete.";

    await loadHistory();
  } catch (error) {
    status.textContent = "Error: " + error.message;
  } finally {
    button.disabled = false;
  }
}

// Display evidence and links
function showEvidence(elementId, items) {
  const list = document.getElementById(elementId);
  list.replaceChildren();

  if (!Array.isArray(items) || items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No evidence found in this category.";
    list.appendChild(li);
    return;
  }

  items.forEach(item => {
    const li = document.createElement("li");
    const link = document.createElement("a");

    link.href = item.url;
    link.textContent = item.title || item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    li.appendChild(link);

    // The backend uses "reason", not "explanation"
    if (item.reason) {
      const note = document.createElement("p");
      note.textContent = item.reason;
      li.appendChild(note);
    }

    list.appendChild(li);
  });
}

// Load saved analyses
async function loadHistory() {
  const list = document.getElementById("history");
  list.replaceChildren();

  try {
    const response = await fetch("/api/history");

    if (!response.ok) {
      throw new Error("Could not load history.");
    }

    const records = await response.json();

    if (!records.length) {
      const li = document.createElement("li");
      li.textContent = "No previous checks yet.";
      list.appendChild(li);
      return;
    }

    records.forEach(record => {
      const li = document.createElement("li");

      li.textContent =
        record.claim + " — " +
        (record.category || "Analysis saved");

      list.appendChild(li);
    });
  } catch (error) {
    list.textContent = "History unavailable.";
  }
}

// Load history when the page opens
loadHistory();
