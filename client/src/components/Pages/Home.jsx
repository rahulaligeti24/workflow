import React from "react";
import "./Home.css";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

const problems = [
  "Scattered communication",
  "Lost decisions",
  "Poor documentation",
];

const features = [
  {
    title: "Video to Text Transcription",
    description:
      "Convert long-form meeting recordings into structured, searchable transcripts in minutes.",
    icon: (
      <svg viewBox="0 0 24 24" className="feature-icon-svg" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14.25 5.25h4.5v13.5h-4.5m-4.5-9v4.5m0 0H5.25m4.5 0h4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Insight Extraction",
    description:
      "Identify tasks, decisions, blockers, and owners automatically from natural conversations.",
    icon: (
      <svg viewBox="0 0 24 24" className="feature-icon-svg" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3.75v4.5m0 7.5v4.5m8.25-8.25h-4.5m-7.5 0h-4.5m12.22-5.72-3.18 3.18m-5.08 5.08-3.18 3.18m11.44 0-3.18-3.18m-5.08-5.08-3.18-3.18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Auto Document Generation",
    description:
      "Create polished summaries, follow-up notes, and internal documents without manual cleanup.",
    icon: (
      <svg viewBox="0 0 24 24" className="feature-icon-svg" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7.5 3.75h6.879a2.25 2.25 0 0 1 1.591.659l2.621 2.621a2.25 2.25 0 0 1 .659 1.591V18A2.25 2.25 0 0 1 17 20.25H7.5A2.25 2.25 0 0 1 5.25 18V6A2.25 2.25 0 0 1 7.5 3.75Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 9.75h6m-6 3h6m-6 3h3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Fast Processing",
    description:
      "Built for rapid turnaround so teams can act on meetings while context is still fresh.",
    icon: (
      <svg viewBox="0 0 24 24" className="feature-icon-svg" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13.5 4.5 6 13.5h4.5l-1.5 6 7.5-9H12l1.5-6Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "High Accuracy",
    description:
      "Capture key business details with precision across strategic reviews, sales calls, and standups.",
    icon: (
      <svg viewBox="0 0 24 24" className="feature-icon-svg" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m9 12 2.25 2.25L15 9.75m5.25 2.25c0 4.97-3.77 8.25-8.25 9.75-4.48-1.5-8.25-4.78-8.25-9.75V6.75L12 2.25l8.25 4.5V12Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Multi-language Support",
    description:
      "Handle global team conversations with language-aware transcription and structured outputs.",
    icon: (
      <svg viewBox="0 0 24 24" className="feature-icon-svg" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10.5 6h8.25M12 4.5v1.5m2.25 0a9.53 9.53 0 0 1-2.27 5.98A9.53 9.53 0 0 1 9.75 6m0 0H5.25m4.5 0v-1.5M6.75 13.5h4.5m-2.25 0v6m8.625-3.75h-5.25m2.625-4.5-3.75 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const useCases = [
  {
    title: "Enterprises",
    description: "Standardize executive meetings, project reviews, and stakeholder updates at scale.",
  },
  {
    title: "Teams",
    description: "Keep fast-moving departments aligned with clear summaries and assigned follow-ups.",
  },
  {
    title: "Students",
    description: "Turn lectures, seminars, and study groups into organized notes and revision points.",
  },
  {
    title: "Content Creators",
    description: "Repurpose recordings into scripts, clips, outlines, and publish-ready content faster.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying the workflow.",
    features: ["3 uploads / month", "Basic transcript export", "Summary generation"],
  },
  {
    name: "Pro",
    price: "$29",
    description: "For teams that need speed and consistency.",
    features: ["Unlimited uploads", "Tasks and decisions extraction", "Priority processing"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Advanced controls for larger organizations.",
    features: ["SSO and admin controls", "Custom retention policies", "Dedicated success support"],
  },
];

const socialIcons = [
  {
    label: "X",
    icon: (
      <svg viewBox="0 0 24 24" className="social-svg" fill="currentColor">
        <path d="M18.901 2.25h2.883l-6.3 7.2L22.9 21.75h-5.806l-4.547-5.942-5.2 5.942H4.46l6.738-7.703L1.1 2.25h5.953l4.11 5.432 4.738-5.432Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="social-svg" fill="currentColor">
        <path d="M6.94 8.5H3.56V19.5h3.38V8.5ZM5.25 3A1.96 1.96 0 1 0 5.3 6.92 1.96 1.96 0 0 0 5.25 3Zm5.2 5.5H7.17V19.5h3.28v-5.45c0-1.44.27-2.83 2.05-2.83 1.75 0 1.77 1.64 1.77 2.92v5.36h3.28v-6.02c0-2.96-.64-5.24-4.1-5.24-1.67 0-2.8.92-3.26 1.79h-.05V8.5Z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    icon: (
      <svg viewBox="0 0 24 24" className="social-svg" fill="currentColor">
        <path d="M12 .75a11.25 11.25 0 0 0-3.557 21.922c.563.104.77-.245.77-.544 0-.268-.01-.979-.016-1.922-3.13.68-3.79-1.508-3.79-1.508-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.078-.684.078-.684 1.13.08 1.726 1.16 1.726 1.16 1.004 1.72 2.634 1.223 3.276.935.101-.727.393-1.223.714-1.504-2.498-.284-5.124-1.249-5.124-5.559 0-1.228.438-2.233 1.157-3.02-.116-.284-.502-1.429.11-2.98 0 0 .943-.302 3.09 1.154a10.783 10.783 0 0 1 5.625 0c2.146-1.456 3.087-1.155 3.087-1.155.614 1.552.228 2.697.112 2.981.72.787 1.155 1.792 1.155 3.02 0 4.32-2.63 5.272-5.136 5.55.404.349.764 1.038.764 2.092 0 1.51-.014 2.728-.014 3.099 0 .302.203.654.777.543A11.252 11.252 0 0 0 12 .75Z" />
      </svg>
    ),
  },
];

function Home() {
  return (
    <div className="home-page">
      <div className="home-glow home-glow-one" />
      <div className="home-glow home-glow-two" />
      <div className="home-glow home-glow-three" />

      <div className="home-shell">
        <header className="home-header">
          <nav className="home-nav container">
            <a href="/" className="brand">
              <div className="brand-badge">AI</div>
              <div>
                <p className="brand-kicker">Workflow intelligence</p>
                <p className="brand-name">AI Content Ops</p>
              </div>
            </a>

            <div className="nav-links">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="nav-link">
                  {link.label}
                </a>
              ))}
            </div>

            <a href="/signup" className="button button-light button-nav">
              Get Started
            </a>
          </nav>
        </header>

        <main id="top">
          <section className="hero container section-grid">
            <div className="hero-copy">
              <div className="eyebrow-pill">
                <span className="eyebrow-dot" />
                AI pipeline for video-first teams
              </div>

              <h1 className="hero-title">
                Turn Meetings Into
                <span> Actionable Business Content</span>
              </h1>

              <p className="hero-subtitle">
                Upload meeting videos and instantly generate transcripts, summaries, tasks, and decisions using AI.
              </p>

              <div className="hero-actions">
                <a href="#demo" className="button button-primary">Try Now</a>
                <a href="#how-it-works" className="button button-secondary">Watch Demo</a>
              </div>

              <div className="stats-grid">
                {[
                  { value: "95%", label: "Task extraction accuracy" },
                  { value: "10x", label: "Faster documentation" },
                  { value: "24/7", label: "Always-on AI processing" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card stat-card">
                    <p className="stat-value">{stat.value}</p>
                    <p className="stat-label">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-panel-wrap">
              <div className="hero-panel-glow" />
              <div className="glass-card hero-panel">
                <div className="panel-head">
                  <div>
                    <p className="muted">Content pipeline</p>
                    <h2 style = {{paddingBottom: '1rem'}}>Meeting Intelligence</h2>
                  </div>
                  <span className="status-chip">Processing live</span>
                </div>

                <div className="panel-stack">
                  <div className="upload-box hero-upload-box">
                    <div>
                      <p className="card-title">Upload Meeting Video</p>
                      <p className="muted-small">Drag your MP4, Zoom, or Loom file here</p>
                    </div>
                    <button className="button button-primary button-small hero-upload-button">Upload</button>
                  </div>

                  <div className="panel-grid">
                    <div className="demo-card">
                      <div className="card-row">
                        <p className="card-title">Transcript Preview</p>
                        <span className="accent-note">12:34 min</span>
                      </div>
                      <div className="transcript-lines hero-transcript-lines">
                        <p className="soft-block hero-quote">"We should ship the onboarding workflow next Tuesday and assign QA by Friday."</p>
                        <p className="soft-block hero-quote">"Marketing needs the updated product brief and the launch summary before approval."</p>
                        <p className="soft-block hero-quote">"Decision: consolidate notes into one AI-generated handoff doc after every review."</p>
                      </div>
                    </div>

                    <div className="demo-card">
                      <p className="card-title">Tasks Extracted</p>
                      <div className="task-list">
                        {["Assign QA owner", "Send product brief", "Publish meeting summary"].map((task) => (
                          <div key={task} className="task-item">
                            <span className="task-dot" />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="container section-block">
            <div className="glass-card section-surface split-layout">
              <div>
                <p className="section-tag">The Problem</p>
                <h2 className="section-title">Valuable conversations disappear into disconnected tools.</h2>
                <div className="stack-list">
                  {problems.map((problem) => (
                    <div key={problem} className="problem-card">{problem}</div>
                  ))}
                </div>
              </div>

              <div className="demo-card center-panel">
                <p className="panel-kicker">What teams face today</p>
                <div className="flow-row">
                  {["Meetings", "Chats", "Docs", "Chaos"].map((item, index) => (
                    <React.Fragment key={item}>
                      <div className="flow-chip">{item}</div>
                      {index < 3 && <span className="flow-arrow">-&gt;</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="container section-block split-layout solution-layout">
            <div>
              <p className="section-tag section-tag-blue">Our Solution</p>
              <h2 className="section-title">Transform every meeting into searchable insight and next-step clarity.</h2>
              <p className="section-copy">
                AI Content Ops turns raw conversation into structured assets your team can review, share, and act on instantly.
              </p>
            </div>

            <div className="glass-card solution-flow">
              <div className="solution-grid">
                {["Video", "Transcript", "Insights", "Actionable Content"].map((item, index) => (
                  <React.Fragment key={item}>
                    <div className="flow-chip flow-chip-dark">{item}</div>
                    {index < 3 && <div className="flow-arrow flow-arrow-blue">-&gt;</div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          <section id="features" className="container section-block">
            <div className="section-heading center-text">
              <p className="section-tag">Features</p>
              <h2 className="section-title">Everything needed to convert unstructured conversation into business-ready output.</h2>
            </div>

            <div className="features-grid">
              {features.map((feature) => (
                <div key={feature.title} className="glass-card feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="how-it-works" className="container section-block">
            <div className="how-card">
              <div className="section-heading center-text">
                <p className="section-tag section-tag-blue">How It Works</p>
                <h2 className="section-title">Three simple steps from raw video to clear action.</h2>
              </div>

              <div className="steps-grid">
                {[
                  { step: "01", title: "Upload Video", description: "Add meeting recordings from your workflow in one click." },
                  { step: "02", title: "AI Processes", description: "Transcription, summaries, and extraction run automatically." },
                  { step: "03", title: "Get Results", description: "Receive documents, tasks, and decisions your team can use immediately." },
                ].map((item) => (
                  <div key={item.step} className="demo-card step-card">
                    <span className="step-number">{item.step}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="demo" className="container section-block split-layout demo-layout">
            <div>
              <p className="section-tag">Demo</p>
              <h2 className="section-title">A streamlined workspace for transcripts, summaries, and follow-up execution.</h2>
              <p className="section-copy">
                Designed for operations, product, and leadership teams that need clean output from every recorded conversation.
              </p>
            </div>

            <div className="glass-card workspace-card">
              <div className="workspace-head">
                <div>
                  <p className="muted">Workspace</p>
                  <h3>Weekly Leadership Sync</h3>
                </div>
                <button className="button button-primary button-small">Upload File</button>
              </div>

              <div className="workspace-grid">
                <div className="demo-card">
                  <p className="card-title">Transcript Output</p>
                  <div className="transcript-lines transcript-lines-tight">
                    <div className="soft-block"><span className="accent-note">00:02</span> The team aligned on finalizing onboarding messaging before launch.</div>
                    <div className="soft-block"><span className="accent-note">08:19</span> Finance approved the revised budget assuming rollout remains in Q2.</div>
                    <div className="soft-block"><span className="accent-note">14:44</span> Product requested a customer-facing summary and an internal decision log.</div>
                  </div>
                </div>

                <div className="workspace-side">
                  <div className="demo-card">
                    <p className="card-title">Extracted Tasks</p>
                    <div className="stack-list compact-stack">
                      {["Finalize onboarding copy by Tuesday", "Share budget memo with leadership", "Generate summary doc for launch team"].map((task) => (
                        <div key={task} className="soft-block">{task}</div>
                      ))}
                    </div>
                  </div>

                  <div className="demo-card">
                    <p className="card-title">AI Summary</p>
                    <p className="summary-copy">
                      Leadership approved the updated onboarding direction, aligned budget expectations, and requested a combined launch summary plus decision tracker.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="container section-block">
            <div className="section-heading center-text">
              <p className="section-tag section-tag-blue">Use Cases</p>
              <h2 className="section-title">Built for every team that relies on recorded conversations.</h2>
            </div>

            <div className="use-cases-grid">
              {useCases.map((item) => (
                <div key={item.title} className="glass-card use-case-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="pricing" className="container section-block">
            <div className="section-heading center-text">
              <p className="section-tag">Pricing</p>
              <h2 className="section-title">Flexible plans from solo workflows to enterprise operations.</h2>
            </div>

            <div className="pricing-grid">
              {pricingPlans.map((plan) => (
                <div key={plan.name} className={`price-card ${plan.featured ? "price-card-featured" : "glass-card"}`}>
                  <p className="price-name">{plan.name}</p>
                  <h3 className="price-value">{plan.price}</h3>
                  <p className="price-copy">{plan.description}</p>
                  <div className="stack-list compact-stack">
                    {plan.features.map((feature) => (
                      <div key={feature} className="soft-block">{feature}</div>
                    ))}
                  </div>
                  <button className={`button price-button ${plan.featured ? "button-primary" : "button-secondary"}`}>
                    Choose {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="container section-block">
            <div className="cta-banner">
              <div>
                <p className="panel-kicker cta-kicker">Start Today</p>
                <h2 className="section-title">Start Transcribing for Free Today</h2>
                <p className="section-copy">
                  Replace manual note-taking with AI-generated transcripts, summaries, decisions, and tasks from every meeting.
                </p>
              </div>
              <a href="/signup" className="button button-light">Get Started</a>
            </div>
          </section>
        </main>

        <footer id="contact" className="home-footer">
          <div className="container footer-inner">
            <div>
              <p className="footer-brand">AI Content Ops</p>
              <p className="footer-copy">
                AI-powered meeting intelligence for transcripts, summaries, decisions, and next steps.
              </p>
            </div>

            <div className="footer-links">
              <a href="/">About</a>
              <a href="/">Contact</a>
              <a href="/">Privacy</a>
            </div>

            <div className="social-links">
              {socialIcons.map((item) => (
                <a key={item.label} href="/" aria-label={item.label} className="social-link">
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;





