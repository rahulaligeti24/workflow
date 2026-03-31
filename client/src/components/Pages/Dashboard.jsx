
import { useEffect, useRef, useState } from "react";
import {
  CodeInput,
  GenerateButton,
  Options,
  Preview,
  PromptBox,
  Status,
} from "../Dashboard/Components";
import OverlapModal from "../Dashboard/OverlapModal";
import "./Dashboard.css";

const API = "http://localhost:5000";

const sidebarItems = [
  { id: "overview", label: "Overview", badge: "00" },
  { id: "transcript", label: "Transcript", badge: "01" },
  { id: "html", label: "HTML", badge: "02" },
  { id: "docs", label: "Docs", badge: "03" },
  { id: "rag", label: "Knowledge", badge: "AI" },
  { id: "notes", label: "Notes", badge: "NT" },
];

function Dashboard() {
  const [activePanel, setActivePanel] = useState("overview");

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("technical");
  const [prompt, setPrompt] = useState("");
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [docSaving, setDocSaving] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [transcriptList, setTranscriptList] = useState([]);

  const [generatedHtml, setGeneratedHtml] = useState("");
  const [htmlMode, setHtmlMode] = useState("preview");
  const [htmlLoading, setHtmlLoading] = useState(false);

  const [overlaps, setOverlaps] = useState([]);
  const [showOverlapModal, setShowOverlapModal] = useState(false);
  const [overlapLoading, setOverlapLoading] = useState(false);

  const [previewText, setPreviewText] = useState("");
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);

  const [ragQuery, setRagQuery] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragSources, setRagSources] = useState([]);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragStats, setRagStats] = useState({ totalDocuments: 0, totalChunks: 0 });
  const [ragError, setRagError] = useState("");

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");

  const [savedDocuments, setSavedDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [openingDocumentId, setOpeningDocumentId] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const currentProject = (title || videoTitle || "General").trim();
  const completedSteps = [transcript, generatedHtml, preview].filter(Boolean).length;
  const latestTranscriptTitle = transcriptList[transcriptList.length - 1]?.title || "No transcript yet";
  const docsPanelRef = useRef(null);

  const refreshRagStats = async () => {
    try {
      const res = await fetch(`${API}/rag/stats`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load knowledge base stats");
      setRagStats(data);
    } catch (err) {
      console.error("RAG stats error:", err.message);
    }
  };

  const fetchSavedDocuments = async (projectName) => {
    if (!projectName) {
      setSavedDocuments([]);
      return;
    }

    setDocsLoading(true);
    try {
      const res = await fetch(`${API}/documents/${encodeURIComponent(projectName)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load saved documents");
      setSavedDocuments(data.documents || []);
    } catch (err) {
      console.error("Saved documents error:", err.message);
      setSavedDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  };

  const fetchNotes = async (projectName) => {
    setNotesLoading(true);
    try {
      const query = projectName ? `?projectName=${encodeURIComponent(projectName)}` : "";
      const res = await fetch(`${API}/notes${query}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load notes");
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Notes error:", err.message);
      setNoteMessage(err.message);
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    refreshRagStats();
  }, []);

  useEffect(() => {
    fetchNotes(currentProject);
  }, [currentProject]);

  useEffect(() => {
    fetchSavedDocuments(currentProject);
  }, [currentProject]);

  const resetNoteForm = () => {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteTags("");
    setNotePinned(false);
  };

  const uploadVideo = async () => {
    if (!videoFile) {
      alert("Please select a video file first");
      return;
    }

    setVideoLoading(true);
    setTranscript("");
    setGeneratedHtml("");

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      const res = await fetch(`${API}/video-to-text`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTranscript(data.transcript);
      setTranscriptList((prev) => [
        ...prev,
        { id: Date.now(), title: videoTitle || videoFile.name, text: data.transcript },
      ]);
      setActivePanel("transcript");
    } catch (err) {
      alert(`Transcription failed: ${err.message}`);
    } finally {
      setVideoLoading(false);
    }
  };

  const generateHtml = async () => {
    if (!transcript.trim()) {
      alert("Transcribe a video first");
      return;
    }

    setHtmlLoading(true);
    setGeneratedHtml("");
    setHtmlMode("preview");

    try {
      const res = await fetch(`${API}/transcript-to-html`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, title: videoTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGeneratedHtml(data.html);
      setActivePanel("html");
    } catch (err) {
      alert(`HTML generation failed: ${err.message}`);
    } finally {
      setHtmlLoading(false);
    }
  };
  const sendToCodeDoc = () => {
    setCode(generatedHtml);
    setTitle(videoTitle || title);
    setActivePanel("docs");
  };

  const saveDocumentToDB = async (content, htmlContent, options = {}) => {
    const effectiveTitle = (title || videoTitle || "Untitled").trim();

    if (!effectiveTitle || !content) {
      return;
    }

    try {
      const isManualSave = Boolean(options.manual);
      const payload = {
        projectName: effectiveTitle,
        documentTitle: `${effectiveTitle} - ${new Date().toLocaleDateString()}`,
        content,
        htmlContent: htmlContent || "",
        style,
        videoTranscript: transcript || "",
        description: `Auto-saved document from ${new Date().toLocaleString()}`,
        tags: [style, "auto-saved"],
      };

      const res = await fetch(`${API}/save-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      await refreshRagStats();
      await fetchNotes(effectiveTitle);
      await fetchSavedDocuments(effectiveTitle);

      if (isManualSave) {
        setStatus({ type: "success", message: `Document saved for ${effectiveTitle}.` });
      }

      return true;
    } catch (err) {
      console.error("Save error:", err.message);
      if (options.manual) {
        setStatus({ type: "error", message: err.message || "Failed to save document." });
      }
      return false;
    }
  };

  const saveCurrentDocument = async () => {
    const contentToSave = (previewText || preview || "").trim();

    if (!contentToSave) {
      setStatus({ type: "error", message: "Generate documentation before saving it." });
      return;
    }

    setDocSaving(true);
    await saveDocumentToDB(contentToSave, code, { manual: true });
    setDocSaving(false);
  };

  const generateDoc = async () => {
    if (!code.trim()) {
      setStatus({ type: "error", message: "Paste or generate HTML code first." });
      return;
    }

    const isHTML = /<[a-z][\s\S]*>/i.test(code);
    if (!isHTML) {
      setStatus({ type: "error", message: "Please provide valid HTML. No tags were detected." });
      return;
    }

    setLoading(true);
    setStatus({ type: "loading", message: "Analysing HTML and generating documentation..." });

    try {
      const res = await fetch(`${API}/generate-doc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, style, title, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPreview(data.result);
      setPreviewText(data.result);
      setStatus({ type: "success", message: "Documentation generated successfully." });
      setActivePanel("docs");
      await saveDocumentToDB(data.result, code);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const refineDoc = async () => {
    if (!previewText) {
      alert("No documentation to refine");
      return;
    }

    setRefineLoading(true);
    setStatus({ type: "loading", message: "Refining documentation..." });

    try {
      const res = await fetch(`${API}/refine-doc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: previewText,
          refinement: refinementPrompt,
          code,
          style,
          title,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPreview(data.result);
      setPreviewText(data.result);
      setRefinementPrompt("");
      setStatus({ type: "success", message: "Documentation refined successfully." });
      await saveDocumentToDB(data.result, code);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setRefineLoading(false);
    }
  };

  const askRag = async () => {
    if (!ragQuery.trim()) {
      setRagError("Ask a question about the saved transcripts or generated documents first.");
      return;
    }

    setRagLoading(true);
    setRagError("");
    setRagAnswer("");
    setRagSources([]);

    try {
      const scopedProject = currentProject && currentProject !== "General" ? currentProject : undefined;

      let res = await fetch(`${API}/rag/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: ragQuery, projectName: scopedProject, topK: 6 }),
      });
      let data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if ((!data.sources || data.sources.length === 0) && scopedProject) {
        res = await fetch(`${API}/rag/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: ragQuery, topK: 6 }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setRagAnswer(data.answer || "No answer returned.");
      setRagSources(data.sources || []);
      if (!data.sources || data.sources.length === 0) {
        setRagError("No matching saved transcript or document was found yet. Generate and save a document first, or try a broader query.");
      }
    } catch (err) {
      setRagError(err.message);
    } finally {
      setRagLoading(false);
    }
  };

  const downloadFile = async (endpoint, extension) => {
    if (!preview) {
      alert("Generate documentation first");
      return;
    }

    try {
      const res = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: preview, title }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(title || "documentation").replace(/\s+/g, "_")}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  const detectOverlaps = async () => {
    if (transcriptList.length < 2) {
      alert("Upload at least 2 videos to detect overlapping topics");
      return;
    }

    setOverlapLoading(true);

    try {
      const res = await fetch(`${API}/detect-overlaps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcripts: transcriptList }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (!data.overlaps.length) {
        alert("No overlapping topics found between the uploaded videos.");
      } else {
        setOverlaps(data.overlaps);
        setShowOverlapModal(true);
      }
    } catch (err) {
      alert(`Overlap detection failed: ${err.message}`);
    } finally {
      setOverlapLoading(false);
    }
  };

  const handleOverlapSelect = (excerpt) => {
    if (excerpt) {
      setCode((prev) =>
        prev
          ? `${prev}\n\n<!-- Selected from overlap -->\n<section>\n  <p>${excerpt}</p>\n</section>`
          : `<section>\n  <p>${excerpt}</p>\n</section>`
      );
      setActivePanel("docs");
    }

    setShowOverlapModal(false);
  };

  const startNewNote = () => {
    resetNoteForm();
    setNoteMessage("");
    setActivePanel("notes");
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note._id);
    setNoteTitle(note.title || "");
    setNoteContent(note.content || "");
    setNoteTags((note.tags || []).join(", "));
    setNotePinned(Boolean(note.pinned));
    setNoteMessage("");
    setActivePanel("notes");
  };
  const saveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      setNoteMessage("Add both a title and content before saving the note.");
      return;
    }

    setNoteSaving(true);
    setNoteMessage("");

    const payload = {
      title: noteTitle,
      content: noteContent,
      projectName: currentProject,
      tags: noteTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      pinned: notePinned,
    };

    try {
      const endpoint = editingNoteId ? `${API}/notes/${editingNoteId}` : `${API}/notes`;
      const method = editingNoteId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save note");

      setNoteMessage(editingNoteId ? "Note updated." : "Note saved.");
      resetNoteForm();
      await fetchNotes(currentProject);
    } catch (err) {
      setNoteMessage(err.message);
    } finally {
      setNoteSaving(false);
    }
  };

  const removeNote = async (noteId) => {
    try {
      const res = await fetch(`${API}/notes/${noteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete note");

      if (editingNoteId === noteId) {
        resetNoteForm();
      }
      await fetchNotes(currentProject);
      setNoteMessage("Note removed.");
    } catch (err) {
      setNoteMessage(err.message);
    }
  };


  const renderOverview = () => (
    <section className="workspace-panel card">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Workspace Overview</p>
          <h1 className="panel-title">One place for transcripts, documentation, knowledge, and notes.</h1>
          <p className="section-summary">
            Use the sidebar to move between each stage. Your current project stays connected,
            so notes, saved documents, and retrieval all build on the same source material.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActivePanel("transcript")}>
          Start With Transcript
        </button>
      </div>

      <div className="overview-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Current project</span>
          <strong>{currentProject}</strong>
          <p>{videoTitle ? "Using the active video title as context." : "General workspace scope."}</p>
        </div>
        <div className="stat-card">
          <span className="stat-label">Progress</span>
          <strong>{completedSteps}/3 stages</strong>
          <p>Transcript, HTML generation, and final docs are tracked here.</p>
        </div>
        <div className="stat-card">
          <span className="stat-label">Knowledge base</span>
          <strong>{ragStats.totalChunks} chunks</strong>
          <p>{ragStats.totalDocuments} saved documents are ready for retrieval.</p>
        </div>
        <div className="stat-card">
          <span className="stat-label">Notes</span>
          <strong>{notes.length} saved</strong>
          <p>Capture decisions, reminders, and handoff context for this project.</p>
        </div>
      </div>

      <div className="quick-actions-grid">
        <button className="quick-action-card" onClick={() => setActivePanel("transcript")}>
          <span className="quick-badge">01</span>
          <strong>Upload and transcribe</strong>
          <p>{latestTranscriptTitle}</p>
        </button>
        <button className="quick-action-card" onClick={() => setActivePanel("html")}>
          <span className="quick-badge">02</span>
          <strong>Review HTML</strong>
          <p>{generatedHtml ? "Generated HTML is ready to inspect." : "Create HTML from a transcript first."}</p>
        </button>
        <button className="quick-action-card" onClick={() => setActivePanel("docs")}>
          <span className="quick-badge">03</span>
          <strong>Generate docs</strong>
          <p>{preview ? "A documentation draft is available." : "Send HTML into the doc generator."}</p>
        </button>
        <button className="quick-action-card" onClick={() => setActivePanel("notes")}>
          <span className="quick-badge">NT</span>
          <strong>Share notes</strong>
          <p>Keep project notes visible for your team and future sessions.</p>
        </button>
      </div>
    </section>
  );

  const renderTranscriptPanel = () => (
    <section className="workspace-panel card">
      <div className="section-intro">
        <div>
          <p className="section-kicker">Step 01</p>
          <div className="card-title"><span className="step-badge">01</span> Video to Transcript</div>
        </div>
        <p className="section-summary">Upload a video, review the transcript, and detect overlaps when you have more than one source.</p>
      </div>

      <div className="field-row">
        <input
          className="text-input"
          placeholder="Document / video title (optional)"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
        />
      </div>

      <div className="field-row upload-row">
        <label className="file-label">
          {videoFile ? videoFile.name : "Choose video file"}
          <input
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
        </label>
        <button className="btn btn-primary" onClick={uploadVideo} disabled={videoLoading}>
          {videoLoading ? <><span className="spinner" /> Transcribing...</> : "Transcribe"}
        </button>
      </div>

      <div className="support-grid">
        <div className="info-tile">
          <strong>{transcriptList.length}</strong>
          <span>Videos loaded</span>
        </div>
        <div className="info-tile">
          <strong>{transcript ? "Ready" : "Waiting"}</strong>
          <span>Transcript status</span>
        </div>
      </div>

      <div className="comp-box transcript-box">
        <div className="area-label">
          Transcript
          <span className="badge-count">{transcriptList.length} saved source{transcriptList.length !== 1 ? "s" : ""}</span>
        </div>
        <textarea
          className="mono-textarea"
          value={transcript}
          rows={10}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your transcript will appear here after upload."
        />
        <div className="transcript-actions">
          <button className="btn btn-secondary" onClick={generateHtml} disabled={htmlLoading || !transcript.trim()}>
            {htmlLoading ? <><span className="spinner" /> Generating HTML...</> : "Generate HTML from Transcript"}
          </button>
          <button className="btn btn-warn" onClick={detectOverlaps} disabled={overlapLoading || transcriptList.length < 2}>
            {overlapLoading ? <><span className="spinner" /> Detecting...</> : `Detect Overlaps (${transcriptList.length})`}
          </button>
        </div>
      </div>
    </section>
  );

  const renderHtmlPanel = () => (
    <section className="workspace-panel card">
      <div className="section-intro">
        <div>
          <p className="section-kicker">Step 02</p>
          <div className="card-title"><span className="step-badge">02</span> HTML Preview and Edit</div>
        </div>
        <p className="section-summary">Preview the generated structure or fine-tune the raw HTML before creating documentation.</p>
      </div>
      <div className="preview-toolbar">
        <div className="tab-group">
          <button className={`tab ${htmlMode === "preview" ? "tab-active" : ""}`} onClick={() => setHtmlMode("preview")}>Preview</button>
          <button className={`tab ${htmlMode === "edit" ? "tab-active" : ""}`} onClick={() => setHtmlMode("edit")}>Edit HTML</button>
        </div>
        <button className="btn btn-accent" onClick={sendToCodeDoc} disabled={!generatedHtml}>
          Send to Doc Generator
        </button>
      </div>

      {generatedHtml ? (
        htmlMode === "preview" ? (
          <div className="html-render-frame" dangerouslySetInnerHTML={{ __html: generatedHtml }} />
        ) : (
          <textarea
            className="mono-textarea code-textarea"
            value={generatedHtml}
            rows={18}
            onChange={(e) => setGeneratedHtml(e.target.value)}
          />
        )
      ) : (
        <div className="empty-panel-state">
          <strong>No HTML draft yet.</strong>
          <p>Generate HTML from the transcript panel and it will appear here.</p>
        </div>
      )}
    </section>
  );

  const openSavedDocument = async (document) => {
    if (!document?._id) {
      setStatus({ type: "error", message: "Saved document could not be opened." });
      return;
    }

    setOpeningDocumentId(document._id);
    setStatus({ type: "loading", message: `Opening ${document.documentTitle}...` });

    try {
      const res = await fetch(`${API}/document/${document._id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load saved document");

      const loadedDocument = data.document;
      setSelectedDocumentId(loadedDocument._id);
      setTitle(loadedDocument.projectName || loadedDocument.documentTitle || title);
      setStyle(loadedDocument.style || "technical");
      setTranscript(loadedDocument.videoTranscript || "");
      setGeneratedHtml(loadedDocument.htmlContent || "");
      setCode(loadedDocument.htmlContent || "");
      setPreview(loadedDocument.content || "");
      setPreviewText(loadedDocument.content || "");
      setActivePanel("docs");
      setStatus({
        type: "success",
        message: `Opened saved document: ${loadedDocument.documentTitle}`,
      });

      setTimeout(() => {
        docsPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Failed to open saved document." });
    } finally {
      setOpeningDocumentId("");
    }
  };

  const renderDocsPanel = () => (
    <section className="workspace-panel card" ref={docsPanelRef}>
      <div className="section-intro">
        <div>
          <p className="section-kicker">Step 03</p>
          <div className="card-title"><span className="step-badge">03</span> Documentation Generator</div>
        </div>
        <p className="section-summary">Generate markdown docs, refine them with the model, and export the final version when it is ready.</p>
      </div>

      <CodeInput code={code} setCode={setCode} />
      <Options title={title} setTitle={setTitle} style={style} setStyle={setStyle} />
      <PromptBox prompt={prompt} setPrompt={setPrompt} />
      <GenerateButton loading={loading} generateDoc={generateDoc} />
      <Status status={status} />
      <Preview
        preview={preview}
        previewText={previewText}
        setPreviewText={setPreviewText}
        refinementPrompt={refinementPrompt}
        setRefinementPrompt={setRefinementPrompt}
        onRefine={refineDoc}
        refineLoading={refineLoading}
      />

      {preview && (
        <div className="download-row">
          <button className="btn btn-primary" onClick={saveCurrentDocument} disabled={docSaving}>
            {docSaving ? <><span className="spinner" /> Saving...</> : "Save Document"}
          </button>
          <button className="btn btn-docx" onClick={() => downloadFile("download-docx", "docx")}>
            Download Word (.docx)
          </button>
          <button className="btn btn-pdf" onClick={() => downloadFile("download-pdf", "pdf")}>
            Download PDF (.pdf)
          </button>
        </div>
      )}

      <div className="notes-list comp-box">
        <div className="notes-list-header">
          <div>
            <div className="comp-label">Saved documents</div>
            <p className="notes-project-label">Showing saved documents for {currentProject}</p>
          </div>
          <span className="note-pin-badge">{savedDocuments.length} total</span>
        </div>

        {docsLoading ? (
          <div className="empty-panel-state">
            <strong>Loading saved documents...</strong>
          </div>
        ) : savedDocuments.length === 0 ? (
          <div className="empty-panel-state">
            <strong>No saved documents yet.</strong>
            <p>Generate documentation and it will appear here after it is saved.</p>
          </div>
        ) : (
          <div className="notes-list-stack">
            {savedDocuments.map((document) => (
              <article key={document._id} className={`note-card ${selectedDocumentId === document._id ? "note-card-pinned" : ""}`}>
                <div className="note-card-header">
                  <div>
                    <h3>{document.documentTitle}</h3>
                    <p>{new Date(document.updatedAt || document.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="note-pin-badge">{document.style || "technical"}</span>
                </div>
                <p className="note-card-body">{(document.content || "").slice(0, 220)}{document.content && document.content.length > 220 ? "..." : ""}</p>
                <div className="note-card-actions">
                  <button className="btn btn-secondary" onClick={() => openSavedDocument(document)} disabled={openingDocumentId === document._id}>{openingDocumentId === document._id ? <><span className="spinner" /> Opening...</> : "Open"}</button>
                  <button className="btn btn-docx" onClick={() => window.open(`${API}/download-markdown-from-db/${document._id}`, "_blank")}>Download .md</button>
                  <button className="btn btn-pdf" onClick={() => window.open(`${API}/download-pdf-from-db/${document._id}`, "_blank")}>Download .pdf</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const renderRagPanel = () => (
    <section className="workspace-panel card rag-card">
      <div className="section-intro">
        <div>
          <p className="section-kicker">Knowledge Layer</p>
          <div className="card-title"><span className="step-badge">AI</span> Transcript and Document Q&A</div>
        </div>
        <p className="section-summary">Search across saved transcripts and generated docs, then answer from retrieved evidence.</p>
      </div>

      <div className="rag-stats-row">
        <div className="rag-stat-pill">
          <strong>{ragStats.totalDocuments}</strong>
          <span>saved docs in corpus</span>
        </div>
        <div className="rag-stat-pill">
          <strong>{ragStats.totalChunks}</strong>
          <span>searchable chunks</span>
        </div>
        <div className="rag-stat-pill">
          <strong>{currentProject}</strong>
          <span>current project scope</span>
        </div>
      </div>

      <div className="comp-box">
        <div className="comp-label">Ask the knowledge base</div>
        <textarea
          className="mono-textarea"
          rows={3}
          value={ragQuery}
          onChange={(e) => setRagQuery(e.target.value)}
          placeholder="e.g. What repeated ideas show up in this project's transcripts and generated docs?"
        />
        <div className="rag-actions">
          <button className="btn btn-primary" onClick={askRag} disabled={ragLoading}>
            {ragLoading ? <><span className="spinner" /> Searching knowledge base...</> : "Ask RAG"}
          </button>
        </div>
      </div>

      {ragError ? <p className="status-msg status-error">{ragError}</p> : null}

      {(ragAnswer || ragSources.length > 0) && (
        <div className="rag-results">
          <div className="comp-box">
            <div className="comp-label">Answer</div>
            <div className="rag-answer">{ragAnswer}</div>
          </div>

          {ragSources.length > 0 && (
            <div className="comp-box">
              <div className="comp-label">Retrieved Sources</div>
              <div className="rag-source-list">
                {ragSources.map((source, index) => (
                  <div key={`${source.documentId}-${source.chunkIndex}-${index}`} className="rag-source-item">
                    <div className="rag-source-head">
                      <strong>{source.documentTitle}</strong>
                      <span>{source.type}</span>
                    </div>
                    <p>{source.chunk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
  const renderNotesPanel = () => (
    <section className="workspace-panel card">
      <div className="section-intro">
        <div>
          <p className="section-kicker">Shared Notes</p>
          <div className="card-title"><span className="step-badge">NT</span> Team Notes and Important Context</div>
        </div>
        <p className="section-summary">Save reminders, decisions, action items, or handoff details so important context stays with the project.</p>
      </div>

      <div className="notes-layout">
        <div className="notes-editor comp-box">
          <div className="notes-editor-header">
            <div>
              <div className="comp-label">{editingNoteId ? "Edit note" : "Create note"}</div>
              <p className="notes-project-label">Project scope: {currentProject}</p>
            </div>
            {editingNoteId ? (
              <button className="btn btn-secondary" onClick={resetNoteForm}>New note</button>
            ) : null}
          </div>

          <input
            className="text-input"
            placeholder="Note title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
          <textarea
            className="mono-textarea notes-textarea"
            rows={10}
            placeholder="Capture anything worth sharing with the team..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
          <input
            className="text-input"
            placeholder="Tags, comma separated"
            value={noteTags}
            onChange={(e) => setNoteTags(e.target.value)}
          />
          <label className="pin-toggle">
            <input type="checkbox" checked={notePinned} onChange={(e) => setNotePinned(e.target.checked)} />
            <span>Pin this note</span>
          </label>
          <div className="notes-editor-actions">
            <button className="btn btn-primary" onClick={saveNote} disabled={noteSaving}>
              {noteSaving ? <><span className="spinner" /> Saving...</> : editingNoteId ? "Update Note" : "Save Note"}
            </button>
            <button className="btn btn-secondary" onClick={startNewNote}>Clear</button>
          </div>
          {noteMessage ? <p className="status-msg status-loading">{noteMessage}</p> : null}
        </div>

        <div className="notes-list comp-box">
          <div className="notes-list-header">
            <div>
              <div className="comp-label">Saved notes</div>
              <p className="notes-project-label">Showing notes for {currentProject}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => fetchNotes(currentProject)} disabled={notesLoading}>
              Refresh
            </button>
          </div>

          {notesLoading ? (
            <div className="empty-panel-state">
              <strong>Loading notes...</strong>
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-panel-state">
              <strong>No notes yet.</strong>
              <p>Create the first shared note for this project.</p>
            </div>
          ) : (
            <div className="notes-list-stack">
              {notes.map((note) => (
                <article key={note._id} className={`note-card ${note.pinned ? "note-card-pinned" : ""}`}>
                  <div className="note-card-header">
                    <div>
                      <h3>{note.title}</h3>
                      <p>{new Date(note.updatedAt).toLocaleString()}</p>
                    </div>
                    {note.pinned ? <span className="note-pin-badge">Pinned</span> : null}
                  </div>
                  <p className="note-card-body">{note.content}</p>
                  {note.tags?.length ? (
                    <div className="note-tags-row">
                      {note.tags.map((tag) => (
                        <span key={`${note._id}-${tag}`} className="note-tag">{tag}</span>
                      ))}
                    </div>
                  ) : null}
                  <div className="note-card-actions">
                    <button className="btn btn-secondary" onClick={() => handleEditNote(note)}>Edit</button>
                    <button className="btn btn-accent" onClick={() => copyNote(note)}>Copy</button>
                    <button className="btn btn-warn" onClick={() => removeNote(note._id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderActivePanel = () => {
    switch (activePanel) {
      case "transcript":
        return renderTranscriptPanel();
      case "html":
        return renderHtmlPanel();
      case "docs":
        return renderDocsPanel();
      case "rag":
        return renderRagPanel();
      case "notes":
        return renderNotesPanel();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-orb dashboard-orb-one" />
      <div className="dashboard-orb dashboard-orb-two" />
      <div className="dashboard-grid" />

      <div className="dashboard-shell dashboard-sidebar-shell">
        <aside className="dashboard-sidebar card">
          <div className="sidebar-top">
            <p className="sidebar-kicker">AI Workspace</p>
            <h2>WorkFlow</h2>
          </div>
          <nav className="sidebar-nav" aria-label="Dashboard panels">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-link ${activePanel === item.id ? "sidebar-link-active" : ""}`}
                onClick={() => setActivePanel(item.id)}
                type="button"
              >
                <span className="sidebar-link-badge">{item.badge}</span>
                <span className="sidebar-link-text">
                  <strong>{item.label}</strong>
                  <small>
                    {item.id === "overview" && "Workspace summary"}
                    {item.id === "transcript" && "Upload and transcribe"}
                    {item.id === "html" && "Inspect generated HTML"}
                    {item.id === "docs" && "Write and export docs"}
                    {item.id === "rag" && "Query saved knowledge"}
                    {item.id === "notes" && "Share important notes"}
                  </small>
                </span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer comp-box">
            <div className="sidebar-mini-stats">
              <div>
                <strong>{completedSteps}/3</strong>
                <span>workflow done</span>
              </div>
              <div>
                <strong>{notes.length}</strong>
                <span>notes saved</span>
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={startNewNote}>New Shared Note</button>
          </div>
        </aside>

        <main className="dashboard-main">{renderActivePanel()}</main>
      </div>

      {showOverlapModal && (
        <OverlapModal
          overlaps={overlaps}
          transcripts={transcriptList}
          onSelect={handleOverlapSelect}
          onClose={() => setShowOverlapModal(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;










