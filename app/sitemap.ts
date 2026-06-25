import type { MetadataRoute } from "next";

import { getAllSkills } from "@/lib/data";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const skills = await getAllSkills();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const skillRoutes: MetadataRoute.Sitemap = skills.map((skill) => ({
    url: `${SITE.url}/skill/${skill.slug}`,
    lastModified: skill.lastUpdated ? new Date(skill.lastUpdated) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...skillRoutes];
}
