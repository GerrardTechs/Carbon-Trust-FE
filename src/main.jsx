import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import RootApp from "./app/RootApp.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
