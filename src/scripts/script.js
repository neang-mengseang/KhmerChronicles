async function fetchContentCounts() {
    const contentTypes = encodeURIComponent("foodArticle,travelArticles");
  
    try {
      const res = await fetch(`/.netlify/functions/fetchContent?contentType=${contentTypes}`);
      const data = await res.json();
  
      if (!data || !data.success) {
        throw new Error("Invalid response structure");
      }
      
      return data;
    } catch (err) {
      console.error("Error fetching content counts:", err);
      return { success: false, foodArticle: [] };
    }
  }
  
  async function fetchImageUrl(assetId) {
    try {
      const res = await fetch(`/.netlify/functions/fetchAsset?assetId=${assetId}`);
      const data = await res.json();
      console.log(data);
      return data.imageUrl || "https://via.placeholder.com/100";
    } catch (err) {
      console.error("Error fetching image:", err);
      return "https://via.placeholder.com/100"; // Fallback image
    }
  }
  
  window.addEventListener("load", async () => {
    const data = await fetchContentCounts();
  
    if (!data.success || !Array.isArray(data.foodArticle)) {
      console.error("Invalid data structure received:", data);
      return;
    }
  
    const foodCard1 = document.getElementById("fcard1");
    const foodCard2 = document.getElementById("fcard2");

    const travelCard1 = document.getElementById("tcard1");
    const travelCard2 = document.getElementById("tcard2");
    
    async function createFoodCard(article, contentType) {
      if (!article || !article.fields) return "<p>Article data missing.</p>";
  
      const title = article.fields.title || "Untitled Article";
      const intro = article.fields.introduction || "No description available.";
      const authorName = article.fields.author.name || "Unknown Author";
      const imageId = article.fields.image?.sys?.id; // Get image ID from the article
      //const imgSrc = imageId ? await fetchImageUrl(imageId) : "https://via.placeholder.com/100";
      
      return `
        <a href="${contentType}/${generateSlug(article.fields.title)}">
            <img src="${article.fields.image}" alt="${article.title}" class="article-image">
            <div>
            <h3>${title}</h3>
              <p>By: ${authorName}</p>
            <p>${intro}</p>
            </div>
        </a>

      `;
    }
  
    if (data.foodArticle.length > 0) {
      foodCard1.innerHTML = await createFoodCard(data.foodArticle[0], "food-article");
    } else {
      foodCard1.innerHTML = "<p>No food articles available.</p>";
    }
  
    if (data.foodArticle.length > 1) {
      foodCard2.innerHTML = await createFoodCard(data.foodArticle[1], "food-article");
    } else {
      foodCard2.innerHTML = "<p>No second food article available.</p>";
    }

    if (data.travelArticles.length > 0) {
        travelCard1.innerHTML = await createFoodCard(data.travelArticles[0], "travel-article");
      } else {
        travelCard1.innerHTML = "<p>No second food article available.</p>";
      }

      if (data.travelArticles.length > 1) {
        travelCard2.innerHTML = await createFoodCard(data.travelArticles[1], "travel-article");
      } else {
        travelCard2.innerHTML = "<p>No second food article available.</p>";
      }
  });
  

  function generateSlug(title) {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')   // Remove special characters
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/^-+|-+$/g, '');       // Remove leading & trailing hyphens
  } 