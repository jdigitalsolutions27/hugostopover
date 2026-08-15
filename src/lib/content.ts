import type { PageSection } from "@/types/domain";

export function sectionByKey(
  sections: PageSection[],
  key: string,
): PageSection | undefined {
  return sections.find((section) => section.section_key === key);
}

export function sectionSetting(
  section: PageSection | undefined,
  key: string,
  fallback = "",
) {
  const value = section?.settings?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function sectionImageAlt(
  section: PageSection | undefined,
  fallback: string,
) {
  return sectionSetting(section, "image_alt", fallback);
}

export function humanizeSectionKey(key: string) {
  return key
    .replace(/^nav_/, "Navigation: ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
