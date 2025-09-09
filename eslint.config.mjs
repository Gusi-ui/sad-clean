import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // ============================================================================
      // REGLAS ESTRICTAS PARA MANTENER CÓDIGO LIMPIO
      // ============================================================================

      // TypeScript específicas (con type information)
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-this-alias": "error",
      "@typescript-eslint/no-unnecessary-type-constraint": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-reduce-type-parameter": "error",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/require-array-sort-compare": "error",
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/restrict-template-expressions": "error",
      "@typescript-eslint/strict-boolean-expressions": "warn", // Cambiado a warning
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/unbound-method": "error",

      // React específicas
      "react/jsx-boolean-value": "error",
      "react/jsx-closing-bracket-location": "error",
      "react/jsx-closing-tag-location": "error",
      "react/jsx-curly-brace-presence": "error",
      "react/jsx-curly-spacing": "error",
      "react/jsx-equals-spacing": "error",
      "react/jsx-first-prop-new-line": "error",
      "react/jsx-indent": "off", // Conflicto con Prettier
      "react/jsx-indent-props": "off", // Conflicto con Prettier
      "react/jsx-key": "error",
      "react/jsx-max-props-per-line": "off", // Conflicto con Prettier
      "react/jsx-no-bind": ["error", { allowArrowFunctions: true }],
      "react/jsx-no-useless-fragment": "error",
      "react/jsx-pascal-case": "error",
      "react/jsx-props-no-multi-spaces": "error",
      "react/jsx-sort-props": "off", // Desactivado temporalmente - conflictos con Prettier
      "react/jsx-wrap-multilines": "error",

      // JavaScript generales
      "no-console": "warn",
      "no-debugger": "error",
      "no-alert": "error",
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-expressions": "error",
      "no-duplicate-imports": "error",
      "no-useless-return": "error",
      "no-useless-constructor": "error",
      "no-useless-rename": "error",
      "no-useless-concat": "error",
      "no-useless-computed-key": "error",
      "no-useless-escape": "error",
      "no-useless-call": "error",
      "no-useless-catch": "error",
      "no-negated-condition": "off", // Conflicto con validaciones comunes

      // Estilo y formato
      "prefer-template": "error",
      "template-curly-spacing": "error",
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "comma-dangle": "off", // Conflicto con Prettier
      "comma-spacing": "error",
      "comma-style": "error",
      "computed-property-spacing": "error",
      "func-call-spacing": "error",
      indent: "off", // Conflicto con Prettier
      "key-spacing": "error",
      "keyword-spacing": "error",
      "linebreak-style": ["error", "unix"],
      "max-len": "off", // Desactivado temporalmente - conflictos con Prettier
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      "no-trailing-spaces": "error",
      "object-property-newline": [
        "error",
        { allowAllPropertiesOnSameLine: true },
      ],
      "operator-linebreak": "off", // Conflicto con Prettier
      "padded-blocks": ["error", "never"],
      quotes: ["error", "single", { avoidEscape: true }],
      semi: ["error", "always"],
      "space-before-blocks": "error",
      "space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "space-in-parens": ["error", "never"],
      "space-infix-ops": "error",
      "space-unary-ops": "error",
      "spaced-comment": ["error", "always"],

      // Imports - Configuración compatible con Prettier
      "import/order": "off", // Desactivado para evitar conflictos con Prettier
      "import/no-duplicates": "error",
      "import/no-unresolved": "error",
      "import/no-cycle": "error",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      "import/no-relative-parent-imports": "off", // Desactivado para Next.js App Router

      // Variables
      "no-unused-vars": "off", // Desactivado en favor de @typescript-eslint/no-unused-vars
      "no-undef": "error",
      "no-use-before-define": "error",
      "no-shadow": "error",
      "no-redeclare": "error",

      // Funciones
      "func-style": "off", // Desactivado para permitir tanto function declarations como arrow functions
      "prefer-arrow-callback": "error",
      "arrow-spacing": "error",
      "no-confusing-arrow": "error",
      "arrow-body-style": ["error", "as-needed"],
      "arrow-parens": ["error", "always"],

      // Objetos y arrays
      "object-shorthand": "error",
      "prefer-object-spread": "error",
      "array-callback-return": "error",
      "array-bracket-newline": ["error", "consistent"],
      "array-element-newline": ["error", "consistent"],

      // Strings
      "no-template-curly-in-string": "error",

      // Condicionales
      "no-else-return": "error",
      "no-ternary": "off", // Permitir ternarios para casos simples

      // Loops
      "no-constant-condition": "error",
      "no-unreachable-loop": "error",

      // Otros
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-sequences": "error",
      "no-throw-literal": "error",
      "no-unmodified-loop-condition": "error",
      "no-unreachable": "error",
      "no-unsafe-finally": "error",
      "no-unsafe-negation": "error",
      "no-unsafe-optional-chaining": "error",
      "no-useless-assignment": "error",
      "no-useless-backreference": "error",
      "no-void": "off", // Desactivado para permitir void en useEffect
      "no-warning-comments": "warn",
      "prefer-promise-reject-errors": "error",
      "require-await": "off", // Desactivado para permitir async functions sin await cuando sea necesario

      // Reglas específicas para Next.js
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "error",
      "@next/next/no-sync-scripts": "error",
      "@next/next/no-unwanted-polyfillio": "error",
    },
  },
  {
    // Configuración específica para archivos de configuración
    files: ["*.config.js", "*.config.ts", "*.config.mjs"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "import/no-commonjs": "off",
    },
  },
  {
    // Configuración específica para archivos de tipos
    files: ["**/*.d.ts", "**/*.types.ts"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
