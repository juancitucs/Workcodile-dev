#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando proyecto WorkCodile...');

// Directorios a eliminar
const dirsToRemove = [
  'supabase',
  'utils/supabase',
  'npmignore',
  'node_modules'
];

// Archivos a eliminar
const filesToRemove = [
  'package-lock.json'
];

// Función para eliminar directorios recursivamente
function rmDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Eliminado: ${dirPath}`);
  }
}

// Función para eliminar archivos
function rmFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Eliminado: ${filePath}`);
  }
}

// Eliminar directorios problemáticos
dirsToRemove.forEach(rmDir);

// Eliminar archivos problemáticos
filesToRemove.forEach(rmFile);

// Copiar archivos limpios
if (fs.existsSync('package-clean.json')) {
  fs.copyFileSync('package-clean.json', 'package.json');
  console.log('✅ Copiado: package-clean.json → package.json');
}

if (fs.existsSync('tsconfig-clean.json')) {
  fs.copyFileSync('tsconfig-clean.json', 'tsconfig.json');
  console.log('✅ Copiado: tsconfig-clean.json → tsconfig.json');
}

if (fs.existsSync('gitignore-clean')) {
  fs.copyFileSync('gitignore-clean', '.gitignore');
  console.log('✅ Copiado: gitignore-clean → .gitignore');
}

console.log('');
console.log('🎉 ¡Limpieza completada!');
console.log('');
console.log('💡 Ahora ejecuta:');
console.log('   npm install');
console.log('   npm run dev');
console.log('');