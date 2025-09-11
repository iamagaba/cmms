import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./App.css";
import 'mapbox-gl/dist/mapbox-gl.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; // Import the plugin

dayjs.extend(relativeTime); // Extend dayjs with the plugin

createRoot(document.getElementById("root")!).render(<App />);