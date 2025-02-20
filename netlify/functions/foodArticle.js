const fetch = require("node-fetch");
const { documentToHtmlString } = require("@contentful/rich-text-html-renderer");
const ejs = require("ejs");
const fs = require("fs");

const spaceID = process.env.SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

// Function to generate slug
function generateSlug(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading & trailing hyphens
}

exports.handler = async function (event) {

  const { path } = event;
  console.log("Incoming path:", path);

  const slug = path.split("/").pop().split("?")[0]; // Extract slug
  console.log("Extracted slug:", slug);

  const url = `https://cdn.contentful.com/spaces/${spaceID}/entries?access_token=${accessToken}&content_type=foodArticle&include=3`;

  const templatePath = "src/views/article-template.ejs";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch articles. Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Find the article that matches the slug
    const articleEntry = data.items.find((item) => generateSlug(item.fields.title) === slug);

    if (!articleEntry) {
      return { statusCode: 404, body: JSON.stringify({ error: "Article not found" }) };
    }

    console.log("Included Entries:", JSON.stringify(data.includes?.Entry, null, 2));

    // ✅ Fix: Initialize assetMap before using it
    const assetMap = {};
    if (data.includes?.Asset) {
      data.includes.Asset.forEach((asset) => {
        assetMap[asset.sys.id] = `https:${asset.fields.file.url}`;
      });
    }

    // Extract authors from included entries
    let authorData = {
      id: "unknown",
      name: "Unknown Author",
      image: "/src/assets/img/user.svg",
    };

    if (articleEntry.fields.author?.sys?.id) {
      const authorEntry = data.includes?.Entry?.find((entry) => entry.sys.id === articleEntry.fields.author.sys.id);
      if (authorEntry) {
        authorData = {
          id: authorEntry.sys.id,
          name: authorEntry.fields.username || "Unknown Author",
          image: authorEntry.fields.userImage?.sys?.id ? assetMap[authorEntry.fields.userImage.sys.id] : "/src/assets/img/user.svg",
        };
      }
    }

    const contentHtml = documentToHtmlString(articleEntry.fields.content);
    const articleData = {
      title: articleEntry.fields.title,
      author: authorData,
      dateCreate: articleEntry.fields.dateCreate || "Unknown Date",
      introduction: articleEntry.fields.introduction || "No introduction available.",
      content: contentHtml,
      imageUrl: articleEntry.fields.image?.sys?.id ? assetMap[articleEntry.fields.image.sys.id] : null,
    };

    // Read template and render it
    const template = fs.readFileSync(templatePath, "utf-8");
    const renderedHtml = ejs.render(template, { article: articleData });

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: renderedHtml,
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
