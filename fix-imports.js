import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

// Add .js extension to all local imports in compiled JS files
async function fixImports(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      await fixImports(fullPath);
    } else if (entry.name.endsWith('.js')) {
      let content = await readFile(fullPath, 'utf8');
      
      // Find and fix import statements
      content = content.replace(
        /import\s+(?:(?:\{[^}]*\})|(?:[^{}\s,]+))?\s*(?:,\s*(?:(?:\{[^}]*\})|(?:[^{}\s,]+)))?\s*from\s+['"]([^'"./][^'"]*|\.{1,2}\/[^'"]*)['"]/g,
        (match, importPath) => {
          // Only modify relative imports that don't have extensions
          if ((importPath.startsWith('./') || importPath.startsWith('../')) && 
              !importPath.endsWith('.js') && 
              !importPath.includes('.js?') && 
              !importPath.includes('.js#')) {
            return match.replace(importPath, `${importPath}.js`);
          }
          return match;
        }
      );
      
      await writeFile(fullPath, content);
    }
  }
}

// Start processing from the dist directory
await fixImports('./dist');
console.log('Fixed import extensions in compiled files');
