import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./App.css";
import 'mapbox-gl/dist/mapbox-gl.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; // Import the plugin
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime); // Extend dayjs with the plugin
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone to Kampala
dayjs.tz.setDefault('Africa/Kampala');

createRoot(document.getElementById("root")!).render(<App />);
