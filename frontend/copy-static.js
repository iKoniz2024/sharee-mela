const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function findServerJsDirs(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile() && entry.name === 'server.js') {
      results.push(dir);
    } else if (entry.isDirectory() && entry.name !== 'node_modules') {
      results.push(...findServerJsDirs(fullPath));
    }
  }
  return results;
}

try {
  const standalonePath = path.join(__dirname, '.next', 'standalone');
  if (fs.existsSync(standalonePath)) {
    console.log('Searching for server.js location in standalone build...');
    
    // Copy to root standalone directory
    copyDir(path.join(__dirname, 'public'), path.join(standalonePath, 'public'));
    copyDir(path.join(__dirname, '.next', 'static'), path.join(standalonePath, '.next', 'static'));

    // Find subdirectories containing server.js (e.g. .next/standalone/sharee-mela)
    const serverDirs = findServerJsDirs(standalonePath);
    serverDirs.forEach((serverDir) => {
      if (serverDir !== standalonePath) {
        console.log(`Copying static assets beside server.js in: ${serverDir}`);
        copyDir(path.join(__dirname, 'public'), path.join(serverDir, 'public'));
        copyDir(path.join(__dirname, '.next', 'static'), path.join(serverDir, '.next', 'static'));
      }
    });

    console.log('Static assets copied successfully to all target standalone locations!');
  } else {
    console.log('Skipping static copy: standalone build output not active.');
  }
} catch (err) {
  console.error('Error copying static assets:', err);
}
