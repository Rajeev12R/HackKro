import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://www.hackkro.com/sitemap.xml",
    host: "https://www.hackkro.com/", // important for SEO
  };
}
