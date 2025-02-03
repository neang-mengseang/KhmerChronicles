// Import necessary libraries
const fs = require('fs');
const path = require('path');
const contentful = require("contentful-management");
const axios = require('axios');

// Main handler function for creating a user
exports.handler = async function (event, context) {
  console.log("==> { Create Function } Handler started");

  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_CMA_TOKEN, // Your Contentful Management API key
  });

  try {
    // Parse the incoming event body
    console.log("==> Parsing event body...");
    const { id, username, email, userImage, bio, role } = JSON.parse(event.body);

    console.log("==> Event data parsed: ", { id, username, email, userImage, bio, role });

    // Connect to the Contentful space
    console.log("==> Connecting to Contentful space...");
    const space = await client.getSpace(process.env.SPACE_ID); // Your Contentful Space ID
    const environment = await space.getEnvironment("master"); // Or the desired environment
    console.log("==> Connected to Contentful space and environment");
    // Create a new user entry in Contentful
    console.log("==> Creating user entry in Contentful...");
    const userEntry = await environment.createEntry("user", {
      fields: {
        username: { "en-US": username || "Guest" },
        email: { "en-US": email },
        id: { "en-US": id },
        userImage: { 
                        "en-US": { 
                            "sys": { 
                                "type": "Link", 
                                "linkType": "Asset", 
                                "id": "1gmJBSmn7yFJtNN9datKGQ"
                            } 
                        } 
                    },     
        bio: { "en-US": bio || "" },
        role: { "en-US": "content_creator" }, // Default role
      },
    });

    console.log("==> User entry created successfully: ", userEntry.fields);
    await userEntry.publish();

    console.log("==> User entry published successfully!");
    // Return a successful response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User created successfully",
        user: userEntry.fields,
      }),
    };
  } catch (error) {
    console.error("Error creating user:", error);

    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to create user",
        error: error.message,
        stack: error.stack,
      }),
    };
  }
};
