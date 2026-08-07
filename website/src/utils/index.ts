import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

export function getAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const base = import.meta.env.BASE_URL || "/";
  const cleanPath = path.startsWith("/") || path.startsWith("./")
    ? path.replace(/^(\.\/|\/)/, "")
    : path;
  return base.endsWith("/") ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
}

