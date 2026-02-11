import express from "express";
import cors from "cors";
import { createReadStream } from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3001;
const ROBLOX_API = "https://apis.roblox.com";
const THUMBNAILS_API = "https://thumbnails.roblox.com";
const GAMES_API = "https://games.roblox.com";

app.use(cors());

// Proxy /api/thumbnails/* to thumbnails.roblox.com
app.all("/api/thumbnails/*", async (req, res) => {
  const thumbPath = req.originalUrl.replace(/^\/api\/thumbnails/, "");
  const targetUrl = `${THUMBNAILS_API}${thumbPath}`;

  try {
    const response = await fetch(targetUrl, { method: "GET" });
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        res.setHeader(key, value);
      }
    });
    const responseBody = await response.arrayBuffer();
    res.send(Buffer.from(responseBody));
  } catch (err) {
    console.error("Thumbnails proxy error:", err);
    res.status(502).json({ error: "Failed to proxy request to Roblox Thumbnails API" });
  }
});

// Proxy /api/games/* to games.roblox.com (public API, no auth needed)
app.all("/api/games/*", async (req, res) => {
  const gamesPath = req.originalUrl.replace(/^\/api\/games/, "");
  const targetUrl = `${GAMES_API}${gamesPath}`;

  try {
    const response = await fetch(targetUrl, { method: "GET" });
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        res.setHeader(key, value);
      }
    });
    const responseBody = await response.arrayBuffer();
    res.send(Buffer.from(responseBody));
  } catch (err) {
    console.error("Games proxy error:", err);
    res.status(502).json({ error: "Failed to proxy request to Roblox Games API" });
  }
});

// Proxy all /api/roblox/* requests to the Roblox Open Cloud API.
// We stream the request body directly so multipart/form-data passes through.
app.all("/api/roblox/*", async (req, res) => {
  const robloxPath = req.originalUrl.replace(/^\/api\/roblox/, "");
  const targetUrl = `${ROBLOX_API}${robloxPath}`;

  // Collect raw body
  const chunks: Buffer[] = [];
  req.on("data", (chunk: Buffer) => chunks.push(chunk));
  req.on("end", async () => {
    const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

    const headers: Record<string, string> = {};
    if (req.headers["x-api-key"]) {
      headers["x-api-key"] = req.headers["x-api-key"] as string;
    }
    if (req.headers["content-type"]) {
      headers["content-type"] = req.headers["content-type"] as string;
    }

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? body : undefined,
      });

      res.status(response.status);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "transfer-encoding") {
          res.setHeader(key, value);
        }
      });

      const responseBody = await response.arrayBuffer();
      res.send(Buffer.from(responseBody));
    } catch (err) {
      console.error("Proxy error:", err);
      res.status(502).json({ error: "Failed to proxy request to Roblox API" });
    }
  });
});

// In production, serve the built frontend
const distPath = path.resolve(import.meta.dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
