import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.static("public"));

app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing url");

  try {
    const r = await fetch(target);
    const type = r.headers.get("content-type");
    res.set("Content-Type", type || "text/html");
    res.send(await r.text());
  } catch (e) {
    res.status(500).send("Proxy Error: " + e.message);
  }
});

app.listen(3000, () => console.log("🌐 http://localhost:3000 起動完了！"));
