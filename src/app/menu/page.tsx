import type { Metadata } from "next";
import { MenuExplorer } from "@/components/menu-explorer";
import { PageHero } from "@/components/page-hero";
import { PublicShell } from "@/components/public-shell";
import {
  getCategories,
  getPageMeta,
  getPageSections,
  getProducts,
} from "@/data/repository";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { sectionSetting } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPageMeta("menu");
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: "/menu" },
  };
}

export default async function MenuPage() {
  const [products, categories, sections] = await Promise.all([
    getProducts(),
    getCategories(),
    getPageSections("menu"),
  ]);
  const hero = sections.find((section) => section.section_key === "hero");
  const controls = sections.find(
    (section) => section.section_key === "catalog_controls",
  );
  const showHero = hasSupabaseConfig() ? Boolean(hero) : true;
  return (
    <PublicShell>
      {showHero && (
        <PageHero
          section={hero}
          fallbackEyebrow="Meals • Merienda • Take-home treats"
          fallbackHeading="Find your next favorite."
          fallbackBody="Browse the full Hugo’s Stop Over selection. Prices are shown when confirmed—message us for current availability and details."
          fallbackImageAlt="La Paz Batchoy, buko pie, halo-halo, and Filipino kakanin from Hugo’s Stop Over"
        />
      )}
      <section className="py-10 sm:py-16">
        <div className="container-shell">
          <MenuExplorer
            products={products}
            categories={categories}
            copy={
              controls
                ? {
                    searchPlaceholder: sectionSetting(
                      controls,
                      "search_placeholder",
                    ),
                    allLabel: sectionSetting(controls, "all_label"),
                    bestLabel: sectionSetting(controls, "best_label"),
                    featuredLabel: sectionSetting(controls, "featured_label"),
                    availableLabel: sectionSetting(controls, "available_label"),
                    categoryLabel: sectionSetting(controls, "category_label"),
                    resultsLabel: sectionSetting(controls, "results_label"),
                    clearLabel: sectionSetting(controls, "clear_label"),
                    emptyHeading: sectionSetting(controls, "empty_heading"),
                    emptyBody: sectionSetting(controls, "empty_body"),
                    showAllLabel: sectionSetting(controls, "show_all_label"),
                  }
                : undefined
            }
          />
        </div>
      </section>
    </PublicShell>
  );
}
