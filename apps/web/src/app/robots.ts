import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      disallow: [
        "/admin",
        "/dashboard",
        "/empresa/vagas",
        "/perfil",
        "/candidaturas",
        "/favoritos",
      ],
      allow: "/",
      userAgent: "*",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
