const express = require("express");
const {
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
} = require("../controllers/documentController");

const router = express.Router();

router.post("/generate-doc", generateDoc);
router.post("/refine-doc", refineDoc);
router.post("/download-docx", downloadDocx);
router.post("/download-pdf", downloadPdf);
router.post("/save-document", saveDocument);
router.post("/rag/query", ragQuery);
router.post("/notes", createNote);
router.get("/rag/stats", ragStats);
router.get("/projects", getProjects);
router.get("/notes", getNotes);
router.get("/documents/:projectName", getDocumentsByProject);
router.get("/document/:documentId", getDocument);
router.put("/document/:documentId", updateDocument);
router.put("/notes/:noteId", updateNote);
router.delete("/document/:documentId", deleteDocument);
router.delete("/notes/:noteId", deleteNote);
router.get("/project-sessions/:projectName", getProjectSessions);
router.get("/download-pdf-from-db/:documentId", downloadPdfFromDb);
router.get("/download-markdown-from-db/:documentId", downloadMarkdownFromDb);

module.exports = router;
