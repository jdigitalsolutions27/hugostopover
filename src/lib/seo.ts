import { DEFAULT_HERO_IMAGE } from "@/lib/constants";
import { absoluteUrl, safeLinkUrl, safeMediaUrl } from "@/lib/utils";
import type { BusinessSettings } from "@/types/domain";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function dayIndex(value: string) {
  const normalized = value.trim().toLowerCase();
  return WEEKDAYS.findIndex((day) =>
    day.toLowerCase().startsWith(normalized.slice(0, 3)),
  );
}

function expandDays(value: string): string[] {
  const normalized = value.trim();
  if (/^(daily|every day)$/i.test(normalized)) return [...WEEKDAYS];
  const parts = normalized.split(/\s*[–—-]\s*/).filter(Boolean);
  const firstDay = parts[0];
  const lastDay = parts[1];
  if (parts.length === 2 && firstDay && lastDay) {
    const start = dayIndex(firstDay);
    const end = dayIndex(lastDay);
    if (start >= 0 && end >= 0) {
      const days: string[] = [];
      for (let index = start; ; index = (index + 1) % WEEKDAYS.length) {
        const day = WEEKDAYS[index];
        if (!day) break;
        days.push(day);
        if (index === end || days.length === WEEKDAYS.length) break;
      }
      return days;
    }
  }
  const single = dayIndex(normalized);
  const day = single >= 0 ? WEEKDAYS[single] : undefined;
  return day ? [day] : [];
}

function toTwentyFourHour(value: string) {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return null;
  const hourPart = match[1];
  const meridiem = match[3];
  if (!hourPart || !meridiem) return null;
  let hours = Number(hourPart);
  const minutes = Number(match[2] ?? "00");
  if (hours < 1 || hours > 12 || minutes > 59) return null;
  if (meridiem.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (meridiem.toUpperCase() === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function buildOpeningHoursSpecification(
  openingHours: BusinessSettings["opening_hours"],
) {
  return openingHours.flatMap((item) => {
    if (/closed/i.test(item.hours)) return [];
    const times = item.hours.split(/\s*[–—-]\s*/).filter(Boolean);
    const opens = times[0] ? toTwentyFourHour(times[0]) : null;
    const closes = times[1] ? toTwentyFourHour(times[1]) : null;
    const dayOfWeek = expandDays(item.days);
    if (!opens || !closes || !dayOfWeek.length) return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek,
        opens,
        closes,
      },
    ];
  });
}

function absoluteMediaUrl(value: unknown) {
  const mediaUrl = safeMediaUrl(value) || DEFAULT_HERO_IMAGE;
  return mediaUrl.startsWith("/") ? absoluteUrl(mediaUrl) : mediaUrl;
}

export function buildLocalBusinessJsonLd(
  settings: BusinessSettings,
  description: string,
) {
  const siteOrigin = absoluteUrl().replace(/\/$/, "");
  const sameAs = new Set(
    [settings.facebook_url, ...Object.values(settings.social_links)]
      .map((url) => safeLinkUrl(url))
      .filter((url) => url.startsWith("https://")),
  );
  const hasCoordinates =
    settings.latitude !== null && settings.longitude !== null;

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${siteOrigin}/#restaurant`,
    name: settings.business_name,
    description,
    url: siteOrigin,
    image: [absoluteMediaUrl(settings.default_seo_image)],
    logo: absoluteMediaUrl(settings.logo_url),
    telephone: settings.phone,
    priceRange: "₱",
    servesCuisine: ["Filipino", "Leyte specialties", "Pasalubong"],
    menu: absoluteUrl("/menu"),
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Alangalang",
      addressRegion: "Leyte",
      addressCountry: "PH",
    },
    ...(hasCoordinates
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: settings.latitude,
            longitude: settings.longitude,
          },
          hasMap: `https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`,
        }
      : {}),
    areaServed: [
      { "@type": "City", name: "Alangalang" },
      { "@type": "City", name: "Santa Fe" },
      { "@type": "AdministrativeArea", name: "Leyte" },
    ],
    openingHoursSpecification: buildOpeningHoursSpecification(
      settings.opening_hours,
    ),
    sameAs: [...sameAs],
  };
}

export function buildWebsiteJsonLd(settings: BusinessSettings) {
  const siteOrigin = absoluteUrl().replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteOrigin}/#website`,
    url: siteOrigin,
    name: settings.business_name,
    alternateName: "Hugo's Stop Over Leyte",
    inLanguage: "en-PH",
    publisher: { "@id": `${siteOrigin}/#restaurant` },
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
