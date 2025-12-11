const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// STATIC FILES SERVE చేయడానికి
app.use(express.static(path.join(__dirname, "/")));

// అన్ని రిక్వెస్ట్స్‌కు index.html పంపడానికి
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port:", PORT);
});
