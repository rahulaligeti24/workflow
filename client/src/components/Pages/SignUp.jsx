import React, { useState } from "react";
import "./SignUp.css";

const API_BASE_URL = "http://localhost:5000/api/auth";

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    team: "",
    agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.agreed) {
      setError("Please accept the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          team: formData.team,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create account.");
      }

      setSuccess("Account created successfully. Redirecting to sign in...");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        team: "",
        agreed: false,
      });

      setTimeout(() => {
        window.history.pushState({}, '', '/signin');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 1200);
    } catch (requestError) {
      setError(requestError.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-glow signup-glow-one" />
      <div className="signup-glow signup-glow-two" />

      <div className="signup-shell">
        <section className="signup-brand-panel">
          <a href="/" className="signup-brand">
            <div className="signup-brand-badge">AI</div>
            <div>
              <p className="signup-brand-kicker">Workflow intelligence</p>
              <h1>AI Content Ops</h1>
            </div>
          </a>

          <div className="signup-copy-block">
            <p className="signup-tag">Get Started</p>
            <h2>Create your workspace for smarter meeting intelligence.</h2>
            <p>
              Upload videos, generate transcripts, extract tasks, and produce polished meeting docs with AI from day one.
            </p>
          </div>

          <div className="signup-stats-grid">
            <div className="signup-stat-card">
              <strong>10x</strong>
              <span>Faster documentation</span>
            </div>
            <div className="signup-stat-card">
              <strong>95%</strong>
              <span>Task extraction accuracy</span>
            </div>
          </div>
        </section>

        <section className="signup-form-panel">
          <div className="signup-form-card">
            <div className="signup-form-head">
              <p className="signup-mini-tag">Sign Up</p>
              <h3>Create your account</h3>
              <p>Set up your workspace and start converting meetings into actionable business content.</p>
            </div>

            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="signup-grid-two">
                <label className="signup-field">
                  <span>First name</span>
                  <input name="firstName" type="text" placeholder="Rahul" value={formData.firstName} onChange={handleChange} />
                </label>
                <label className="signup-field">
                  <span>Last name</span>
                  <input name="lastName" type="text" placeholder="Kumar" value={formData.lastName} onChange={handleChange} />
                </label>
              </div>

              <label className="signup-field">
                <span>Email address</span>
                <input name="email" type="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} />
              </label>

              <label className="signup-field">
                <span>Password</span>
                <input name="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleChange} />
              </label>

              <label className="signup-field">
                <span>Company or team</span>
                <input name="team" type="text" placeholder="AI Content Ops Team" value={formData.team} onChange={handleChange} />
              </label>

              <label className="signup-checkbox">
                <input name="agreed" type="checkbox" checked={formData.agreed} onChange={handleChange} />
                <span>I agree to the Terms and Privacy Policy</span>
              </label>

              {error ? <p className="signup-status signup-status-error">{error}</p> : null}
              {success ? <p className="signup-status signup-status-success">{success}</p> : null}

              <button type="submit" className="signup-button-primary" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="signup-footer-text">
              Already have an account? <a href="/signin">Sign in</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SignUp;


