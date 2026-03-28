import React, { useState } from "react";
import "./SignIn.css";

const API_BASE_URL = "http://localhost:5000/api/auth";

function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to sign in.");
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      window.history.pushState({}, '', '/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-glow signin-glow-one" />
      <div className="signin-glow signin-glow-two" />

      <div className="signin-shell">
        <section className="signin-brand-panel">
          <a href="/" className="signin-brand">
            <div className="signin-brand-badge">AI</div>
            <div>
              <p className="signin-brand-kicker">Workflow intelligence</p>
              <h1>AI Content Ops</h1>
            </div>
          </a>

          <div className="signin-copy-block">
            <p className="signin-tag">Welcome Back</p>
            <h2>Sign in to continue turning meetings into action.</h2>
            <p>
              Access transcripts, summaries, decisions, and task extraction from one secure AI workspace.
            </p>
          </div>

          <div className="signin-feature-list">
            {[
              "Centralized transcript history",
              "Instant task and decision extraction",
              "Shareable AI-generated meeting docs",
            ].map((item) => (
              <div key={item} className="signin-feature-item">
                <span className="signin-feature-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="signin-form-panel">
          <div className="signin-form-card">
            <div className="signin-form-head">
              <p className="signin-mini-tag">Sign In</p>
              <h3>Welcome back</h3>
              <p>Use your account to manage uploads, outputs, and AI-generated content.</p>
            </div>

            <form className="signin-form" onSubmit={handleSubmit}>
              <label className="signin-field">
                <span>Email address</span>
                <input name="email" type="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} />
              </label>

              <label className="signin-field">
                <span>Password</span>
                <input name="password" type="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} />
              </label>

              <div className="signin-row">
                <label className="signin-checkbox">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="/signin">Forgot password?</a>
              </div>

              {error ? <p className="signin-status signin-status-error">{error}</p> : null}

              <button type="submit" className="signin-button-primary" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <div className="signin-divider">
                <span>or continue with</span>
              </div>

              <div className="signin-social-grid">
                <button type="button" className="signin-social-button">Google</button>
                <button type="button" className="signin-social-button">GitHub</button>
              </div>
            </form>

            <p className="signin-footer-text">
              Don&apos;t have an account? <a href="/signup">Create one</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SignIn;


