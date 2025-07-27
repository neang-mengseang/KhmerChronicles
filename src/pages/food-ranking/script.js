async function fetchRankings(contentType) {
  try {
    const res = await fetch(
      `/.netlify/functions/fetchContent?contentType=${contentType}`
    );

    const entries = await res.json();
    console.log(entries.foodRanking);

    // Sort the food items by 'ranking' field in ascending order
    const sortedItems = entries.foodRanking.sort((a, b) => {
      return a.fields.ranking - b.fields.ranking;
    });

    displayRankings(sortedItems);
  } catch (error) {
    console.error("Error fetching content:", error);
  }
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

function displayRankings(items) {
  const foodSection = document.getElementById("ranking");
  foodSection.innerHTML = "";

  items.forEach((item) => {
    const foodItem = document.createElement("div");
    foodItem.classList.add("item");

    // Attach all necessary data to the foodItem div for modal
    foodItem.setAttribute("data-title", item.fields.title);
    foodItem.setAttribute("data-image", item.fields.image);
    foodItem.setAttribute(
      "data-description",
      item.fields.descriptionHtml || "No information provided!"
    );
    const previewText = truncateText(
      stripHtml(item.fields.descriptionHtml || "No information provided!"),
      150
    );

    foodItem.innerHTML = `
      <div class="ranking-badge">
          <span>${item.fields.ranking}</span>
      </div>

      <img src="${item.fields.image}" alt="${item.fields.title}">

      <div class="card-content">
          <h2>${item.fields.title}</h2>
          <p class="short-description">${previewText}</p>
      </div>
    `;

    foodSection.appendChild(foodItem);
  });
}

document.addEventListener("click", function (e) {
  const card = e.target.closest(".item");
  if (card) {
    const title = card.getAttribute("data-title");
    const image = card.getAttribute("data-image");
    const description = card.getAttribute("data-description");

    document.getElementById("modal-title").textContent = title;
    const modalImage = document.getElementById("modal-image");
    modalImage.src = image;
    modalImage.alt = title;
    document.getElementById("modal-description").innerHTML = description;

    // Show modal with animation
    const modal = document.getElementById("modal");
    modal.classList.add("active");
  }

  if (e.target.id === "modal-close" || e.target.id === "modal") {
    const modal = document.getElementById("modal");
    modal.classList.remove("active");
  }
});
fetchRankings("foodRanking");
