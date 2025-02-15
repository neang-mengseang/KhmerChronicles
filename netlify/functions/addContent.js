const contentful = require("contentful-management");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }
  console.log("Received Data: ", JSON.parse(event.body));
  const { userId, contentType, title, introduction, content, featuredImageId } = JSON.parse(event.body);

  try {
    const client = contentful.createClient({
      accessToken: process.env.CONTENTFUL_CMA_TOKEN,
    });

    const space = await client.getSpace(process.env.SPACE_ID);
    const environment = await space.getEnvironment("master");

    // Fetch author details
    const authorEntry = await fetchAuthorByUserId(environment, userId);
    if (!authorEntry) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Author not found" }),
      };
    }
    const { username, userImage } = authorEntry.fields;
    console.log("User image Found: ", userImage);
    // Convert Quill Delta to Contentful Rich Text (Only Text Allowed)
    const richTextContent = convertQuillToContentful(content);

    // Create entry fields
    let entryFields = {
      title: { "en-US": title },
      authorId: { "en-US": userId },
      authorName: { "en-US": username["en-US"] },
      authorImage:  userImage,
      dateCreate: { "en-US": new Date().toISOString() },
      image: featuredImageId
        ? { "en-US": { sys: { id: featuredImageId, linkType: "Asset", type: "Link" } } }
        : null,
    };

    if (contentType === "foodArticle" || contentType === "travelArticles") {
      entryFields.content = { "en-US": richTextContent };
      entryFields.introduction = { "en-US": introduction };
    } else if (contentType === "cuisineGallery") {
      entryFields.summary = { "en-US": introduction };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid content type" }),
      };
    }

    // Create entry in Contentful
    const entry = await environment.createEntry(contentType, { fields: entryFields });

    // Publish the entry to make it public
    await entry.publish();
    console.log("✅ Entry published:", entry.sys.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Content added successfully!", entryId: entry.sys.id }),
    };
  } catch (error) {
    console.error("❌ Error adding content:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to add content" }),
    };
  }
};

// Function to fetch author data based on userId
async function fetchAuthorByUserId(environment, userId) {
  console.log("Fetching author by userId:", userId);
  
  try {
    const entries = await environment.getEntries({
      content_type: "user", // Assuming "user" is the content type for author information
      "fields.id": userId, // Filter by userId field
    });

    console.log("Fetched author entries:", entries.items.length);

    return entries.items.length > 0 ? entries.items[0] : null; // Return the first match if found
  } catch (error) {
    console.error("❌ Error fetching author:", error);
    throw new Error("Error fetching author data");
  }
}

// Convert Quill Delta to Contentful Rich Text format (Only Text Allowed)
function convertQuillToContentful(delta) {
  return {
    nodeType: "document",
    data: {},
    content: delta.ops
      .map((op) => {
        if (typeof op.insert === "string") {
          return {
            nodeType: "paragraph",
            content: [{ nodeType: "text", value: op.insert.trim(), marks: [], data: {} }],
            data: {},
          };
        }
        return null;
      })
      .filter(Boolean),
  };
}
