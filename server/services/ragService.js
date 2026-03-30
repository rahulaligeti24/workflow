const { DBDocument } = require("../models");
const { callLLM } = require("./aiService");

function normalizeText(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalizeText(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function chunkText(text, maxLength = 900, overlap = 140) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  if (normalized.length <= maxLength) {
    return [normalized];
  }

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + maxLength, normalized.length);

    if (end < normalized.length) {
      const lastBreak = normalized.lastIndexOf(" ", end);
      if (lastBreak > start + Math.floor(maxLength * 0.6)) {
        end = lastBreak;
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

function scoreChunk(query, chunk, type) {
  const queryText = normalizeText(query).toLowerCase();
  const chunkText = normalizeText(chunk).toLowerCase();
  const queryTokens = tokenize(queryText);
  if (!queryTokens.length || !chunkText) return 0;

  let score = 0;
  const uniqueTokens = [...new Set(queryTokens)];

  uniqueTokens.forEach((token) => {
    const exactMatches = chunkText.split(token).length - 1;
    if (exactMatches > 0) {
      score += exactMatches * 3;
    }
  });

  if (chunkText.includes(queryText) && queryText.length > 5) {
    score += 8;
  }

  if (type === "document") score += 1.5;
  if (type === "transcript") score += 1;
  if (type === "html") score += 0.5;

  return score;
}

async function buildCorpus(projectName) {
  const filter = projectName ? { projectName } : {};
  const documents = await DBDocument.find(filter)
    .sort({ createdAt: -1 })
    .select("projectName documentTitle content htmlContent videoTranscript createdAt style")
    .lean();

  const chunks = [];

  documents.forEach((document) => {
    const sources = [
      { type: "document", text: document.content },
      { type: "transcript", text: document.videoTranscript },
      { type: "html", text: document.htmlContent },
    ];

    sources.forEach((source) => {
      chunkText(source.text).forEach((chunk, index) => {
        chunks.push({
          chunk,
          chunkIndex: index,
          type: source.type,
          documentId: String(document._id),
          documentTitle: document.documentTitle,
          projectName: document.projectName,
          createdAt: document.createdAt,
          style: document.style,
        });
      });
    });
  });

  return {
    documents,
    chunks,
  };
}

async function searchCorpus(query, options = {}) {
  const { projectName, topK = 6 } = options;
  const { documents, chunks } = await buildCorpus(projectName);

  const scored = chunks
    .map((entry) => ({
      ...entry,
      score: scoreChunk(query, entry.chunk, entry.type),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return {
    totalDocuments: documents.length,
    totalChunks: chunks.length,
    matches: scored,
  };
}

async function answerQuestion(query, options = {}) {
  const retrieval = await searchCorpus(query, options);

  if (!retrieval.matches.length) {
    return {
      answer: "I could not find enough relevant transcript or document context to answer that yet.",
      sources: [],
      retrieval,
    };
  }

  const context = retrieval.matches
    .map(
      (match, index) =>
        `[Source ${index + 1}] Title: ${match.documentTitle}\nProject: ${match.projectName}\nType: ${match.type}\nExcerpt: ${match.chunk}`
    )
    .join("\n\n");

  const answer = await callLLM(`You are a retrieval-augmented assistant for a documentation workspace.
Answer the user's question ONLY from the provided context.
If the context is incomplete, say what is missing instead of inventing details.
Keep the answer concise but useful.
End with a short "Sources:" line that references the source numbers you used.

Question:
${query}

Context:
${context}`);

  return {
    answer,
    sources: retrieval.matches,
    retrieval,
  };
}

async function getCorpusStats(projectName) {
  const retrieval = await searchCorpus("overview", { projectName, topK: 1 });
  return {
    totalDocuments: retrieval.totalDocuments,
    totalChunks: retrieval.totalChunks,
  };
}

module.exports = {
  answerQuestion,
  getCorpusStats,
  searchCorpus,
};
