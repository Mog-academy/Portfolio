import React, { useState, useEffect } from "react";

const CORRECT_PASSWORD = "TUiSM5451!";

export default function PasswordProtect({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already authenticated in this session
    const auth = sessionStorage.getItem("editor_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("editor_auth", "true");
      setError("");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="password-protect">
      <div className="password-box">
        <h2>Password Required</h2>
        <p>Please enter the password to access the editor.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="password-input"
            autoFocus
          />
          <button type="submit" className="password-submit">
            Access Editor
          </button>
          {error && <p className="password-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
