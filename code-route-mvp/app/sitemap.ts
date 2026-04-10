import { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL ?? "https://coderoute.fr";
  return [
    { url: base, priority: 1.0, changeFrequency: "weekly" as const, lastModified: new Date() },
    { url: `${base}/pricing`, priority: 0.9, changeFrequency: "monthly" as const, lastModified: new Date() },
    { url: `${base}/auth/register`, priority: 0.8, changeFrequency: "monthly" as const, lastModified: new Date() },
    { url: `${base}/seo/priorite-a-droite`, priority: 0.7, changeFrequency: "monthly" as const, lastModified: new Date() },
    { url: `${base}/seo/panneaux`, priority: 0.7, changeFrequency: "monthly" as const, lastModified: new Date() },
    { url: `${base}/seo/feux-circulation`, priority: 0.7, changeFrequency: "monthly" as const, lastModified: new Date() },
    { url: `${base}/seo/distance-securite`, priority: 0.7, changeFrequency: "monthly" as const, lastModified: new Date() },
    { url: `${base}/seo/questions-pieges`, priority: 0.8, changeFrequency: "monthly" as const, lastModified: new Date() },
    { url: `${base}/seo/erreurs-frequentes`, priority: 0.8, changeFrequency: "monthly" as const, lastModified: new Date() },
  ];
}