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
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
} & React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>;

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
} & React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>;

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ config, className, children, ...props }, ref) => {
    const [mounted, setMounted] = React.useState(false);
    const { theme: mode } = useChart(); // This line will be fixed by the context provider below

    React.useEffect(() => {
      setMounted(true);
    }, []);

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
        <ChartContext.Provider value={{ config, ...props }}>
          <RechartsPrimitive.ResponsiveContainer {...props}>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        </ChartContext.Provider>
      </div>
    );
  },
);
Chart.displayName = "Chart";

export { Chart, useChart };