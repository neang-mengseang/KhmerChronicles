/*
const contentful = require("contentful-management");
const cma_token = process.env.CONTENTFUL_CMA_TOKEN;
const spaceId = process.env.SPACE_ID;

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

    let entry;
    try {
      entry = await environment.getEntry(requestBody.entry_id);
      console.log(`==> Entry Found: ${entry.sys.id}`);
    } catch (error) {
      console.error("ERROR: Profile not found:", error);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Profile not found" }),
      };
    }

    let updatedFields = {};

    // ✅ Update username if provided
    if (requestBody.fields.username) {
      updatedFields.username = { "en-US": requestBody.fields.username };
    }

    // ✅ Update bio if provided
    if (requestBody.fields.bio) {
      updatedFields.bio = { "en-US": requestBody.fields.bio };
    }

    // ✅ Handle Profile Picture Update (Only if a new one is provided)
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
          "en-US": {
            sys: { type: "Link", linkType: "Asset", id: processedAsset.sys.id },
          },
        };
      } catch (imageError) {
        console.error("ERROR uploading profile picture:", imageError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Error uploading profile picture: " + imageError.message }),
        };
      }
    }

    // ✅ Apply only if there are changes
    if (Object.keys(updatedFields).length > 0) {
      entry.fields = { ...entry.fields, ...updatedFields };
      const updatedEntry = await entry.update();
      await updatedEntry.publish();
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Profile updated successfully!", entry: updatedEntry, success: true }),
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
*/

const contentful = require("contentful-management");
const cma_token = process.env.CONTENTFUL_CMA_TOKEN;
const spaceId = process.env.SPACE_ID;

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
      console.log(`${JSON.stringify(requestBody)}`);
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

    const userId = userEntry.fields.id["en-US"]; // Get the user's field.id
    let updatedFields = {};

    // ✅ Update username if provided
    if (requestBody.fields.username) {
      updatedFields.username = { "en-US": requestBody.fields.username };
    }

    // ✅ Update bio if provided
    if (requestBody.fields.bio) {
      updatedFields.bio = { "en-US": requestBody.fields.bio };
    }

    let updatedUserImage = null;

    // ✅ Handle Profile Picture Update (Only if a new one is provided)
    if (requestBody.fields.image) {
      try {
        console.log("==> Uploading new profile picture...");

        const uploadedAsset = await environment.createAssetFromFiles({
          fields: {
            title: {
              "en-US": requestBody.fields.image.title || "Profile Picture",
            },
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
        const processedAsset = await environment.getAsset(
          publishedAsset.sys.id
        );
        await processedAsset.publish();

        updatedFields.userImage = {
          "en-US": {
            sys: { type: "Link", linkType: "Asset", id: processedAsset.sys.id },
          },
        };

        updatedUserImage = processedAsset.sys.id; // Store image ID for article updates
      } catch (imageError) {
        console.error("ERROR uploading profile picture:", imageError);
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: "Error uploading profile picture: " + imageError.message,
          }),
        };
      }
    }

    // ✅ Apply only if there are changes
    if (Object.keys(updatedFields).length > 0) {
      try{
        userEntry.fields = { ...userEntry.fields, ...updatedFields };
        const updatedUserEntry = await userEntry.update();
        await updatedUserEntry.publish();
        console.log("✅ User profile updated successfully!");
      }catch (error) {
        console.log("❌ Fail to update user profile!")
        return
      }


      // Get travel articles and food articles that reference the user
      const travelArticlesPromise = environment.getEntries({
        content_type: "travelArticles",
        "fields.authorId": userId,
      });

      const foodArticlesPromise = environment.getEntries({
        content_type: "foodArticle",
        "fields.authorId": userId,
      });

      // Wait for both promises to resolve
      const [travelArticles, foodArticles] = await Promise.all([
        travelArticlesPromise,
        foodArticlesPromise,
      ]);

      console.log(`==> Update ID: ${userId}`);
      console.log(
        `==> Found ${travelArticles.items.length} travel articles to update`
      );
      console.log(
        `==> Found ${foodArticles.items.length} food articles to update`
      );

      // Function to update an article
      const updateArticle = async (
        article,
        updatedUserImage,
        updatedUsername
      ) => {
        try {
          article.fields.authorName = {
            "en-US": updatedUsername || article.fields.authorName["en-US"],
          };

          if (updatedUserImage) {
            article.fields.authorImage = {
              "en-US": {
                sys: { type: "Link", linkType: "Asset", id: updatedUserImage },
              },
            };
          }

          const updatedArticle = await article.update();
          await updatedArticle.publish();
          console.log(
            `✅ Article with ID ${article.sys.id} updated successfully!`
          );
        } catch (error) {
          console.error(
            `❌ Failed to update article with ID ${article.sys.id}: ${error.message}`
          );
        }
      };

      // Update both travel and food articles in parallel
      const updateTravelArticlesPromise = travelArticles.items.map((article) =>
        updateArticle(article, updatedUserImage, requestBody.fields.username)
      );

      const updateFoodArticlesPromise = foodArticles.items.map((article) =>
        updateArticle(article, updatedUserImage, requestBody.fields.username)
      );

      // Wait for all updates to finish
      await Promise.all([
        ...updateTravelArticlesPromise,
        ...updateFoodArticlesPromise,
      ]);

      console.log(
        "✅ All related articles (food and travel) attempted for update!"
      );

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
      body: JSON.stringify({
        message: "No updates were made.",
        success: false,
      }),
    };
  } catch (error) {
    console.error("ERROR in update-profile function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || error.toString() }),
    };
  }
};
