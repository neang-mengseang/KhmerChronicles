exports.handler = async (event, context) => {
    // Simulating data from a JSON file
    const items = [
        { id: 1, title: "Project 1", description: "Dynamic page for project 1" },
        { id: 2, title: "Project 2", description: "Dynamic page for project 2" }
    ];

    const { id } = event.queryStringParameters; // Get the item ID from query params
    const item = items.find(item => item.id === parseInt(id));

    if (!item) {
        return {
            statusCode: 404,
            body: "Item not found"
        };
    }

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${item.title}</title>
        </head>
        <body>
            <h1>${item.title}</h1>
            <p>${item.description}</p>
        </body>
        </html>
    `;

    return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: html
    };
};
