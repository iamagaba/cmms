"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME: { color: COLORS } }
const COLORS = {
  light: {
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    card: "hsl(var(--card))",
    "card-foreground": "hsl(var(--card-foreground))",
    popover: "hsl(var(--popover))",
    "popover-foreground": "hsl(var(--popover-foreground))",
    primary: "hsl(var(--primary))",
    "primary-foreground": "hsl(var(--primary-foreground))",
    secondary: "hsl(var(--secondary))",
    "secondary-foreground": "hsl(var(--secondary-foreground))",
    muted: "hsl(var(--muted))",
    "muted-foreground": "hsl(var(--muted-foreground))",
    accent: "hsl(var(--accent))",
    "accent-foreground": "hsl(var(--accent-foreground))",
    destructive: "hsl(var(--destructive))",
    "destructive-foreground": "hsl(var(--destructive-foreground))",
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    grid: "hsl(var(--border))",
  },
  dark: {
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    card: "hsl(var(--card))",
    "card-foreground": "hsl(var(--card-foreground))",
    popover: "hsl(var(--popover))",
    "popover-foreground": "hsl(var(--popover-foreground))",
    primary: "hsl(var(--primary))",
    "primary-foreground": "hsl(var(--primary-foreground))",
    secondary: "hsl(var(--secondary))",
    "secondary-foreground": "hsl(var(--secondary-foreground))",
    muted: "hsl(var(--muted))",
    "muted-foreground": "hsl(var(--muted-foreground))",
    accent: "hsl(var(--accent))",
    "accent-foreground": "hsl(var(--accent-foreground))",
    destructive: "hsl(var(--destructive))",
    "destructive-foreground": "hsl(var(--destructive-foreground))",
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    grid: "hsl(var(--border))",
  },
} as const;

type ChartConfig = {
  [k: string]: {
    label?: string;
    color?: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
};

type ChartContextProps = {
  config: ChartConfig;
  theme: keyof typeof COLORS;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <Chart />");
  }

  return context;
}

type ChartProps = {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  theme?: keyof typeof COLORS; // Allow theme to be passed as a prop
} & React.ComponentProps<"div">;

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ config, className, children, theme = "light", ...props }, ref) => { // Default theme to "light"
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const activeConfig = React.useMemo(
      () => getActiveConfig(config, theme), // Use theme prop
      [config, theme],
    );

    if (!mounted) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col",
          className,
        )}
        {...props}
      >
        <ChartContext.Provider value={{ config, theme }}>
          <RechartsPrimitive.ResponsiveContainer {...props}>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        </ChartContext.Provider>
      </div>
    );
  },
);
Chart.displayName = "Chart";

function getActiveConfig(config: ChartConfig, theme: keyof typeof COLORS) {
  return Object.entries(config).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        ...value,
        color: COLORS[theme][value.color as keyof typeof COLORS["light"]] || value.color,
      },
    };
  }, {});
}

export { Chart, useChart };