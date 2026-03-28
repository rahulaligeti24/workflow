const express = require("express");
const {
  deleteDocument,
  downloadDocx,
  downloadMarkdownFromDb,
  downloadPdf,
  downloadPdfFromDb,
  generateDoc,
  getDocument,
  getDocumentsByProject,
  getProjects,
  getProjectSessions,
  refineDoc,
  saveDocument,
  updateDocument,
} = require("../controllers/documentController");

const router = express.Router();

router.post("/generate-doc", generateDoc);
router.post("/refine-doc", refineDoc);
router.post("/download-docx", downloadDocx);
router.post("/download-pdf", downloadPdf);
router.post("/save-document", saveDocument);
router.get("/projects", getProjects);
router.get("/documents/:projectName", getDocumentsByProject);
router.get("/document/:documentId", getDocument);
router.put("/document/:documentId", updateDocument);
router.delete("/document/:documentId", deleteDocument);
router.get("/project-sessions/:projectName", getProjectSessions);
router.get("/download-pdf-from-db/:documentId", downloadPdfFromDb);
router.get("/download-markdown-from-db/:documentId", downloadMarkdownFromDb);

module.exports = router;
