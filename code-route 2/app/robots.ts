import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? "https://coderoute.fr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/seo/", "/auth/register", "/auth/login"],
        disallow: ["/dashboard", "/quiz", "/exam", "/admin", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
