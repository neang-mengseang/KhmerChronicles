const SPACE_ID = "ntvh3j97dkce";
const ACCESS_TOKEN = "UC-xnFZuPk2OsBKWYLdZ8H6kwocji0aL37B5OvtH8HM";
const CONTENT_TYPE_ID = "foodRanking";

async function fetchFoodRankings() {
  try {
    const client = contentful.createClient({
      space: SPACE_ID,
      accessToken: ACCESS_TOKEN,
    });

    const entries = await client.getEntries({ content_type: CONTENT_TYPE_ID });

    // Sort the food items by 'ranking' field in ascending order
    const sortedItems = entries.items.sort((a, b) => {
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
    <img src="https:${item.fields.image.fields.file.url}" alt="${
      item.fields.title
    }">
    <div class="card-content">
        <h2>${item.fields.title}</h2>
         
        <p>${item.fields.description || "No information provided!"}</p> 
        <a href="/foodranking/${item.fields.title
          .toLowerCase()
          .replace(/\s+/g, "-")}.html" class="view-btn">Read More</a> 
        
    </div>

`;

    foodSection.appendChild(foodItem);
  });
}

fetchFoodRankings();
