const fetch = require("node-fetch");

exports.handler = async function (event) {
    const API_KEY = "0a298266397a4879b101e6f93bac8d8b"; // Replace with your actual API key
    const { q, sortBy } = event.queryStringParameters;

    let url = `https://newsapi.org/v2/everything?language=en&apiKey=${API_KEY}&sortBy=${sortBy || "relevancy"}`;

    if (q) {
        url += `&q=${encodeURIComponent(q)}`;
    } else {
        url += `&q=cambodia`;  // Default search term
    }

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
            body: JSON.stringify({ error: "Failed to fetch news" }),
        };
    }
};
