import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Spread existing configs
  ...nextVitals,
  ...nextTs,

  // Global Ignores (must be its own object in the array)
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // Custom Rules Object
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
]);

export default eslintConfig;
