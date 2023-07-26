const express = require("express");
const cors = require("cors");
const { YoutubeTranscript } = require("youtube-transcript");
const path = require("path");

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Route to get transcript
app.get("/transcript/:videoId", async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    res.json(transcript);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
