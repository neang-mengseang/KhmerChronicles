const fetch = require('node-fetch');

const API_KEY = "0a298266397a4879b101e6f93bac8d8b"; // Your NewsAPI key

exports.handler = async function(event, context) {
    const { country, category, query } = event.queryStringParameters; // Get query params from the request

    // Build NewsAPI URL
    let url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${API_KEY}`;

    if (category) {
        url += `&category=${category}`;
    }
    if (query) {
        url += `&q=${encodeURIComponent(query)}`;
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
            body: JSON.stringify({ error: 'Error fetching news' }),
        };
    }
};
