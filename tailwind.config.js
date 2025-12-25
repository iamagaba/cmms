/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // Subframe GOGO Maintenance Hub typography
            fontFamily: {
                sans: ['Geist', 'system-ui', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
                mono: ['Geist Mono', 'Consolas', 'monospace'],
            },
            // Subframe theme colors, mapped onto existing semantic names
            colors: {
                // Primary / brand palette (was steel/indigo)
                primary: {
                    DEFAULT: "rgb(147, 51, 234)", // brand-primary
                    50: "rgb(250, 245, 255)",
                    100: "rgb(243, 232, 255)",
                    200: "rgb(233, 213, 255)",
                    300: "rgb(216, 180, 254)",
                    400: "rgb(192, 132, 252)",
                    500: "rgb(168, 85, 247)",
                    600: "rgb(147, 51, 234)",
                    700: "rgb(126, 34, 206)",
                    800: "rgb(107, 33, 168)",
                    900: "rgb(88, 28, 135)",
                },
                // Keep brand and steel aliases in sync with Subframe brand palette
                brand: {
                    50: "rgb(250, 245, 255)",
                    100: "rgb(243, 232, 255)",
                    200: "rgb(233, 213, 255)",
                    300: "rgb(216, 180, 254)",
                    400: "rgb(192, 132, 252)",
                    500: "rgb(168, 85, 247)",
                    600: "rgb(147, 51, 234)",
                    700: "rgb(126, 34, 206)",
                    800: "rgb(107, 33, 168)",
                    900: "rgb(88, 28, 135)",
                },
                steel: {
                    50: "rgb(250, 245, 255)",
                    100: "rgb(243, 232, 255)",
                    200: "rgb(233, 213, 255)",
                    300: "rgb(216, 180, 254)",
                    400: "rgb(192, 132, 252)",
                    500: "rgb(168, 85, 247)",
                    600: "rgb(147, 51, 234)",
                    700: "rgb(126, 34, 206)",
                    800: "rgb(107, 33, 168)",
                    900: "rgb(88, 28, 135)",
                },
                // Neutral / machinery palette
                machinery: {
                    0: "rgb(255, 255, 255)",
                    50: "rgb(250, 250, 250)",
                    100: "rgb(245, 245, 245)",
                    200: "rgb(229, 229, 229)",
                    300: "rgb(212, 212, 212)",
                    400: "rgb(163, 163, 163)",
                    500: "rgb(115, 115, 115)",
                    600: "rgb(82, 82, 82)",
                    700: "rgb(64, 64, 64)",
                    800: "rgb(38, 38, 38)",
                    900: "rgb(23, 23, 23)",
                    950: "rgb(10, 10, 10)",
                },
                neutral: {
                    0: "rgb(255, 255, 255)",
                    50: "rgb(250, 250, 250)",
                    100: "rgb(245, 245, 245)",
                    200: "rgb(229, 229, 229)",
                    300: "rgb(212, 212, 212)",
                    400: "rgb(163, 163, 163)",
                    500: "rgb(115, 115, 115)",
                    600: "rgb(82, 82, 82)",
                    700: "rgb(64, 64, 64)",
                    800: "rgb(38, 38, 38)",
                    900: "rgb(23, 23, 23)",
                    950: "rgb(10, 10, 10)",
                },
                // Semantic color scales from Subframe theme
                error: {
                    50: "rgb(254, 242, 242)",
                    100: "rgb(254, 226, 226)",
                    200: "rgb(254, 202, 202)",
                    300: "rgb(252, 165, 165)",
                    400: "rgb(248, 113, 113)",
                    500: "rgb(239, 68, 68)",
                    600: "rgb(220, 38, 38)",
                    700: "rgb(185, 28, 28)",
                    800: "rgb(153, 27, 27)",
                    900: "rgb(127, 29, 29)",
                },
                warning: {
                    50: "rgb(254, 252, 232)",
                    100: "rgb(254, 249, 195)",
                    200: "rgb(254, 240, 138)",
                    300: "rgb(253, 224, 71)",
                    400: "rgb(250, 204, 21)",
                    500: "rgb(234, 179, 8)",
                    600: "rgb(202, 138, 4)",
                    700: "rgb(161, 98, 7)",
                    800: "rgb(133, 77, 14)",
                    900: "rgb(113, 63, 18)",
                },
                success: {
                    50: "rgb(240, 253, 244)",
                    100: "rgb(220, 252, 231)",
                    200: "rgb(187, 247, 208)",
                    300: "rgb(134, 239, 172)",
                    400: "rgb(74, 222, 128)",
                    500: "rgb(34, 197, 94)",
                    600: "rgb(22, 163, 74)",
                    700: "rgb(21, 128, 61)",
                    800: "rgb(22, 101, 52)",
                    900: "rgb(20, 83, 45)",
                },
                // Industrial Green (alias for success - used in design-system.css)
                industrial: {
                    50: "#f0fdf4",
                    100: "#dcfce7",
                    200: "#bbf7d0",
                    300: "#86efac",
                    400: "#4ade80",
                    500: "#22c55e",
                    600: "#16a34a",
                    700: "#15803d",
                    800: "#166534",
                    900: "#14532d",
                    950: "#052e16",
                },
                // Maintenance Yellow (used in design-system.css)
                maintenance: {
                    50: "#fefce8",
                    100: "#fef9c3",
                    200: "#fef08a",
                    300: "#fde047",
                    400: "#facc15",
                    500: "#eab308",
                    600: "#ca8a04",
                    700: "#a16207",
                    800: "#854d0e",
                    900: "#713f12",
                    950: "#422006",
                },
                // Single-value aliases used in Subframe exports
                "brand-primary": "rgb(147, 51, 234)",
                "default-font": "rgb(23, 23, 23)",
                "subtext-color": "rgb(115, 115, 115)",
                "neutral-border": "rgb(229, 229, 229)",
                white: "rgb(255, 255, 255)",
                "default-background": "rgb(255, 255, 255)",
                // Surface colors mapped to neutrals
                surface: {
                    DEFAULT: "rgb(255, 255, 255)",
                    secondary: "rgb(250, 250, 250)",
                    tertiary: "rgb(245, 245, 245)",
                },
                // Legacy gray alias kept for compatibility
                gray: {
                    50: "rgb(250, 250, 250)",
                    100: "rgb(245, 245, 245)",
                    200: "rgb(229, 229, 229)",
                    300: "rgb(212, 212, 212)",
                    400: "rgb(163, 163, 163)",
                    500: "rgb(115, 115, 115)",
                    600: "rgb(82, 82, 82)",
                    700: "rgb(64, 64, 64)",
                    800: "rgb(38, 38, 38)",
                    900: "rgb(23, 23, 23)",
                    950: "rgb(10, 10, 10)",
                },
            },
            // Shadows / radii stay aligned with existing industrial feel
            boxShadow: {
                sm: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
                default: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
                md: "0px 4px 16px -2px rgba(0, 0, 0, 0.08), 0px 2px 4px -1px rgba(0, 0, 0, 0.08)",
                lg: "0px 12px 32px -4px rgba(0, 0, 0, 0.08), 0px 4px 8px -2px rgba(0, 0, 0, 0.08)",
                overlay:
                    "0px 12px 32px -4px rgba(0, 0, 0, 0.08), 0px 4px 8px -2px rgba(0, 0, 0, 0.08)",
            },
            borderRadius: {
                sm: "2px",
                md: "4px",
                DEFAULT: "4px",
                lg: "8px",
                full: "9999px",
                // Component helpers
                industrial: "8px",
                component: "6px",
            },
            animation: {
                "fade-in": "fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                "slide-up": "slideUp 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                "scale-in": "scaleIn 150ms cubic-bezier(0.4, 0, 0.2, 1)",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
            },
            // Subframe container padding helpers (optional but harmless)
            container: {
                padding: {
                    DEFAULT: "16px",
                    sm: "calc((100vw + 16px - 640px) / 2)",
                    md: "calc((100vw + 16px - 768px) / 2)",
                    lg: "calc((100vw + 16px - 1024px) / 2)",
                    xl: "calc((100vw + 16px - 1280px) / 2)",
                    "2xl": "calc((100vw + 16px - 1536px) / 2)",
                },
            },
            spacing: {
                112: "28rem",
                144: "36rem",
                192: "48rem",
                256: "64rem",
                320: "80rem",
            },
            screens: {
                mobile: {
                    max: "767px",
                },
            },
        },
    },
    plugins: [],
}
