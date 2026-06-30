export function resolvePublicAsset(path: string, basePath = import.meta.env.BASE_URL) {
  if (!path || path.startsWith("https://") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return `${normalizedBase || "/"}${normalizedPath}`;
}
