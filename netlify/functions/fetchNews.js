const fetch = require("node-fetch");

exports.handler = async function (event) {
    const API_KEY = process.env.news_api_key;

    if (!API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Missing API key in environment variables" }),
        };
    }

    const { q, sortBy, page, pageSize } = event.queryStringParameters;

    let url = `https://newsapi.org/v2/everything?language=en&apiKey=${API_KEY}`;
    url += `&sortBy=${sortBy || "relevancy"}`;
    url += `&page=${page || 1}`;
    url += `&pageSize=${pageSize || 24}`;
    url += `&q=${encodeURIComponent(q || "cambodia")}`;

    console.log("Request URL:", url); // Comment out in production

    try {
        const response = await fetch(url);
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Failed to fetch news",
                detail: error.message,
            }),
        };
    }
};
