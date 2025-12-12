const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, "videos.json");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---- Small DB helpers ----
function readVideos() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeVideos(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

// Extract YouTube ID from any youtu.be / youtube.com link
function extractYoutubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    // fallback – last path part
    return u.pathname.split("/").pop();
  } catch (e) {
    return url; // already ID
  }
}

// ---- API ----

// All videos
app.get("/api/videos", (req, res) => {
  const vids = readVideos();
  res.json(vids);
});

// Add new video
app.post("/api/videos", (req, res) => {
  const { title, url, type, thumb } = req.body || {};

  if (!title || !url) {
    return res.status(400).json({ ok: false, msg: "title and url required" });
  }

  const id = extractYoutubeId(url);
  const list = readVideos();

  const video = {
    id,
    title,
    url,
    type: type || "Song",
    thumb: thumb || "",
    createdAt: Date.now(),
  };

  list.push(video);
  writeVideos(list);

  res.json({ ok: true, video });
});

// root → baluflix.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "baluflix.html"));
});

// start
app.listen(PORT, () => {
  console.log("BaluFlix server running at http://localhost:" + PORT);
});