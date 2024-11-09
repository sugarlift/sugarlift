// content/exhibitions/images/index.ts

import { readdirSync } from "fs";
import path from "path";

// Get the base directory
const baseDirectory = path.join(process.cwd(), "content/exhibitions/images");

// Get all exhibition folders
const exhibitionFolders = readdirSync(baseDirectory, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

// Create the exhibitionImages object dynamically for all exhibition folders
export const exhibitionImages = Object.fromEntries(
  exhibitionFolders.flatMap((folderName) => {
    const folderPath = path.join(baseDirectory, folderName);
    const imageFilenames = readdirSync(folderPath).filter((file) =>
      file.endsWith(".jpg"),
    );

    return imageFilenames.map((filename) => [
      `images/${folderName}/${filename}`,
      require(`./${folderName}/${filename}`).default,
    ]);
  }),
);
