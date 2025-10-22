import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import Camera from "@/Camera";
import "./styles/globals.css";
import { TauriEventProvider } from "./context/tauri-event-context";

const params = new URLSearchParams(window.location.search);
const isCameraWindow = params.get("action") === "camera";
document.addEventListener("contextmenu", (e) => e.preventDefault());
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {isCameraWindow ? (
      <Camera />
    ) : (
      <TauriEventProvider<string> event={"data"}>
        <App />
      </TauriEventProvider>
    )}
  </React.StrictMode>,
);
