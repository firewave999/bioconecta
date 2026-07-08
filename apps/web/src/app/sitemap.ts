import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-url";

const publicRoutes = ["/", "/vagas", "/login", "/cadastro", "/empresa"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    changeFrequency: "weekly",
    lastModified,
    priority: route === "/" ? 1 : 0.7,
    url: absoluteUrl(route),
  }));
}
