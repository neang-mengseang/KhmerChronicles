const contentful = require("contentful-management");

exports.handler = async (event) => {
    if (event.httpMethod !== "DELETE") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    const { entryId } = JSON.parse(event.body);
    if (!entryId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing entryId" }),
        };
    }

    const client = contentful.createClient({
        accessToken: process.env.CONTENTFUL_CMA_TOKEN, // Store this in Netlify environment variables
    });

    try {
        const space = await client.getSpace(process.env.SPACE_ID);
        const environment = await space.getEnvironment("master"); // Change if needed
        const entry = await environment.getEntry(entryId);

        // Unpublish if published
        if (entry.isPublished()) {
            await entry.unpublish();
        }

        // Delete entry
        await environment.deleteEntry(entryId);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Entry ${entryId} deleted successfully.` }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
