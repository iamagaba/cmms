import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Bundle analyzer - only in analyze mode
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'react/jsx-runtime',
      'react-is',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
      '@radix-ui/react-separator',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
    ],
    exclude: [],
    // Force rebuild on changes
    force: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@mantine/core": path.resolve(__dirname, "./src/mocks/mantine-core.tsx"),
      "@mantine/hooks": path.resolve(__dirname, "./src/mocks/mantine-hooks.tsx"),
      "@mantine/notifications": path.resolve(__dirname, "./src/mocks/mantine-notifications.tsx"),
      "@mantine/dates": path.resolve(__dirname, "./src/mocks/mantine-dates.tsx"),
      "@mantine/form": path.resolve(__dirname, "./src/mocks/mantine-form.tsx"),
      "@mantine/charts": path.resolve(__dirname, "./src/mocks/mantine-charts.tsx"),
      "@mantine/dropzone": path.resolve(__dirname, "./src/mocks/mantine-dropzone.tsx"),
      "@mantine/spotlight": path.resolve(__dirname, "./src/mocks/mantine-spotlight.tsx"),
      "mantine-datatable": path.resolve(__dirname, "./src/mocks/mantine-datatable.tsx"),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react-is'],
  },
  build: {
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
        manualChunks: {
          // Single React chunk to avoid circular dependencies
          'vendor-react': [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react-is',
            'react-router-dom',
            'scheduler',
          ],
          // Radix UI components
          'vendor-radix': [
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-dialog',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-separator',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-avatar',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
          ],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js', '@supabase/auth-ui-react', '@supabase/auth-ui-shared'],
          // TanStack Query
          'vendor-query': ['@tanstack/react-query', '@tanstack/react-table'],
          // Maps
          'vendor-maps': ['mapbox-gl', 'leaflet', 'react-leaflet'],
          // Calendar
          'vendor-calendar': ['react-big-calendar', 'dayjs', 'date-fns', 'moment'],
          // Forms
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
    // Enable source maps for debugging
    sourcemap: mode === 'development',
  },
}));
