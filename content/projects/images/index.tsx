// content/projects/images/index.ts

import { readdirSync } from "fs";
import path from "path";

// Get the base directory
const baseDirectory = path.join(process.cwd(), "content/projects/images");

// Get all project folders
const projectFolders = readdirSync(baseDirectory, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

// Create the projectImages object dynamically for all project folders
export const projectImages = Object.fromEntries(
  projectFolders.flatMap((folderName) => {
    const folderPath = path.join(baseDirectory, folderName);
    const imageFilenames = readdirSync(folderPath).filter(
      (file) => file.endsWith(".jpg") || file.endsWith(".jpeg"),
    );

    return imageFilenames.map((filename) => [
      `images/${folderName}/${filename}`,
      require(`./${folderName}/${filename}`).default,
    ]);
  }),
);
