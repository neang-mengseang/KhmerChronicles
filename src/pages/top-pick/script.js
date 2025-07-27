async function fetchRankings(contentType) {
  try {
    const res = await fetch(
      `/.netlify/functions/fetchContent?contentType=${contentType}`
    );
    const entries = await res.json();

    // Dynamically get the correct array
    const dataKey = Object.keys(entries).find((key) =>
      Array.isArray(entries[key])
    );
    const rankingItems = entries[dataKey] || [];

    // Sort by ranking
    const sortedItems = rankingItems.sort(
      (a, b) => a.fields.ranking - b.fields.ranking
    );

    displayRankings(sortedItems);
    console.log(`✅ Rankings fetched: ${sortedItems.length} items`);
    console.log(sortedItems);
  } catch (error) {
    console.error("❌ Error fetching content:", error);
  }
}

function displayRankings(items) {
  const section = document.getElementById("ranking");
  section.innerHTML = "";

  items.forEach((item) => {
    const link = document.createElement("a");
    link.href = `/top-pick/${item.fields.ranking}`;  // or use item.fields.slug if available
    link.classList.add("item-link");

    const div = document.createElement("div");
    div.classList.add("item");

    div.setAttribute("data-title", item.fields.title);
    div.setAttribute("data-image", item.fields.image);
    div.setAttribute(
      "data-description",
      item.fields.descriptionHtml || "No information provided!"
    );

    const previewText = truncateText(
      stripHtml(item.fields.descriptionHtml || "No information provided!"),
      150
    );

    div.innerHTML = `
      <div class="ranking-badge"><span>${item.fields.ranking}</span></div>
      <img src="${item.fields.image}" alt="${item.fields.title}">
      <div class="card-content">
        <h2>${item.fields.title}</h2>
        <p class="short-description">${previewText}</p>
      </div>
    `;

    link.appendChild(div);
    section.appendChild(link);
  });
}


function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// 🔃 Start fetching
fetchRankings("topPick");
