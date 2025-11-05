// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.static(__dirname)); // index.htmlを配信

// Proxyエンドポイント
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || !targetUrl.startsWith("http")) {
    return res.status(400).send("Invalid URL");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: { "User-Agent": "AmeWeb Proxy/1.0" },
    });

    // ヘッダをコピー（セキュリティ上危険なやつ除外）
    res.set("Content-Type", response.headers.get("content-type") || "text/html");
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send("Proxy Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌧️ AmeWeb server running at http://localhost:${PORT}`);
});
