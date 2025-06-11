
// Fetch the content counts from the server function
function fetchContentCounts() {
    const contentTypes = 'foodArticle, cuisineGallery, travelArticles, travelGallery'; // Example content types

    return fetch(`/.netlify/functions/fetchContent?contentType=${contentTypes}`)
        .then(res => res.json())
        .then(data => {
            return data; // Return data to use later
        })
        .catch(err => {
            console.error("Error fetching content counts:", err);
        });
}

// Elements to display individual counts
const fa_count = document.getElementById('food-article-count');
const cg_count = document.getElementById('cuisine-gallery-count');
const ta_count = document.getElementById('travel-article-count');
const tg_count = document.getElementById('travel-gallery-count');

// Function to display the fetched counts
function display(fa, cg, ta, tg) {
    fa_count.innerHTML = fa;
    cg_count.innerHTML = cg;
    ta_count.innerHTML = ta;
    tg_count.innerHTML = tg;
}

// Wait for the page to load and then fetch and display the data
window.addEventListener('load', async () => {


    // Fetch content counts
    let data = await fetchContentCounts();

    // Check if the data exists to avoid errors
    if (data && data.foodArticle && data.travelArticles) {
        let fa = data.foodArticle.length;
        let cg = data.cuisineGallery.length;
        let ta = data.travelArticles.length;
        let tg = data.travelGallery.length;

        // Display the counts on the page
        display(fa, cg, ta, tg);

        // Now, create a chart using these values
        const ctx = document.getElementById('myChart').getContext('2d');

        const chartData = {
            labels: ['Food Articles', 'Cuisine Gallery', 'Travel Articles', 'Travel Gallery'],
            datasets: [{
                label: 'Content Counts',
                data: [fa, cg, ta, tg], // Use the fetched data for chart
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 16,
                                family: 'Arial'
                            }
                        }
                    }
                }
            }]
        };

        const myChart = new Chart(ctx, {
            type: 'doughnut', // Chart type
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                    
                }
            }
        });

    } else {
        console.error("Failed to fetch content counts or invalid data format.");
    }
});