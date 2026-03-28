import { useRef, useState } from "react";
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

function Dashboard() {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("technical");
  const [prompt, setPrompt] = useState("");
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

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

  const codeDocRef = useRef(null);

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
    } catch (err) {
      alert(`HTML generation failed: ${err.message}`);
    } finally {
      setHtmlLoading(false);
    }
  };

  const sendToCodeDoc = () => {
    setCode(generatedHtml);
    setTitle(videoTitle || title);
    codeDocRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveDocumentToDB = async (content, htmlContent) => {
    if (!title || !content) {
      return;
    }

    try {
      const payload = {
        projectName: title || "Untitled",
        documentTitle: `${title || "Document"} - ${new Date().toLocaleDateString()}`,
        content,
        htmlContent: htmlContent || "",
        style,
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
    } catch (err) {
      console.error("Save error:", err.message);
    }
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
    }

    setShowOverlapModal(false);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="app-header">
          <div style={{ flex: 1 }}>
            <h1>
              CodeDoc <span className="header-plus">+</span> Video AI
            </h1>
            <p className="app-subtitle">
              Transcribe videos, generate HTML, detect overlaps, and build documentation in one
              workspace.
            </p>
          </div>
        </header>

        <section className="card">
          <div className="card-title">
            <span className="step-badge">01</span>
            Video to Transcript
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
              {videoLoading ? (
                <>
                  <span className="spinner" /> Transcribing...
                </>
              ) : (
                "Transcribe"
              )}
            </button>
          </div>

          {transcript && (
            <div className="transcript-area">
              <div className="area-label">
                Transcript
                <span className="badge-count">
                  {transcriptList.length} video{transcriptList.length !== 1 ? "s" : ""} loaded
                </span>
              </div>

              <textarea
                className="mono-textarea"
                value={transcript}
                rows={7}
                onChange={(e) => setTranscript(e.target.value)}
              />

              <div className="transcript-actions">
                <button className="btn btn-secondary" onClick={generateHtml} disabled={htmlLoading}>
                  {htmlLoading ? (
                    <>
                      <span className="spinner" /> Generating HTML...
                    </>
                  ) : (
                    "Generate HTML from Transcript"
                  )}
                </button>

                {transcriptList.length >= 2 && (
                  <button className="btn btn-warn" onClick={detectOverlaps} disabled={overlapLoading}>
                    {overlapLoading ? (
                      <>
                        <span className="spinner" /> Detecting...
                      </>
                    ) : (
                      `Detect Overlaps (${transcriptList.length} videos)`
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {generatedHtml && (
          <section className="card">
            <div className="card-title">
              <span className="step-badge">02</span>
              HTML Preview and Edit
            </div>

            <div className="preview-toolbar">
              <div className="tab-group">
                <button
                  className={`tab ${htmlMode === "preview" ? "tab-active" : ""}`}
                  onClick={() => setHtmlMode("preview")}
                >
                  Preview
                </button>
                <button
                  className={`tab ${htmlMode === "edit" ? "tab-active" : ""}`}
                  onClick={() => setHtmlMode("edit")}
                >
                  Edit HTML
                </button>
              </div>

              <button className="btn btn-accent" onClick={sendToCodeDoc}>
                Send to Doc Generator
              </button>
            </div>

            {htmlMode === "preview" ? (
              <div className="html-render-frame" dangerouslySetInnerHTML={{ __html: generatedHtml }} />
            ) : (
              <textarea
                className="mono-textarea code-textarea"
                value={generatedHtml}
                rows={18}
                onChange={(e) => setGeneratedHtml(e.target.value)}
              />
            )}
          </section>
        )}

        <section className="card" ref={codeDocRef}>
          <div className="card-title">
            <span className="step-badge">03</span>
            Documentation Generator
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
              <button className="btn btn-docx" onClick={() => downloadFile("download-docx", "docx")}>
                Download Word (.docx)
              </button>
              <button className="btn btn-pdf" onClick={() => downloadFile("download-pdf", "pdf")}>
                Download PDF (.pdf)
              </button>
            </div>
          )}
        </section>

        {showOverlapModal && (
          <OverlapModal
            overlaps={overlaps}
            transcripts={transcriptList}
            onSelect={handleOverlapSelect}
            onClose={() => setShowOverlapModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
