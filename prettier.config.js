module.exports = {
  // ============================================================================
  // CONFIGURACIÓN DE PRETTIER
  // ============================================================================

  // Punto y coma al final
  semi: true,

  // Coma final en objetos y arrays multilínea
  trailingComma: 'es5',

  // Comillas simples
  singleQuote: true,

  // Ancho máximo de línea
  printWidth: 80,

  // Indentación con espacios
  tabWidth: 2,
  useTabs: false,

  // Comillas en JSX
  jsxSingleQuote: true,

  // Espaciado en llaves de objetos
  bracketSpacing: true,

  // Espaciado en JSX
  bracketSameLine: false,

  // Espaciado en arrow functions
  arrowParens: 'always',

  // Final de línea
  endOfLine: 'lf',

  // Ordenar imports
  importOrder: ['^react$', '^next(.*)$', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,

  // Plugins
  plugins: [
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports',
  ],

  // Configuración específica para archivos
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 100,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.{yml,yaml}',
      options: {
        singleQuote: false,
      },
    },
  ],
};
