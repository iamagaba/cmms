import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./App.css"; // Imports Tailwind and global styles
import "./styles/industrial-theme.css"; // Industrial theme variables
import 'mapbox-gl/dist/mapbox-gl.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone to Kampala
dayjs.tz.setDefault('Africa/Kampala');

import React from 'react';

// Simple Global Error Boundary
class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("Global Error Boundary caught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ color: '#ef4444' }}>Application Crashed</h1>
                    <p>A critical error occurred preventing the application from starting.</p>
                    <pre style={{
                        backgroundColor: '#f3f4f6',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        overflow: 'auto',
                        fontSize: '12px',
                        border: '1px solid #e5e7eb'
                    }}>
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

createRoot(document.getElementById("root")!).render(
    <GlobalErrorBoundary>
        <App />
    </GlobalErrorBoundary>
);
