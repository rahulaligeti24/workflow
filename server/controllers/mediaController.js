const fs = require("fs");
const axios = require("axios");
const { callLLM } = require("../services/aiService");

async function videoToText(req, res) {
  req.setTimeout(15 * 60 * 1000);
  res.setTimeout(15 * 60 * 1000);

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file received" });
    }

    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      return res.status(500).json({ error: "DEEPGRAM_API_KEY not configured in .env" });
    }

    console.log(
      `File received: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(1)} MB, mime: ${req.file.mimetype})`
    );

    const fileStream = fs.createReadStream(req.file.path);

    const response = await axios.post(
      "https://api.deepgram.com/v1/listen?smart_format=true&model=nova-2",
      fileStream,
      {
        headers: {
          Authorization: `Token ${deepgramApiKey}`,
          "Content-Type": "application/octet-stream",
          Connection: "keep-alive",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 15 * 60 * 1000,
      }
    );

    fs.unlink(req.file.path, () => {});

    const result = response.data.results.channels[0].alternatives[0];
    return res.json({ transcript: result.transcript, confidence: result.confidence });
  } catch (error) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    const providerMessage =
      error.response?.data?.err_msg ||
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;

    console.error("Transcription Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return res.status(500).json({
      error: `Transcription failed: ${providerMessage}`,
      providerStatus: error.response?.status || null,
    });
  }
}

async function transcriptToHtml(req, res) {
  const { transcript, title } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: "No transcript provided" });
  }

  try {
    const raw = await callLLM(`Convert the following video transcript into a clean, well-structured HTML page.
Title: "${title || "Video Summary"}"

Rules:
- Return ONLY the raw HTML. No markdown fences, no explanation, no extra text.
- Use semantic tags: <h1>, <h2>, <h3>, <p>, <ul>/<li>, <section>.
- Group related ideas into <section> blocks with an <h2> heading each.
- Keep the content factual and faithful to the transcript.
- Add a short <p class="summary"> after <h1> summarising the content in 1-2 sentences.

Transcript:
${transcript}`);

    const html = raw.replace(/^```html\s*/i, "").replace(/```\s*$/, "").trim();
    return res.json({ html });
  } catch (error) {
    console.error("HTML Gen Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: `HTML generation failed: ${error.response?.data?.error?.message || error.message}`,
    });
  }
}

async function detectOverlaps(req, res) {
  const { transcripts } = req.body;

  if (!transcripts || transcripts.length < 2) {
    return res.status(400).json({ error: "Need at least 2 transcripts" });
  }

  try {
    const promptText = `You are an expert content analyst.
Analyse these ${transcripts.length} video transcripts and find topics that overlap between them.

${transcripts
  .map(
    (transcript, index) =>
      `=== Video ${index + 1}: "${transcript.title || `Video ${index + 1}`}" ===\n${transcript.text.slice(0, 1200)}`
  )
  .join("\n\n")}

Return ONLY valid JSON (no backticks, no explanation) matching this exact schema:
{
  "overlaps": [
    {
      "topic": "Short topic name",
      "description": "One sentence explaining the overlap",
      "sources": [0, 1],
      "excerpts": [
        "Relevant excerpt from Video 1 (2-4 sentences)",
        "Relevant excerpt from Video 2 (2-4 sentences)"
      ]
    }
  ]
}

If no overlaps are found, return { "overlaps": [] }.`;

    const raw = await callLLM(promptText);
    const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(clean);

    return res.json(parsed);
  } catch (error) {
    console.error("Overlap Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Overlap detection failed" });
  }
}

module.exports = {
  videoToText,
  transcriptToHtml,
  detectOverlaps,
};
