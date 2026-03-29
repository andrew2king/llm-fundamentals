const fs = require('fs');
const path = require('path');

// 复制 public/data 到 dist/data
const srcDir = path.join(__dirname, 'public', 'data');
const destDir = path.join(__dirname, 'dist', 'data');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

if (fs.existsSync(srcDir)) {
  copyDir(srcDir, destDir);
  console.log('Data files copied successfully!');
} else {
  console.log('Source directory not found:', srcDir);
}
