const fetch = require("node-fetch");

exports.handler = async () => {
    const siteUrl = "https://khmerchronicles.netlify.app"; // Change to your domain
    const lastmod = new Date().toISOString().split("T")[0];

    // Static pages
    let pages = [
        "/", "/news", "/food-ranking", "/food-articles", "/cuisines-gallery",
        "/top-pick", "/travel-articles", "/travel-gallery",
        "/about-us", "/contact"
    ];

    try {
        // ✅ Fetch dynamic pages from Contentful
        const response = await fetch(`https://cdn.contentful.com/spaces/${process.env.SPACE_ID}/environments/master/entries?access_token=${process.env.CONTENTFUL_CDA_TOKEN}&content_type=foodArticle`);
        const data = await response.json();

        // ✅ Add food articles dynamically
        if (data.items) {
            data.items.forEach(article => {
                pages.push(`/food-articles/${article.fields.slug}`); // Assuming each article has a slug field
            });
        }
    } catch (error) {
        console.error("❌ Error fetching Contentful data:", error);
    }

    // Generate XML structure
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    pages.forEach((page) => {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${siteUrl}${page}</loc>\n`;
        sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
        sitemap += `    <changefreq>weekly</changefreq>\n`;
        sitemap += `    <priority>0.8</priority>\n`;
        sitemap += `  </url>\n`;
    });

    sitemap += `</urlset>`;

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/xml" },
        body: sitemap,
    };
};
