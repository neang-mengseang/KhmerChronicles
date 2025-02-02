const contentful = require('contentful'); // Use Contentful Delivery API

exports.handler = async function(event, context) {
  const spaceId = process.env.SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

  //console.log("==> Initializing Contentful client...");
  if (!spaceId || !accessToken) {
    console.error('Missing Contentful space ID or access token');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing Contentful space ID or access token' }),
    };
  }

  const client = contentful.createClient({
    space: spaceId, // Ensure space ID is provided here
    accessToken: accessToken // Ensure access token is provided here
  });

  const userId = event.queryStringParameters.id; // Retrieve user ID from the query parameters
  // console.log("Received user ID:", userId); // Debug log for the received userId

  try {
    // Fetch entries from Contentful where the userId matches the query parameter
    const entries = await client.getEntries({
      content_type: 'user', // Specify the content type ('user')
      'fields.id': userId, // Searching by the custom userId field in the 'user' content type
    });

    // Check if any entries were found
    if (entries.items.length > 0) {
      const user = entries.items[0]; // Assuming the first item matches the userId
      console.log(`==> User Found: ${user.fields.username}`);
      console.log(`==> User ID: ${user.fields.id}`);
     // Update the profile picture field access
     const profileImageUrl = user.fields.userImage?.fields?.file?.url;
     //console.log(`==> Profile Picture Detected: ${profileImageUrl}`);
    //console.log(user.fields);
      return {
        statusCode: 200,
        body: JSON.stringify({
          exists: true,
          user: {
            id: user.fields.id,
            role: user.fields.role,
            username: user.fields.username,
            profile_picture: profileImageUrl, 
            email: user.fields.email,
            bio: user.fields.bio,
            entry_id: user.sys.id
          },
        }),
      };
    } else {
      console.log("==> No user found for ID:", userId);
      return {
        statusCode: 404,
        body: JSON.stringify({ exists: false }),
      };
    }
  } catch (error) {
    // If there's an error fetching user data, log and return an error response
    console.error("Error fetching user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch user data" }),
    };
  }
};
