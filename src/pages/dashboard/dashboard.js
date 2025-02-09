function fetchContentCounts() {
    const contentTypes = 'foodArticle, cuisineGallery, travelArticles, travelGallery'; // Example content types

    return fetch(`/.netlify/functions/fetchContent?contentType=${contentTypes}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            return data; // Return the data for use later
        })
        .catch(err => {
            console.error("Error fetching content counts:", err);
        });
}

const fa_count = document.getElementById('food-article-count');
const cg_count = document.getElementById('cuisine-gallery-count');
const ta_count = document.getElementById('travel-article-count');
const tg_count = document.getElementById(`travel-gallery-count`);


function display(fa, cg, ta, tg) {
    fa_count.innerHTML = fa;
    cg_count.innerHTML = cg;
    ta_count.innerHTML = ta;
    tg_count.innerHTML = tg;
}

window.addEventListener('load',  async () => {
    console.log("Dashboard.js is loading...");

    // Wait for the fetchContentCounts to resolve
    let data = await fetchContentCounts();
    // Check if data exists to avoid errors
    if (data && data.foodArticle && data.travelArticles) {
        let fa = data.foodArticle.length;
        let cg = data.cuisineGallery.length;
        let ta = data.travelArticles.length; // Assuming the data contains an array
        let tg = data.travelGallery.length;
        display(fa, cg, ta, tg);
    } else {
        console.error("Failed to fetch content counts or invalid data format.");
    }
});
