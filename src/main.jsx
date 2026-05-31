import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import RootApp from "./app/RootApp.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";           // ← tambah
import { ErrorBoundary } from "./components/error/index.js"; // ← tambah

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary label="Aplikasi CarbonTrust">            {/* ← wrap */}
      <RootApp />
    </ErrorBoundary>
  </React.StrictMode>
);