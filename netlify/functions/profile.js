const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const contentful = require('contentful');

console.log("==> Function { profile.js } triggered!")

// Initialize Contentful client
const client = contentful.createClient({
    space: process.env.SPACE_ID, // Make sure these environment variables are set
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

// Fetch user data from Contentful
const getUserData = async (username) => {
  try {
    const response = await client.getEntries({
      content_type: 'user',
      'fields.username': username,
      limit: 1,
    });

    if (response.items.length === 0) {
      console.log(`No user found with username: ${username}`);
      return null;
    }

    const user = response.items[0].fields;
    const profileImgUrl = user.userImage?.fields?.file?.url ? `https:${user.userImage.fields.file.url}` : '';

    return {
      id: response.items[0].sys.id, // Contentful stores ID in sys.id
      username: user.username || 'Unknown',
      role: user.role || 'guest',
      email: user.email || 'No email provided',
      bio: user.bio || 'No bio available.',
      profileImgUrl: profileImgUrl,
    };
  } catch (error) {
    console.error('Error fetching user from Contentful:', error);
    return null;
  }
};


exports.handler = async (event, context) => {
  const username = event.queryStringParameters?.username;
  
  console.log(`Finding user : { ${username} }`);
  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Username is required' }),
    };
  }

  // Fetch user data from Contentful
  const userData = await getUserData(username);
  console.log(userData);
  if (!userData) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'User not found' }),
    };
  }

  // Path to the EJS template
    const filePath = path.resolve(__dirname, '..', '..', 'src', 'views', 'profile-template.ejs');
  
  // Render the EJS template with user data
  const template = fs.readFileSync(filePath, 'utf-8');
  const html = ejs.render(template, {
    username: userData.username,
    role: userData.role,  // Add role
    id: userData.id,      // Add id
    email: userData.email,
    bio: userData.bio,
    profileImgUrl: userData.profileImgUrl,
  });

  return {
    statusCode: 200,
    body: html,
    headers: {
      'Content-Type': 'text/html',
    },
  };
};
