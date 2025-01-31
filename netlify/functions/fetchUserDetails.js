// fetchUserDetails.js

let spaceId = process.env.SPACE_ID; // Replace with your Contentful space ID
let environmentId = 'master'; // Replace with your Contentful environment (e.g., 'master')
let accessToken = process.env.CONTENTFUL_ACCESS_TOKEN; // Replace with your Contentful access token

// console.log(`Space ID: ${spaceID}`);
// console.log(`Access Token: ${accessToken}`);

// Fetch user profile from Contentful
async function fetchUserProfile(userId) {
  try {
    const client = contentful.createClient({
      accessToken: accessToken
    });

    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    const userEntry = await environment.getEntry(userId);
    const profileImageUrl = userEntry.fields.userImage['en-US'].fields.file.url;

    // Update the profile picture in the DOM
    document.getElementById('profile-picture').src = profileImageUrl;
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
}

// Upload a new profile picture to Contentful
async function uploadProfileImage(file) {
  try {
    const client = contentful.createClient({
      accessToken: accessToken
    });

    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    const asset = await environment.createAssetFromFiles({
      fields: {
        title: {
          'en-US': 'Profile Image'
        },
        file: {
          'en-US': {
            fileName: file.name,
            contentType: file.type,
            file: file
          }
        }
      }
    });

    // Publish the asset (make it available for use)
    const processedAsset = await asset.processForAllLocales();
    await processedAsset.publish();

    // Update the user profile with the new image
    const userEntry = await environment.getEntry(localStorage.getItem('userId'));
    userEntry.fields.userImage['en-US'] = { sys: { type: 'Link', linkType: 'Asset', id: processedAsset.sys.id } };
    await userEntry.update();
    await userEntry.publish();

    alert('Profile picture saved successfully!');
    fetchUserProfile(localStorage.getItem('userId')); // Reload profile picture
  } catch (error) {
    console.error('Error uploading profile image:', error);
  }
}
