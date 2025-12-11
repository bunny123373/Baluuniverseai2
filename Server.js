// server.js
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "";

app.get("/api/ping-db", async (req, res) => {
  if (!MONGO_URI) return res.status(400).json({ ok:false, msg:"MONGO_URI not set" });
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    await client.close();
    res.json({ ok:true, msg:"DB connected" });
  } catch (err) {
    res.status(500).json({ ok:false, error: err.message });
  }
});

app.get("/api/videos", async (req, res) => {
  if (!MONGO_URI) return res.status(400).json({ ok:false, msg:"MONGO_URI not set" });
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const coll = client.db(process.env.DB_NAME || "baluflix").collection("videos");
    const docs = await coll.find().sort({ createdAt:-1 }).toArray();
    await client.close();
    res.json({ ok:true, videos: docs });
  } catch (err) {
    res.status(500).json({ ok:false, error: err.message });
  }
});

app.post("/api/videos", async (req, res) => {
  const secret = req.body?.secret || req.headers["x-admin-secret"];
  if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ ok:false, msg:"unauthorized" });
  }
  const { title, url, type, thumb } = req.body || {};
  if (!title || !url) return res.status(400).json({ ok:false, msg:"title & url required" });

  const vid = (function(u){
    try {
      if (!u.includes("http")) return u.trim();
      const parsed = new URL(u);
      if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
      if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
      return parsed.pathname.split("/").filter(Boolean).pop();
    } catch(e){ return u; }
  })(url);

  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const coll = client.db(process.env.DB_NAME || "baluflix").collection("videos");
    const doc = { title, url, id: vid, type: type||"Video", thumb: thumb||`https://img.youtube.com/vi/${vid}/hqdefault.jpg`, createdAt: Date.now() };
    const r = await coll.insertOne(doc);
    await client.close();
    res.json({ ok:true, video: { _id: r.insertedId, ...doc } });
  } catch (err) {
    res.status(500).json({ ok:false, error: err.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, ()=> console.log("Server running on port", PORT));
