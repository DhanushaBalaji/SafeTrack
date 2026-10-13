
async function checkBeforeSharing() {
  const text = document.getElementById("shareText").value.trim();
  const status = document.getElementById("shareStatus");
  const button = document.getElementById("checkButton");
  const result = document.getElementById("shareResult");

  if (!text) {
    status.textContent = "Paste a message before checking.";
    return;
  }

  button.disabled = true;
  status.textContent = "Checking the message against web evidence...";
  result.classList.add("hidden");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim: text })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not check this message.");
    }

    const category = data.category || "Insufficient evidence";

    let risk = "CAUTION — Evidence is inconclusive";
    if (category === "Contradicted by available evidence") {
      risk = "HIGH CAUTION — Evidence contradicts this claim";
    } else if (category === "Misleading or missing context") {
      risk = "CAUTION — Important context may be missing";
    } else if (category === "Supported by available evidence") {
      risk = "EVIDENCE FOUND — Still verify the original sources";
    } else if (category === "Disputed or unresolved") {
      risk = "CAUTION — Sources disagree or the issue is unresolved";
    } else if (category === "Opinion, prediction, or satire") {
      risk = "CONTEXT CHECK — This may be opinion, prediction, or satire";
    }

    document.getElementById("riskLabel").textContent = risk;
    document.getElementById("shareSummary").textContent =
      data.summary || "No summary returned.";

    document.getElementById("shareReason").textContent =
      "Assessment: " + category + ". " +
      (data.uncertainty || "Limitations were not specified.");

    const sources = document.getElementById("shareSources");
    sources.replaceChildren();

    const allSources = Array.isArray(data.sources_used)
      ? data.sources_used
      : [];

    if (!allSources.length) {
      sources.textContent = "No web sources were retrieved.";
    } else {
      allSources.forEach(source => {
        if (!source.url) return;

        const item = document.createElement("li");
        const link = document.createElement("a");

        link.href = source.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = source.title || source.url;

        item.appendChild(link);
        sources.appendChild(item);
      });
    }

    result.classList.remove("hidden");
    status.textContent = "Check complete. Review the sources before sharing.";
  } catch (error) {
    status.textContent = "Error: " + error.message;
  } finally {
    button.disabled = false;
  }
}
