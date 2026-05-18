// ============================================================
// GigFlow Frontend — Entry Point
// React 18 createRoot with StrictMode.
// ============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement: HTMLElement | null = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element with id 'root' not found in the DOM.");
}

const root: ReactDOM.Root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
