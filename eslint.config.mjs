import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/naming-convention": [
        "warn",
        // Variables (only camelCase)
        {
          selector: "variable",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        // Exported constants (only UPPER_SNAKE_CASE)
        {
          selector: "variable",
          modifiers: ["const", "exported"],
          format: ["UPPER_SNAKE_CASE"],
        },
        // Functions (only camelCase)
        {
          selector: "function",
          format: ["camelCase"],
        },
        // Classes and Interfaces (only PascalCase)
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        // Type parameters (only PascalCase)
        {
          selector: "typeParameter",
          format: ["PascalCase"],
        },
        // Parameters (only camelCase)
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        // Class members (only camelCase)
        {
          selector: "classProperty",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "classMethod",
          format: ["camelCase"],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
