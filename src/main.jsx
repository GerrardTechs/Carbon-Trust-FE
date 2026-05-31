import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import RootApp from "./app/RootApp.jsx";
import { ErrorBoundary } from "./auth/components/error";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary label="Aplikasi CarbonTrust">
      <RootApp />
    </ErrorBoundary>
  </React.StrictMode>
);
