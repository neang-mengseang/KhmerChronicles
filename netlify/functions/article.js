const fetch = require("node-fetch");
const { documentToHtmlString } = require("@contentful/rich-text-html-renderer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const { Console } = require("console");
let marked;

const spaceID = process.env.SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

// Slug generator
function generateSlug(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

exports.handler = async function (event) {
  console.log(`==> Function { article.js } triggered!`);
  if (!marked) {
    marked = (await import("marked")).marked;
  }
console.log("==> Function { article.js } triggered!");
    console.log("Query Params:", event.queryStringParameters);
    console.log("Path:", event.path);

    let type = event.queryStringParameters?.type;
    let slug = event.queryStringParameters?.slug;

    if (!type || !slug) {
        const pathParts = event.path.split("/").filter(Boolean); // removes empty segments
        type = pathParts[0] === "food-article" ? "foodArticle" : "travelArticles";
        slug = pathParts.slice(1).join("/");
    }

    console.log("Resolved Type:", type);
    console.log("Resolved Slug:", slug);

    if (!type || !slug) {
    return { statusCode: 400, body: "Missing type or slug" };
    }


  const contentfulURL = `https://cdn.contentful.com/spaces/${spaceID}/entries?access_token=${accessToken}&content_type=${type}&include=3`;

  try {
    const res = await fetch(contentfulURL);
    console.log("Fetching from Contentful URL:", contentfulURL);
    if (!res.ok) throw new Error("Failed to fetch articles");

    const data = await res.json();
    const assetMap = {};
    (data.includes?.Asset || []).forEach((asset) => {
      assetMap[asset.sys.id] = `https:${asset.fields.file.url}`;
    });

    const entryMap = {};
    (data.includes?.Entry || []).forEach((entry) => {
      entryMap[entry.sys.id] = entry;
    });

    const articleEntry = data.items.find(
      (item) => item.fields?.title && generateSlug(item.fields.title) === slug
    );

    if (!articleEntry) {
      const notFoundHtml = ejs.render(
        fs.readFileSync("src/views/404.ejs", "utf-8"),
        { slug }
      );
      return {
        statusCode: 404,
        headers: { "Content-Type": "text/html" },
        body: notFoundHtml,
      };
    }

    // Author
    let author = {
      name: "Unknown",
      image: "/src/assets/img/user.svg",
    };
    const authorEntry = entryMap[articleEntry.fields.author?.sys?.id];
    if (authorEntry) {
      author = {
        name: authorEntry.fields.username || "Unknown",
        image:
          assetMap[authorEntry.fields.userImage?.sys?.id] ||
          "/src/assets/img/user.svg",
      };
    }

    const { BLOCKS, INLINES, MARKS } = require("@contentful/rich-text-types");

    const renderOptions = {
      renderMark: {
        [MARKS.BOLD]: (text) => `<strong>${text}</strong>`,
        [MARKS.ITALIC]: (text) => `<em>${text}</em>`,
        [MARKS.UNDERLINE]: (text) => `<u>${text}</u>`,
        [MARKS.CODE]: (text) => `<code>${text}</code>`,
      },
      renderNode: {
        [BLOCKS.PARAGRAPH]: (node, next) => `<p>${next(node.content)}</p>`,
        [BLOCKS.HEADING_2]: (node, next) => `<h2>${next(node.content)}</h2>`,
        [BLOCKS.HEADING_3]: (node, next) => `<h3>${next(node.content)}</h3>`,
        [BLOCKS.UL_LIST]: (node, next) => `<ul>${next(node.content)}</ul>`,
        [BLOCKS.OL_LIST]: (node, next) => `<ol>${next(node.content)}</ol>`,
        [BLOCKS.LIST_ITEM]: (node, next) => `<li>${next(node.content)}</li>`,
        [BLOCKS.QUOTE]: (node, next) =>
          `<blockquote>${next(node.content)}</blockquote>`,

        [BLOCKS.EMBEDDED_ASSET]: (node) => {
          const assetId = node.data.target.sys.id;
          const url = assetMap[assetId];
          return url
            ? `<img src="${url}" alt="Embedded Image" style="max-width:100%;border-radius:10px;margin:1em 0;" />`
            : `<p>[Missing image]</p>`;
        },

        [BLOCKS.EMBEDDED_ENTRY]: (node) => {
          const entryId = node.data.target.sys.id;
          const entry = entryMap[entryId];
          return entry
            ? `<div class="embedded-entry"><pre>${JSON.stringify(
                entry.fields,
                null,
                2
              )}</pre></div>`
            : `<p>[Missing entry]</p>`;
        },

        [INLINES.HYPERLINK]: (node, next) => {
          const url = node.data.uri;
          return `<a href="${url}" target="_blank" rel="noopener noreferrer">${next(
            node.content
          )}</a>`;
        },

        [INLINES.ENTRY_HYPERLINK]: (node, next) => {
          const entryId = node.data.target.sys.id;
          const entry = entryMap[entryId];
          const title = entry?.fields?.title || "Linked Entry";
          return `<a href="#">${title}</a>`;
        },
      },
    };

    const htmlContent = articleEntry.fields.content
      ? marked(articleEntry.fields.content)
      : "<p>No content available</p>";

    const rawDate = articleEntry.fields.dateCreate || new Date().toISOString();
    const dateObj = new Date(rawDate);

    const articleData = {
      title: articleEntry.fields.title,
      introduction: articleEntry.fields.introduction,
      imageUrl: assetMap[articleEntry.fields.image?.sys?.id] || null,
      author,
      content: htmlContent,
      dateCreate: {
        full: rawDate,
        date: dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: dateObj.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      },
    };

    const html = ejs.render(
      fs.readFileSync("src/views/article-template.ejs", "utf-8"),
      { article: articleData, type }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html,
    };
  } catch (err) {
    console.error("Server Error:", err);
    return {
      statusCode: 500,
      body: "Internal server error",
    };
  }
};
