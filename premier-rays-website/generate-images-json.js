import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('./public/images'); // ✅ corrected path
const outputFile = path.resolve('./public/images.json');

function getImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const images = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      images.push(...getImages(fullPath));
    } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(entry.name)) {
      images.push({
        url: fullPath.replace(publicDir, '/images').replace(/\\/g, '/'),
        category: path.basename(path.dirname(fullPath))
      });
    }
  }

  return images;
}

const data = getImages(publicDir);
fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
console.log(`✅ images.json generated with ${data.length} images`);
