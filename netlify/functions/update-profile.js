const contentful = require("contentful-management");
const cma_token = process.env.CONTENTFUL_CMA_TOKEN;
const spaceId = process.env.SPACE_ID;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.handler = async (event) => {
  console.log("==> Function triggered");

  try {
    if (!spaceId || !cma_token) {
      console.error("ERROR: Missing environment variables");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing environment variables" }),
      };
    }

    const client = contentful.createClient({ accessToken: cma_token });
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment("master");

    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
      console.log("==> Requested Body Detected");
    } catch (parseError) {
      console.error("ERROR parsing request body:", parseError);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }

    let userEntry;
    try {
      userEntry = await environment.getEntry(requestBody.entry_id);
      console.log(`==> User Entry Found: ${userEntry.sys.id}`);
    } catch (error) {
      console.error("ERROR: User profile not found:", error);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User profile not found" }),
      };
    }

    const userId = userEntry.fields.id["en-US"];
    let updatedFields = {};

    if (requestBody.fields.username) {
      updatedFields.username = { "en-US": requestBody.fields.username };
    }

    if (requestBody.fields.bio) {
      updatedFields.bio = { "en-US": requestBody.fields.bio };
    }

    let updatedUserImage = null;

    if (requestBody.fields.image) {
      try {
        console.log("==> Uploading new profile picture...");
        const uploadedAsset = await environment.createAssetFromFiles({
          fields: {
            title: { "en-US": requestBody.fields.image.title || "Profile Picture" },
            file: {
              "en-US": {
                contentType: requestBody.fields.image.contentType,
                fileName: requestBody.fields.image.fileName,
                file: Buffer.from(requestBody.fields.image.data, "base64"),
              },
            },
          },
        });

        const publishedAsset = await uploadedAsset.processForAllLocales();
        const processedAsset = await environment.getAsset(publishedAsset.sys.id);
        await processedAsset.publish();

        updatedFields.userImage = {
          "en-US": { sys: { type: "Link", linkType: "Asset", id: processedAsset.sys.id } },
        };

        updatedUserImage = processedAsset.sys.id;
      } catch (imageError) {
        console.error("ERROR uploading profile picture:", imageError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Error uploading profile picture: " + imageError.message }),
        };
      }
    }

    // Update the user profile if changes were made
    if (Object.keys(updatedFields).length > 0) {
      try {
        userEntry.fields = { ...userEntry.fields, ...updatedFields };
        const updatedUserEntry = await userEntry.update();
        await updatedUserEntry.publish();
        console.log("✅ User profile updated successfully!");
      } catch (error) {
        console.error("❌ Failed to update user profile!", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to update user profile" }) };
      }

      // Fetch articles and galleries related to the user
      const [travelArticles, foodArticles, cuisineGallery, travelGallery] = await Promise.all([
        environment.getEntries({ content_type: "travelArticles", "fields.authorId": userId }),
        environment.getEntries({ content_type: "foodArticle", "fields.authorId": userId }),
        environment.getEntries({ content_type: "cuisineGallery", "fields.authorId": userId }),
        environment.getEntries({ content_type: "travelGallery", "fields.authorId": userId }),
      ]);

      console.log(`Found ${travelArticles.items.length} travel articles to update`);
      console.log(`Found ${foodArticles.items.length} food articles to update`);
      console.log(`Found ${cuisineGallery.items.length} Cuisine Galleries to update`);
      console.log(`Found ${travelGallery.items.length} Travel Galleries to update`);

      // Helper function to update articles/galleries
      const updateContent = async (contentItems, updatedUserImage, updatedUsername) => {
        for (let i = 0; i < contentItems.length; i++) {
          const content = contentItems[i];
          try {
            content.fields.authorName = { "en-US": updatedUsername || content.fields.authorName["en-US"] };
            if (updatedUserImage) {
              content.fields.authorImage = {
                "en-US": { sys: { type: "Link", linkType: "Asset", id: updatedUserImage } },
              };
            }

            const updatedContent = await content.update();
            await updatedContent.publish();
            console.log(`✅ Content with ID ${content.sys.id} updated successfully!`);
          } catch (error) {
            console.error(`❌ Failed to update content with ID ${content.sys.id}: ${error.message}`);
          }

          // Add delay to avoid rate limits
          if (i % 5 === 0) {
            console.log("Waiting 1000ms to avoid rate limit...");
            await delay(1000);
          }
        }
      };

      // Update content in batches
      await Promise.all([
        updateContent(travelArticles.items, updatedUserImage, requestBody.fields.username),
        updateContent(foodArticles.items, updatedUserImage, requestBody.fields.username),
        updateContent(cuisineGallery.items, updatedUserImage, requestBody.fields.username),
        updateContent(travelGallery.items, updatedUserImage, requestBody.fields.username),
      ]);

      console.log("✅ All related articles (food and travel) attempted for update!");

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Profile and related articles updated successfully!",
          success: true,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "No updates were made.", success: false }),
    };
  } catch (error) {
    console.error("ERROR in update-profile function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || error.toString() }),
    };
  }
};
