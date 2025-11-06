import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.static(__dirname));

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || !targetUrl.startsWith("http")) {
    return res.status(400).send("Invalid URL");
  }

  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      res.set("Content-Type", contentType);
      response.body.pipe(res);
      return;
    }

    const text = await response.text();
    const dom = new JSDOM(text);
    const doc = dom.window.document;
    const base = new URL(targetUrl);

    // 相対リンクを全部絶対URLに変換
    const attrs = ["href", "src"];
    attrs.forEach(attr => {
      doc.querySelectorAll(`[${attr}]`).forEach(el => {
        const val = el.getAttribute(attr);
        if (val && !val.startsWith("http") && !val.startsWith("data:") && !val.startsWith("mailto:")) {
          const abs = new URL(val, base).href;
          el.setAttribute(attr, `/proxy?url=${encodeURIComponent(abs)}`);
        }
      });
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(dom.serialize());

  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).send("Proxy Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌧️ AmeWeb beta server running at http://localhost:${PORT}`);
});
