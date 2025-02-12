window.addEventListener('load', async () => {
    const rankingList = document.getElementById('rankingList');
    const data = await fetchContents();

    data.sort((a, b) => a.fields.ranking - b.fields.ranking);


    if ( data.length > 0) {
        rankingList.innerHTML = ""; // Clear previous logs
        data.forEach((item) => {
            const list = document.createElement("li");
            list.className = "rankingItem";
            list.innerHTML = `
                <div class="ranking_item_container"><span><div class="rank">${item.fields.ranking || "N/A"}</div><p class="title">${item.fields.title || "Unknown Title"}</p></span><button class="edit_btn"><i class="fa-regular fa-pen-to-square"></i></button></div>
            `
            rankingList.appendChild(list);
            console.log(item.fields);
        })
    }
})

// Fetch the content counts from the server function
function fetchContents() {
    const contentTypes = 'foodRanking';
    return fetch(`/.netlify/functions/fetchContent?contentType=${contentTypes}`)
        .then(res => res.json())
        .then(data => {
            return data.foodRanking; 
        })
        .catch(err => {
            console.error("Error fetching content counts:", err);
        });
}