import type { MetadataRoute } from "next";
import { getProducts } from "@/data/repository";
import { absoluteUrl } from "@/lib/utils";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const pages = ["", "/menu", "/about", "/visit"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : 0.8,
  }));
  return [
    ...pages,
    ...products.map((product) => ({
      url: absoluteUrl(`/menu/${product.slug}`),
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
