const contentful = require("contentful-management");

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_CMA_TOKEN
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    const userData = JSON.parse(event.body);
    console.log("✅ Received user data:", userData);

    const space = await client.getSpace(process.env.SPACE_ID);
    const environment = await space.getEnvironment("master");

    // ✅ Check if user already exists
    const entries = await environment.getEntries({
      content_type: "user",
      "fields.id": userData.id
    });

    if (entries.items.length > 0) {
      console.log("✅ User already exists:", entries.items[0].fields.username["en-US"]);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "User already exists",
          user: entries.items[0].fields
        })
      };
    }

    // ✅ Create new user if not found
    const entry = await environment.createEntry("user", {
      fields: {
        username: { "en-US": userData.username },
        id: { "en-US": userData.id },
        email: { "en-US": userData.email },
        userImage: { "en-US": {} },  // Empty object for image placeholder
        posted: { "en-US": [] } // Empty array for posts
      }
    });

    await entry.publish();
    console.log("✅ New user created:", entry.sys.id);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "User created",
        user: entry.fields
      })
    };

  } catch (error) {
    console.error("❌ Error in backend:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
