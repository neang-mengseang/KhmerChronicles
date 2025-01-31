const contentful = require('contentful-management');

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});
console.log('Connected to Contentful: ');
console.log(`Token: ${accessToken}`)
async function createOrUpdateUserProfile(userId, username, profilePictureUrl) {
  try {
    const space = await client.getSpace(process.env.SPACE_ID); // Replace with your space ID
    const environment = await space.getEnvironment('master'); // Use the appropriate environment

    // Check if the user exists
    let userEntry;
    try {
      userEntry = await environment.getEntry(userId); // Fetch the existing user by userId
    } catch (error) {
      if (error.name === 'NotFound') {
        // If not found, create a new user
        userEntry = await environment.createEntry('user', {
          fields: {
            id: { 'en-US': userId },
            username: { 'en-US': username },
            userImage: { 'en-US': { sys: { type: 'Link', linkType: 'Asset', id: 'assetId' } } }, // Replace with actual asset ID
            posted: { 'en-US': [] }, // Initialize with an empty array or link to content
          },
        });
      } else {
        throw error;
      }
    }

    // Update the user's profile image if available
    if (profilePictureUrl) {
      const assetId = await uploadProfileImage(profilePictureUrl); // Upload the image and get the assetId
      userEntry.fields.userImage['en-US'] = { sys: { type: 'Link', linkType: 'Asset', id: assetId } };
    }

    await userEntry.update();
    console.log('User profile updated:', userEntry);
  } catch (error) {
    console.error('Error creating or updating user:', error);
  }
}

// Example usage: call this function with user info
createOrUpdateUserProfile(user.id, user.username, 'https://example.com/profile-picture.jpg');
