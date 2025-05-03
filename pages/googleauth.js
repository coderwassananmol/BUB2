import Header from "../components/Header";
import React, { useState } from "react";
const GoogleAuth = () => {
  const CLIENT_ID =
    "267327767504-fbtmbl5kkf8m9bjahlv3umu4q74as560.apps.googleusercontent.com"; // Replace with your client ID
  const SCOPES = "https://www.googleapis.com/auth/adwords";

  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null,
  });

  const handleGoogleLogin = () => {
    // Create the authorization URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      window.location.origin
    )}&response_type=token&scope=${encodeURIComponent(
      SCOPES
    )}&include_granted_scopes=true`;

    // Open a popup for Google Login
    const authWindow = window.open(
      authUrl,
      "google-auth",
      "width=500,height=600"
    );

    // Listen for the authentication response
    const pollTimer = setInterval(() => {
      try {
        if (authWindow.closed) {
          clearInterval(pollTimer);
        }

        // Check for URL containing tokens
        const urlParams = new URLSearchParams(
          authWindow.location.hash.replace("#", "?")
        );
        console.log(urlParams, "::urlParams");
        if (urlParams.has("access_token")) {
          const accessToken = urlParams.get("access_token");
          // Refresh tokens aren't returned in implicit grant flow; use the code flow for a backend server
          setTokens({ accessToken, refreshToken: null });
          authWindow.close();
        }
      } catch (e) {
        // Security constraints: cannot access cross-origin data until redirected to same origin
      }
    }, 500);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Google OAuth2 Authentication</h1>
      <button
        onClick={handleGoogleLogin}
        style={{ padding: "0.5rem 1rem", fontSize: "16px" }}
      >
        Connect Google Account
      </button>

      {tokens.accessToken && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Tokens Received</h2>
          <p>
            <strong>Access Token:</strong> {tokens.accessToken}
          </p>
          <p>
            <strong>Refresh Token:</strong> (Not available in client-side flow)
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;
