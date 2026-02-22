import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // So we can iterate towards stricter typing without blocking builds
      "@typescript-eslint/no-explicit-any": "off",
      // Keep as a warning to surface issues without failing CI
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Allow sharing constants within files that also export components
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // Prevent re-introducing the legacy Tailwind component layer (use `src/components/tailwind-components/*` instead)
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/components/tailwind-components-legacy",
              message: "Do not import legacy Tailwind components. Use `@/components/tailwind-components` (folder) or shadcn/ui components instead."
            },
            {
              name: "@/components/tailwind-components-legacy.tsx",
              message: "Do not import legacy Tailwind components. Use `@/components/tailwind-components` (folder) or shadcn/ui components instead."
            },
            {
              name: "./tailwind-components-legacy",
              message: "Do not import legacy Tailwind components. Use `@/components/tailwind-components` (folder) or shadcn/ui components instead."
            },
            {
              name: "../tailwind-components-legacy",
              message: "Do not import legacy Tailwind components. Use `@/components/tailwind-components` (folder) or shadcn/ui components instead."
            }
          ]
        }
      ],
      
      // Design System Compliance Rules (Phase 1)
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\bbg-white\\b/]",
          message: "Use semantic token 'bg-card' or 'bg-background' instead of 'bg-white'"
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\btext-gray-[0-9]/]",
          message: "Use semantic tokens like 'text-foreground' or 'text-muted-foreground' instead of 'text-gray-*'"
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\bbg-gray-[0-9]/]",
          message: "Use semantic tokens like 'bg-muted', 'bg-card', or 'bg-accent' instead of 'bg-gray-*'"
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\bbg-emerald-/]",
          message: "Use semantic token 'bg-success' instead of 'bg-emerald-*'"
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\bbg-red-/]",
          message: "Use semantic token 'bg-destructive' instead of 'bg-red-*'"
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\bbg-amber-/]",
          message: "Use semantic token 'bg-warning' instead of 'bg-amber-*'"
        }
      ]
    },
  },
);
