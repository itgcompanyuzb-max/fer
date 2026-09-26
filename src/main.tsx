import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthCallback } from "./components/auth/AuthCallback.tsx";
import "./index.css";

const isAuthCallback =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/auth/callback");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAuthCallback ? <AuthCallback /> : <App />}
  </StrictMode>
);

