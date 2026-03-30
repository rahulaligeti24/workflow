const { callLLM } = require("../services/aiService");
const { createDocxBuffer, createPdfBase64, createPdfBuffer } = require("../services/exportService");
const { answerQuestion, getCorpusStats } = require("../services/ragService");
const { DBDocument, Note, Project } = require("../models");

async function generateDoc(req, res) {
  const { code, style, title, prompt } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    const userPrompt = prompt || "Create clear, professional documentation";
    const styleGuide = {
      technical: "formal, precise, technical jargon acceptable with definitions",
      readme: "clear, practical, README-style with setup and usage emphasis",
      tutorial: "step-by-step, instructional, beginner-friendly with examples",
      api: "reference-oriented, endpoint and parameter focused, concise but complete",
      review: "analytical, code-review oriented, highlight strengths, issues, and suggestions",
      narrative: "conversational, engaging, story-like flow with examples",
      concise: "brief, direct, to-the-point with minimal elaboration",
      academic: "scholarly, well-researched, with proper citations and depth",
    };

    const result = await callLLM(`Generate high-quality ${style || "technical"} documentation in clean markdown format.

Title: ${title || "HTML Documentation"}
Style: ${styleGuide[style] || "professional"}
User Instructions: ${userPrompt}

HTML/Code to Document:
\`\`\`html
${code}
\`\`\`

CREATE COMPREHENSIVE DOCUMENTATION WITH:
1. **Overview Section** (2-3 sentences explaining the purpose and key features)
2. **Key Concepts** (if applicable) - major components or ideas
3. **Structure/Architecture** - how the code is organized
4. **Main Features** - what functionality it provides
5. **Usage Instructions** - how to use or implement
6. **Best Practices** - important considerations and tips
7. **Examples** - practical code examples or use cases

FORMATTING REQUIREMENTS:
- Use ## for main section headings
- Use - for bullet points with clear indentation
- Bold important terms with **word**
- Include code examples in \`\`\`html\`\`\` blocks
- Make content scannable and well-structured
- Ensure logical flow and progressive complexity

OUTPUT:
Return ONLY the markdown documentation (no markdown fences, no preamble).
Make it professional, thorough, and ${styleGuide[style] || "accessible"}.
Add real value that would help someone understand and use this code.`);

    return res.json({ result });
  } catch (error) {
    console.error("Doc Gen Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: error.response?.data?.error?.message || "Documentation generation failed",
    });
  }
}

async function refineDoc(req, res) {
  const { markdown, refinement, code, style, title } = req.body;

  if (!markdown) {
    return res.status(400).json({ error: "No documentation provided" });
  }

  try {
    const userFeedback = refinement || "Improve overall quality, clarity, and completeness";
    const result = await callLLM(`You are an expert technical writer specializing in ${style} documentation.

CURRENT DOCUMENTATION:
\`\`\`markdown
${markdown}
\`\`\`

USER REFINEMENT REQUEST:
${userFeedback}

CONTEXT (HTML Code being documented):
\`\`\`html
${code || ""}
\`\`\`

DOCUMENT TITLE:
${title || "HTML Documentation"}

REFINEMENT GUIDELINES:
Apply these principles to enhance the documentation:
1. **Clarity**: Use simple, direct language. Avoid jargon or explain it.
2. **Structure**: Organize logically with clear headings. Use progressive disclosure.
3. **Completeness**: Add missing details, edge cases, and examples where helpful.
4. **Accessibility**: Include context for beginners. Add explanatory phrases.
5. **Formatting**: Use code blocks for technical content, bold for key terms.
6. **Tone**: Maintain a ${style === "technical" ? "formal and precise" : style === "readme" ? "practical and direct" : style === "tutorial" ? "step-by-step and helpful" : style === "api" ? "reference-driven and precise" : style === "review" ? "analytical and constructive" : "professional and balanced"} tone.
7. **Examples**: Add practical examples where they clarify concepts.
8. **Engagement**: Make the content valuable and easy to scan.

OUTPUT REQUIREMENTS:
- Return ONLY the refined markdown (no additional text)
- Preserve the original structure but enhance content
- Add sections or expand existing ones as needed
- Keep markdown formatting clean and consistent
- Ensure all headings use ## (H2) for main sections
- Use - for bullet points and proper indentation
- Bold important terms with **word**
- Include code examples in \`\`\`language blocks\`\`\`

Refine the documentation now, incorporating the user's feedback while maintaining professional quality.`);

    return res.json({ result });
  } catch (error) {
    console.error("Refinement Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: error.response?.data?.error?.message || "Refinement failed",
    });
  }
}

async function downloadDocx(req, res) {
  const { markdown, title } = req.body;

  if (!markdown) {
    return res.status(400).json({ error: "No content provided" });
  }

  try {
    const buffer = await createDocxBuffer(markdown);
    const safeName = (title || "documentation").replace(/\s+/g, "_");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.docx"`);
    return res.send(buffer);
  } catch (error) {
    console.error("DOCX Error:", error.message);
    return res.status(500).json({ error: `DOCX generation failed: ${error.message}` });
  }
}

async function downloadPdf(req, res) {
  const { markdown, title } = req.body;

  if (!markdown) {
    return res.status(400).json({ error: "No content provided" });
  }

  try {
    const pdfBuffer = await createPdfBuffer(markdown, title);
    const safeName = (title || "documentation").replace(/\s+/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF Error:", error.message);
    return res.status(500).json({ error: `PDF generation failed: ${error.message}` });
  }
}

async function saveDocument(req, res) {
  const { projectName, documentTitle, content, htmlContent, style, videoTranscript, tags, description } = req.body;

  if (!projectName || !documentTitle || !content) {
    return res.status(400).json({
      error: "Missing required fields: projectName, documentTitle, content",
    });
  }

  try {
    const pdfBase64 = await createPdfBase64(content, documentTitle);

    const newDocument = new DBDocument({
      projectName,
      sessionId: new Date().toISOString(),
      documentTitle,
      documentType: "markdown",
      content,
      htmlContent: htmlContent || "",
      pdfData: pdfBase64,
      style: style || "technical",
      videoTranscript: videoTranscript || "",
      tags: tags || [],
      description: description || "",
      status: "completed",
    });

    await newDocument.save();

    const project = await Project.findOne({ projectName });
    if (project) {
      project.documentCount += 1;
      project.sessions.push({
        sessionId: newDocument.sessionId,
        createdAt: new Date(),
        documentCount: 1,
      });
      await project.save();
    } else {
      await Project.create({
        projectName,
        description: `Auto-created for ${projectName}`,
        documentCount: 1,
        sessions: [{ sessionId: newDocument.sessionId, createdAt: new Date(), documentCount: 1 }],
      });
    }

    return res.json({
      success: true,
      message: "Document saved successfully",
      documentId: newDocument._id,
    });
  } catch (error) {
    console.error("Save Document Error:", error.message);
    return res.status(500).json({ error: `Failed to save document: ${error.message}` });
  }
}

async function getProjects(req, res) {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.json({ projects });
  } catch (error) {
    console.error("Get Projects Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
}

async function getDocumentsByProject(req, res) {
  const { projectName } = req.params;

  try {
    const documents = await DBDocument.find({ projectName }).sort({ createdAt: -1 });
    const project = await Project.findOne({ projectName });
    return res.json({ projectName, documentCount: documents.length, documents, project });
  } catch (error) {
    console.error("Get Documents Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch documents" });
  }
}

async function getDocument(req, res) {
  const { documentId } = req.params;

  try {
    const document = await DBDocument.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.json({ document });
  } catch (error) {
    console.error("Get Document Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch document" });
  }
}

async function updateDocument(req, res) {
  const { documentId } = req.params;
  const { documentTitle, content, htmlContent, style, tags, description, status } = req.body;

  try {
    const document = await DBDocument.findByIdAndUpdate(
      documentId,
      {
        ...(documentTitle && { documentTitle }),
        ...(content && { content }),
        ...(htmlContent && { htmlContent }),
        ...(style && { style }),
        ...(tags && { tags }),
        ...(description && { description }),
        ...(status && { status }),
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.json({ success: true, document });
  } catch (error) {
    console.error("Update Document Error:", error.message);
    return res.status(500).json({ error: "Failed to update document" });
  }
}

async function deleteDocument(req, res) {
  const { documentId } = req.params;

  try {
    const document = await DBDocument.findByIdAndDelete(documentId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const project = await Project.findOne({ projectName: document.projectName });
    if (project) {
      project.documentCount = Math.max(0, project.documentCount - 1);
      project.sessions = project.sessions.filter((session) => session.sessionId !== document.sessionId);
      await project.save();
    }

    return res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("Delete Document Error:", error.message);
    return res.status(500).json({ error: "Failed to delete document" });
  }
}

async function getProjectSessions(req, res) {
  const { projectName } = req.params;

  try {
    const documents = await DBDocument.find({ projectName }).select("sessionId createdAt documentTitle");
    const sessions = {};

    documents.forEach((document) => {
      if (!sessions[document.sessionId]) {
        sessions[document.sessionId] = {
          sessionId: document.sessionId,
          createdAt: document.createdAt,
          documents: [],
        };
      }

      sessions[document.sessionId].documents.push({
        documentId: document._id,
        documentTitle: document.documentTitle,
      });
    });

    return res.json({ projectName, sessions: Object.values(sessions) });
  } catch (error) {
    console.error("Get Sessions Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch sessions" });
  }
}

async function downloadPdfFromDb(req, res) {
  const { documentId } = req.params;

  try {
    const document = await DBDocument.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (!document.pdfData) {
      return res.status(404).json({ error: "PDF not found for this document" });
    }

    const pdfBuffer = Buffer.from(document.pdfData, "base64");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.documentTitle.replace(/\s+/g, "_")}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Download PDF Error:", error.message);
    return res.status(500).json({ error: "Failed to download PDF" });
  }
}

async function downloadMarkdownFromDb(req, res) {
  const { documentId } = req.params;

  try {
    const document = await DBDocument.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.setHeader("Content-Type", "text/markdown");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.documentTitle.replace(/\s+/g, "_")}.md"`
    );
    return res.send(document.content);
  } catch (error) {
    console.error("Download Markdown Error:", error.message);
    return res.status(500).json({ error: "Failed to download markdown" });
  }
}

async function ragQuery(req, res) {
  const { query, projectName, topK } = req.body;

  if (!query || !String(query).trim()) {
    return res.status(400).json({ error: "A query is required" });
  }

  try {
    const result = await answerQuestion(query, {
      projectName: projectName || undefined,
      topK: Number(topK) || 6,
    });

    return res.json(result);
  } catch (error) {
    console.error("RAG Query Error:", error.message);
    return res.status(500).json({ error: "Failed to answer question from saved transcripts and documents" });
  }
}

async function ragStats(req, res) {
  const { projectName } = req.query;

  try {
    const stats = await getCorpusStats(projectName || undefined);
    return res.json(stats);
  } catch (error) {
    console.error("RAG Stats Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch RAG corpus stats" });
  }
}

async function createNote(req, res) {
  const { title, content, projectName, tags, pinned } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      projectName: (projectName || "General").trim(),
      tags: Array.isArray(tags) ? tags : [],
      pinned: Boolean(pinned),
    });

    return res.status(201).json({ success: true, note });
  } catch (error) {
    console.error("Create Note Error:", error.message);
    return res.status(500).json({ error: "Failed to create note" });
  }
}

async function getNotes(req, res) {
  const { projectName } = req.query;
  const filter = projectName ? { projectName } : {};

  try {
    const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 });
    return res.json({ notes });
  } catch (error) {
    console.error("Get Notes Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch notes" });
  }
}

async function updateNote(req, res) {
  const { noteId } = req.params;
  const { title, content, projectName, tags, pinned } = req.body;

  try {
    const note = await Note.findByIdAndUpdate(
      noteId,
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim() }),
        ...(projectName !== undefined && { projectName: projectName.trim() || "General" }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
        ...(pinned !== undefined && { pinned: Boolean(pinned) }),
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.json({ success: true, note });
  } catch (error) {
    console.error("Update Note Error:", error.message);
    return res.status(500).json({ error: "Failed to update note" });
  }
}

async function deleteNote(req, res) {
  const { noteId } = req.params;

  try {
    const note = await Note.findByIdAndDelete(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.json({ success: true, message: "Note deleted" });
  } catch (error) {
    console.error("Delete Note Error:", error.message);
    return res.status(500).json({ error: "Failed to delete note" });
  }
}

module.exports = {
  createNote,
  deleteDocument,
  deleteNote,
  downloadDocx,
  downloadMarkdownFromDb,
  downloadPdf,
  downloadPdfFromDb,
  generateDoc,
  getDocument,
  getDocumentsByProject,
  getNotes,
  getProjects,
  getProjectSessions,
  ragQuery,
  ragStats,
  refineDoc,
  saveDocument,
  updateDocument,
  updateNote,
};
