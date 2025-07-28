const fetch = require("node-fetch");
const ejs = require("ejs");
const path = require("path");
const { documentToHtmlString } = require("@contentful/rich-text-html-renderer");
const { BLOCKS, INLINES, MARKS } = require("@contentful/rich-text-types");

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}


exports.handler = async (event) => {
  const { marked } = await import("marked");
  const spaceId = process.env.SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const urlBase = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries`;


  let type = event.queryStringParameters?.type;
  let slug = event.queryStringParameters?.slug;

  if (!type || !slug) {
    const pathParts = event.path.split("/").filter(Boolean); // removes empty segments
    const lastSegment = pathParts[pathParts.length - 1];

    // Try to guess type based on path or default
    if (pathParts[0]?.includes("food")) type = "foodArticle";
    else if (pathParts[0]?.includes("top-pick")) type = "travelArticles";
    else type = "travelArticles"; // fallback default

    slug = lastSegment || "unknown";
  }


  try {
    let contentType = "topPick";
    let slug = event.queryStringParameters?.slug;

    if (!type || !slug) {
      const pathParts = event.path.split("/").filter(Boolean); 
      const lastSegment = pathParts[pathParts.length - 1];

      if (pathParts[0]?.includes("top-pick")) contentType = "topPick";
      else contentType = "travelArticles"; 

      slug = lastSegment || "unknown";
    }

    if (!slug) {
      return {
        statusCode: 400,
        body: `Missing slug parameter in query string`,
      };
    }

    const url = `${urlBase}?content_type=${contentType}&fields.ranking=${slug}&include=3`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content for slug: ${slug}`);
    }

    const data = await response.json();

    if (data.items.length === 0) {
      return {
        statusCode: 404,
        body: "Entry not found",
      };
    }

    const assetMap = {};
    (data.includes?.Asset || []).forEach((asset) => {
      assetMap[asset.sys.id] = `https:${asset.fields.file.url}`;
    });

    const entryMap = {};
    (data.includes?.Entry || []).forEach((entry) => {
      entryMap[entry.sys.id] = entry;
    });

    const item = data.items[0];
    const fields = { ...item.fields };

    if (fields.image?.sys?.id) {
      fields.image = assetMap[fields.image.sys.id] || null;
    }

    if (typeof fields.description === "string") {
      let html = marked(fields.description);
      html = html.replace(/(<img\s+[^>]*src=["'])(\/\/[^"']+)/gi, (_, prefix, url) => prefix + "https:" + url);
      fields.descriptionHtml = html;
    } else if (fields.description?.nodeType === "document") {
      try {
        fields.descriptionHtml = documentToHtmlString(fields.description, {
          renderMark: {
            [MARKS.BOLD]: (text) => `<strong>${text}</strong>`,
            [MARKS.ITALIC]: (text) => `<em>${text}</em>`,
            [MARKS.UNDERLINE]: (text) => `<u>${text}</u>`,
            [MARKS.CODE]: (text) => `<code>${text}</code>`,
          },
          renderNode: {
            [BLOCKS.PARAGRAPH]: (node, next) => `<p>${next(node.content)}</p>`,
            [BLOCKS.HEADING_1]: (node, next) => `<h1>${next(node.content)}</h1>`,
            [BLOCKS.HEADING_2]: (node, next) => `<h2>${next(node.content)}</h2>`,
            [BLOCKS.HEADING_3]: (node, next) => `<h3>${next(node.content)}</h3>`,
            [BLOCKS.UL_LIST]: (node, next) => `<ul>${next(node.content)}</ul>`,
            [BLOCKS.OL_LIST]: (node, next) => `<ol>${next(node.content)}</ol>`,
            [BLOCKS.LIST_ITEM]: (node, next) => `<li>${next(node.content)}</li>`,
            [BLOCKS.QUOTE]: (node, next) => `<blockquote>${next(node.content)}</blockquote>`,
            [BLOCKS.EMBEDDED_ASSET]: (node) => {
              const assetId = node.data.target.sys.id;
              const imageUrl = assetMap[assetId];
              const alt = node.data.target.fields?.title || "Embedded Image";
              return imageUrl
                ? `<img src="${imageUrl}" alt="${alt}" style="max-width:100%;border-radius:10px;margin:1em 0;" />`
                : `<p>⚠️ Image not found</p>`;
            },
            [BLOCKS.EMBEDDED_ENTRY]: (node) => {
              const entryId = node.data.target.sys.id;
              const entry = entryMap[entryId];
              if (!entry) return "<p>⚠️ Entry not found</p>";
              return `<div class="embedded-entry"><pre>${JSON.stringify(entry.fields, null, 2)}</pre></div>`;
            },
            [INLINES.HYPERLINK]: (node, next) => {
              const url = node.data.uri;
              return `<a href="${url}" target="_blank" rel="noopener noreferrer">${next(node.content)}</a>`;
            },
            [INLINES.ENTRY_HYPERLINK]: (node, next) => {
              const entryId = node.data.target.sys.id;
              const entry = entryMap[entryId];
              const title = entry?.fields?.title || "Linked Entry";
              return `<a href="#" class="linked-entry">${title}</a>`;
            },
          },
        });
      } catch {
        fields.descriptionHtml = "<p>Unable to render content</p>";
      }
    } else {
      fields.descriptionHtml = "<p>No description available</p>";
    }

    const protocol = event.headers["x-forwarded-proto"] || "https"; // usually "https"
    const host = event.headers.host;
    const path = event.rawUrl || event.path || "";
    const currentUrl = `${protocol}://${host}${event.rawUrl ? "" : event.path}`;


    // Render the ejs template with the data
    const templatePath = `${__dirname}/../../src/views/ranking.ejs`;

    const html = await ejs.renderFile(templatePath, { fields, stripHtml, currentUrl });

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html,
    };
  } catch (error) {
    console.error("Serverless function error:", error);
    return {
      statusCode: 500,
      body: `Error: ${error.message}`,
    };
  }
};
