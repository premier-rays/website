// server.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Determine where images live (production: dist/images; dev: public/images)
function getImagesBaseDir() {
  const distImages = path.join(__dirname, "dist", "images");
  if (fs.existsSync(distImages)) return distImages;
  return path.join(__dirname, "public", "images");
}

// Helper: read categories/subfolders and their image paths
function scanImages() {
  const base = getImagesBaseDir();
  const data = {};

  if (!fs.existsSync(base)) return data;

  const categories = fs.readdirSync(base).filter(name =>
    fs.statSync(path.join(base, name)).isDirectory()
  );

  categories.forEach(category => {
    const catDir = path.join(base, category);
    const subfolders = fs.readdirSync(catDir).filter(name =>
      fs.statSync(path.join(catDir, name)).isDirectory()
    );

    data[category] = {};

    subfolders.forEach(sub => {
      const subDir = path.join(catDir, sub);
      const files = fs.readdirSync(subDir)
        .filter(fname => /\.(jpe?g|png)$/i.test(fname))
        .map(fname => `/images/${category}/${sub}/${fname}`);

      data[category][sub] = files;
    });
  });

  return data;
}

// Static file serving
const distPath = path.join(__dirname, "dist");
const publicPath = path.join(__dirname, "public");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  app.use(express.static(publicPath));
}

// API endpoint to return JSON mapping of images
app.get("/api/images", (req, res) => {
  try {
    const data = scanImages();
    res.json(data);
  } catch (err) {
    console.error("Error scanning images:", err);
    res.status(500).json({ error: "Failed to read images" });
  }
});

// ✅ FIXED: Express 5-safe catch-all route
app.use((req, res) => {
  if (fs.existsSync(distPath)) {
    res.sendFile(path.join(distPath, "index.html"));
  } else {
    res.status(404).send("Not found");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📸 API endpoint available at http://localhost:${PORT}/api/images`);
});
