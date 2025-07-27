const contentful = require('contentful');

exports.handler = async function(event, context) {
  const spaceId = process.env.SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!spaceId || !accessToken) {
    console.error('Missing Contentful space ID or access token');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing Contentful space ID or access token' }),
    };
  }

  const client = contentful.createClient({
    space: spaceId, 
    accessToken: accessToken 
  });

  const userId = event.queryStringParameters.id; 


  try {
    const entries = await client.getEntries({
      content_type: 'user',
      'fields.id': userId,
    });

    if (entries.items.length > 0) {
      const user = entries.items[0];
     const profileImageUrl = user.fields.userImage?.fields?.file?.url;
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
    console.error("Error fetching user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch user data" }),
    };
  }
};
