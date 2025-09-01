import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "antd/dist/reset.css";
import "leaflet/dist/leaflet.css";
import "./App.css";

createRoot(document.getElementById("root")!).render(<App />);