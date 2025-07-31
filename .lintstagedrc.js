module.exports = {
  // Aplicar a todos los archivos TypeScript/JavaScript
  '*.{js,jsx,ts,tsx}': [
    // Formatear con Prettier
    'prettier --write',
    // Ejecutar ESLint
    'eslint --fix',
    // Verificar tipos TypeScript
    'tsc --noEmit',
  ],
  // Aplicar a archivos de configuración
  '*.{json,md,yml,yaml}': ['prettier --write'],
  // Aplicar a archivos CSS
  '*.{css,scss}': ['prettier --write'],
};
