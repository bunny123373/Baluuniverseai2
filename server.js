// server.js - simple Express static server + optional API hooks
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// optional: connect to MongoDB if you later add DB code (use MONGO_URI env var)
// const { MongoClient } = require('mongodb');
// const client = new MongoClient(process.env.MONGO_URI || '', {});

// serve static files from repo root (index.html etc.)
app.use(express.static(path.join(__dirname, "/")));

// fallback to index.html for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
let db;

async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db("baluflix");
  console.log("MongoDB connected");
}
connectDB();

app.get("/", (req, res) => {
  res.send("Baluflix Backend Running");
});

app.post("/upload", async (req, res) => {
  try {
    const data = req.body;
    await db.collection("videos").insertOne(data);

    res.send({ message: "Uploaded Successfully", data });
  } catch (err) {
    res.status(500).send(err);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port " + port));
