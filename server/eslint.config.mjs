import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs", // For Node.js environments
      globals: {
        ...globals.node, // This includes Node.js global variables like `process`
        process: "readonly", // Mark `process` as a global variable
      },
    },
  },
  pluginJs.configs.recommended, // Include recommended rules from eslint-plugin
];

