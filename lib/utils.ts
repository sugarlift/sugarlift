import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(name: string): string {
  const characterMap: { [key: string]: string } = {
    // Norwegian/Danish
    ø: "o",
    Ø: "o",
    æ: "ae",
    Æ: "ae",
    å: "a",
    Å: "a",
    // Spanish
    ñ: "n",
    Ñ: "n",
    // German
    ü: "u",
    Ü: "u",
    ö: "o",
    Ö: "o",
    ä: "a",
    Ä: "a",
    ß: "ss",
  };

  // First replace known special characters
  const replaced = name
    .split("")
    .map((char) => characterMap[char] || char)
    .join("");

  // Then normalize and remove any remaining diacritics
  return replaced
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-") // Replace any non-alphanumeric characters with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading and trailing hyphens
}
