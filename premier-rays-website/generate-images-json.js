import fs from "fs";
import path from "path";

const publicDir = path.resolve("./public/images/");
const outputFile = path.resolve("./public/images.json");

/**
 * Recursively collects all images inside /images/,
 * skipping any images directly under /images/.
 * Category = last folder name (not full path).
 */
function getImages(dir, isRoot = false) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const images = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subfolders
      images.push(...getImages(fullPath, false));
    } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(entry.name)) {
      // Skip images directly inside /images/
      if (isRoot) continue;

      // Construct image URL relative to /public
      const url = fullPath.replace(publicDir, "/images").replace(/\\/g, "/");

      // Last folder name = category
      const parentFolder = path.basename(path.dirname(fullPath));

      images.push({
        url,
        category: parentFolder,
      });
    }
  }

  return images;
}

// Run script
const data = getImages(publicDir, true);

// Filter out any items where category accidentally became "images"
const filtered = data.filter(item => item.category !== "images");

fs.writeFileSync(outputFile, JSON.stringify(filtered, null, 2));
console.log(`✅ images.json generated with ${filtered.length} images (root images excluded)`);
