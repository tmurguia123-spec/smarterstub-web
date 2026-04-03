export function getSiteUrl() {
  const rawValue =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.APP_BASE_URL ??
    "https://smarterstub.com";

  return rawValue.replace(/\/$/, "");
}
