function resolveApiOrigin() {
  const configured =
    process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";

  return configured.replace(/\/+$/, "").replace(/\/api\/v1$/, "");
}

export function resolveResourceUrl(url) {
  if (!url || /^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    const origin = resolveApiOrigin();
    return origin ? `${origin}${url}` : url;
  }

  return url;
}
