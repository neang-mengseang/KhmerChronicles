const fetch = require("node-fetch");
const { documentToHtmlString } = require("@contentful/rich-text-html-renderer");
const { BLOCKS, INLINES, MARKS } = require("@contentful/rich-text-types");


exports.handler = async (event) => {
  const { marked } = await import("marked");
  const spaceId = process.env.SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries`;

  const { contentType, limit } = event.queryStringParameters || {};
  if (!contentType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing content type" }),
      };
  }

  try {

    const contentTypes = contentType.split(",").map((type) => type.trim());
    const maxItems = parseInt(limit);
    let result = {};
    

    // Helper to convert markdown image URLs starting with // to https:// URLs
    function fixImageUrls(html) {
      return html.replace(
        /(<img\s+[^>]*src=["'])(\/\/[^"']+)/gi,
        (_, prefix, url) => prefix + "https:" + url
      );
    }

    const renderOptions = (assetMap, entryMap) => ({
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

    const fetchPromises = contentTypes.map(async (type) => {
      const response = await fetch(`${url}?content_type=${type}&include=3`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch content for type: ${type}`);
      }

      const data = await response.json();

      const assetMap = {};
      (data.includes?.Asset || []).forEach((asset) => {
        assetMap[asset.sys.id] = `https:${asset.fields.file.url}`;
      });

      const entryMap = {};
      (data.includes?.Entry || []).forEach((entry) => {
        entryMap[entry.sys.id] = entry;
      });

      // Sort items by fields.dateCreate (newest first)
      const sortedItems = data.items.sort((a, b) => {
        const dateA = new Date(a.fields.dateCreate);
        const dateB = new Date(b.fields.dateCreate);
        return dateB - dateA;
      });

      // Limit if maxItems is defined
      const limitedItems = !isNaN(maxItems) ? sortedItems.slice(0, maxItems) : sortedItems;

      // Now process the limited/sorted items
      result[type] = limitedItems.map((item) => {
        const fields = { ...item.fields };

        if (fields.image?.sys?.id) {
          fields.image = assetMap[fields.image.sys.id] || null;
        }

        if (fields.author?.sys?.id) {
          fields.author = entryMap[fields.author.sys.id] || null;
        }

        if (typeof fields.description === "string") {
          let html = fixImageUrls(marked(fields.description));
          fields.descriptionHtml = html;
        } else if (fields.description?.nodeType === "document") {
          try {
            fields.descriptionHtml = documentToHtmlString(
              fields.description,
              renderOptions(assetMap, entryMap)
            );
          } catch {
            fields.descriptionHtml = "<p>Unable to render content</p>";
          }
        } else {
          fields.descriptionHtml = "<p>No description available</p>";
        }

        return {
          sys: item.sys,
          fields,
        };
      });

    });

    await Promise.all(fetchPromises);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, ...result }),
    };
  }  catch (error) {
  console.error("Serverless function error:", error);
  return {
    statusCode: 500,
    body: JSON.stringify({ error: error.message }),
  };
}
};
