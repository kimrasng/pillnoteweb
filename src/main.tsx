import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LocaleProvider } from "./LocaleProvider";
import "./styles.css";
import "./design-system.css";
import "./landing.css";
import "./reference.css";

if (import.meta.env.DEV) {
  import("react-grab");
}

// Static hash destinations are restored after React renders them. Browser pixel
// restoration could otherwise overwrite the anchor after a language change.
history.scrollRestoration = window.location.hash ? "manual" : "auto";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </React.StrictMode>,
);
