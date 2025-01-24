exports.handler = async (event) => {
    const NetlifyAPI = require('netlify');
    const client = new NetlifyAPI(process.env.NETLIFY_ACCESS_TOKEN);
  
    const { email, role } = JSON.parse(event.body);
  
    try {
      const users = await client.listSiteUsers({ site_id: process.env.NETLIFY_SITE_ID });
      const user = users.find((u) => u.email === email);
  
      if (user) {
        await client.updateSiteUser({
          site_id: process.env.NETLIFY_SITE_ID,
          user_id: user.id,
          body: {
            app_metadata: { roles: [role] },
          },
        });
        return { statusCode: 200, body: JSON.stringify({ message: "Role assigned successfully" }) };
      }
      return { statusCode: 404, body: JSON.stringify({ message: "User not found" }) };
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
  };
  