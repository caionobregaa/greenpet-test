import type { MetadataRoute } from "next";
import { LOJA } from "@/lib/loja";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/imagens/" },
    sitemap: `${LOJA.url}/sitemap.xml`,
  };
}
