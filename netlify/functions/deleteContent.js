const contentful = require("contentful-management");

exports.handler = async (event) => {
  console.log("🔁 Received request:", event.httpMethod);

  // Allow only DELETE requests
  if (event.httpMethod !== "POST") {
    console.log("❌ Method not allowed");
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // Parse body safely
  let entryId;
  try {
    console.log("🔍 Raw body:", event.body);
    const body = event.body ? JSON.parse(event.body) : null;
    entryId = body?.entryId;
    console.log("🆔 Parsed entryId:", entryId);
  } catch (err) {
    console.log("❌ Failed to parse JSON body:", err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!entryId) {
    console.log("❌ entryId is missing in request body");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing entryId" }),
    };
  }

  // Connect to Contentful
  console.log("🔐 Creating Contentful client...");
  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_CMA_TOKEN,
  });

  try {
    console.log("🌌 Getting space:", process.env.SPACE_ID);
    const space = await client.getSpace(process.env.SPACE_ID);

    const envName = process.env.CONTENTFUL_ENVIRONMENT || "master";
    console.log("🌍 Getting environment:", envName);
    const environment = await space.getEnvironment(envName);

    console.log("📦 Getting entry:", entryId);
    const entry = await environment.getEntry(entryId);

    if (entry.isPublished && entry.isPublished()) {
      console.log("🧹 Unpublishing entry...");
      await entry.unpublish();
    } else {
      console.log("⚠️ Entry is not published — skipping unpublish");
    }

    console.log("🗑️ Deleting entry...");
    await environment.deleteEntry(entryId);

    console.log("✅ Successfully deleted entry:", entryId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Entry ${entryId} deleted successfully.`,
      }),
    };
  } catch (error) {
    console.error("💥 Contentful operation failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal Server Error" }),
    };
  }
};
