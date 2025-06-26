---

# **Khmer Chronicles** 🌏🇰🇭

A dynamic content-driven web platform for curated news, food culture, and travel insights — built to showcase Khmer identity in a global context.

[🌐 **Live Demo**](https://khmerchronicles.netlify.app)

---

## 🧠 About

**Khmer Chronicles** combines a sleek frontend with a real-time content management system (CMS) and admin dashboard. It features a fully functional CRUD interface for managing food and travel articles, integrates news APIs for live updates, and is optimized for performance, engagement, and future scalability.

---

## 🌟 Key Features

### 📰 Global News Section

* Live global news via **NewsAPI**
* Search and filter by country (Cambodia, US, China, etc.)
* Dynamic headline rendering with source and image previews

---

### 🍜 Food Explorer

* **Top Dishes**: Khmer and international food rankings
* **In-depth Food Articles**: Traditions, flavors, and reviews
* **Gallery Mode**: Responsive image-based layout
* **Modal View**: Expand images with detailed info

---

### 🌍 Travel Hub

* Curated destination highlights
* Khmer & global travel blogs and guides
* Visual gallery with article linking

---

### 🛠 Admin Dashboard (Fully Functional)

> 🔐 Secured by **Netlify Identity** + CMS Auth
> 🧠 Managed via **Contentful** (Headless CMS)

* ✔ Add new food & travel articles
* ✔ Edit article content, images, and metadata
* ✔ Delete articles (unpublish + remove from Contentful)
* ✔ Upload images, preview, and render immediately

---

### 📝 Dynamic Article Pages

* Slug-based URLs (`/food-article/:slug`, `/travel-article/:slug`)
* Rich text rendering via **Contentful Rich Text API**
* Metadata display: author, publication date, images
  
---

## 🔧 Tech Stack

| Layer        | Technology                             |
| ------------ | -------------------------------------- |
| **Frontend** | HTML, CSS, Vanilla JavaScript, Node JS |
| **CMS**      | Contentful                             |
| **Backend**  | Netlify Serverless Functions           |
| **Auth**     | Netlify Identity                       |
| **Hosting**  | Netlify                                |
| **APIs**     | NewsAPI (for live news)                |

---

## 🚀 Roadmap

### ✅ Completed Features

- ✍️ **CRUD Operations for Articles**  
  - Add, edit, delete, and unpublish articles via dashboard  
  - Integrated with Contentful for real-time content updates

- 🔐 **User Authentication**  
  - Secure login/logout with Netlify Identity  
  - Access control for content creators only

- 🧑‍💼 **User Profiles**  
  - Personalized dashboard and saved articles

- 📰 **Live Global News Feed**  
  - NewsAPI integration with country filter and search support

- 🖼️ **Dynamic Article Pages**  
  - Slug-based routing, rich-text support, author metadata, images

---

### 🔄 Planned Upcoming Features

- ⚛️ **React Migration**  
  - Rebuild frontend using React for better scalability and maintainability

- 💬 **Comment & Discussion System**  
  - Engage readers with article-based discussions

- 🌙 **Dark Mode Support**  
  - Improve UI/UX for low-light environments

- 🛍️ **E-commerce Section**  
  - Marketplace for Khmer souvenirs and cultural products

- 📧 **Newsletter System**  
  - Email sign-up and daily/weekly digests using Supabase + Serverless

---

### 🔌 Upcoming API Integrations

- 🌦️ **Weather Widget** *(OpenWeatherMap)*  
  - Real-time weather for Phnom Penh, Siem Reap, and more  
  - Useful for travel planning context

- 🗺️ **Interactive Maps** *(Google Maps API)*  
  - Embed maps in travel and food articles  
  - Show locations of landmarks or restaurants

- 🌍 **Geo-location Detection** *(GeoNames/IP-API)*  
  - Suggest location-based articles dynamically

- 🎥 **YouTube Integration** *(YouTube Data API)*  
  - Display latest videos from Khmer music or travel channels

- 🔔 **Push Notifications** *(Firebase or OneSignal)*  
  - Notify users about content updates and site news

- 💱 **Currency Exchange Rates** *(Fixer / exchangerate.host)*  
  - Show KHR ↔ USD rates in travel articles

- 🌐 **Language Toggle** *(LibreTranslate or Google Translate API)*  
  - Allow users to switch between Khmer and English content

- 🖼️ **Stock Image Fallback** *(Unsplash API)*  
  - Automatically add relevant visuals if article lacks image

- 💬 **Disqus or Custom Commenting System**  
  - Embedded comment threads per article

---

## 🤝 Contribute

This project is actively maintained. Contributions are welcome:

* 🔧 Fork this repo & submit Pull Requests
* 🐛 Report issues
* 💡 Suggest improvements or new features
* 📧 Email: **[mengseanggamming@gmail.com](mailto:mengseanggamming@gmail.com)**


