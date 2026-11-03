import type { MetadataRoute } from "next";
import { LOJA } from "@/lib/loja";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: LOJA.url }, { url: `${LOJA.url}/catalogo` }, { url: `${LOJA.url}/a-marca` }];
}
