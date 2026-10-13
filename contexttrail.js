
async function searchNews() {
  const topic = document.getElementById("newsTopic").value.trim();
  const status = document.getElementById("newsStatus");
  const button = document.getElementById("searchButton");
  const results = document.getElementById("newsResults");
  const timeline = document.getElementById("newsTimeline");
  const note = document.getElementById("resultNote");

  results.classList.add("hidden");
  timeline.replaceChildren();

  if (!topic) {
    status.textContent = "Please enter a news headline or topic.";
    return;
  }

  button.disabled = true;
  status.textContent = "Searching the web for related news...";
  
  try {
    const response = await fetch("/api/news-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "News search failed.");
    }

    const articles = data.articles || [];

    if (articles.length === 0) {
      status.textContent = "No related news articles were found. Try another topic.";
      return;
    }

    note.textContent =
      `Found ${articles.length} related articles. Dates and summaries are based on the search results; they do not necessarily represent confirmed changes in the story.`;

    articles.forEach(article => {
      const card = document.createElement("article");
      card.className = "card";

      const heading = document.createElement("h3");
      heading.textContent = article.title || "Untitled article";
      card.appendChild(heading);

      const date = document.createElement("p");
      date.textContent = "Published: " +
        (article.published_date || "Date not provided");
      card.appendChild(date);

      const summary = document.createElement("p");
      summary.textContent =
        article.content || "No summary available.";
      card.appendChild(summary);

      const source = document.createElement("p");
      source.textContent = "Source: " +
        (article.source || "Website");
      card.appendChild(source);

      if (article.url) {
        try {
          const linkUrl = new URL(article.url);

          if (linkUrl.protocol === "https:" ||
              linkUrl.protocol === "http:") {
            const link = document.createElement("a");
            link.href = linkUrl.href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Read original article";
            card.appendChild(link);
          }
        } catch {
          // Do not display an invalid article link.
        }
      }

      timeline.appendChild(card);
    });

    results.classList.remove("hidden");
    status.textContent = "News search completed.";
  } catch (error) {
    status.textContent = error.message ||
      "Unable to search for news. Please try again.";
  } finally {
    button.disabled = false;
  }
}