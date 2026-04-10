import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL ?? "https://coderoute.fr";

  const staticRoutes = [
    { url: base, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${base}/pricing`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${base}/auth/register`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/auth/login`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${base}/seo/priorite-a-droite`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/seo/panneaux`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/seo/feux-circulation`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/seo/distance-securite`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/seo/questions-pieges`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/seo/erreurs-frequentes`, priority: 0.8, changeFrequency: "monthly" as const },
  ];

  return staticRoutes.map((r) => ({
    url: r.url,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
