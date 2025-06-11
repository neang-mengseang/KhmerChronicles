async function fetchFoodRankings() {
  try {
    const contentType = "foodRanking";
    const res = await fetch(
      `/.netlify/functions/fetchContent?contentType=${contentType}`
    );

    const entries = await res.json();  // Make sure to parse the JSON response
    console.log(entries.foodRanking);

    // Sort the food items by 'ranking' field in ascending order
    const sortedItems = entries.foodRanking.sort((a, b) => {
      return a.fields.ranking - b.fields.ranking;
    });

    displayFoodRankings(sortedItems);
  } catch (error) {
    console.error("Error fetching content:", error);
  }
}

function displayFoodRankings(items) {
  const foodSection = document.getElementById("food-ranking");
  foodSection.innerHTML = "";

  items.forEach((item) => {
    console.log(item);
    const foodItem = document.createElement("div");
    foodItem.classList.add("food-item");

    foodItem.innerHTML = `
    <div class="ranking-badge">
        <span>${item.fields.ranking}</span>
    </div>

    <div class="card-content">
        <h2>${item.fields.title}</h2>
         
        <p>${item.fields.description || "No information provided!"}</p> 

    </div>
        <img src="${item.fields.image}" alt="${
      item.fields.title
    }">

`;

    foodSection.appendChild(foodItem);
  });
}

fetchFoodRankings();
