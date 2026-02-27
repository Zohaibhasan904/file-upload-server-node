const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { uploadMultipleFiles } = require("./controller/uploads");

const app = express();
const PORT = 9090;
//console.log("🕒 Server started at", new Date().toLocaleTimeString());

app.use(cors());

// Static uploads folder
const uploadDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadDir));

// Serve the HTML upload form
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "index.html");
  fs.existsSync(filePath)
    ? res.sendFile(filePath)
    : res.status(404).send("index.html not found");
});

// Upload route
app.post("/upload", uploadMultipleFiles);

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://YOUR_UBUNTU_IP_ADDRESS:${PORT}`);
});
