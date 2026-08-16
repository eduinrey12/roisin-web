const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((element) => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

try {
  const standaloneDir = path.join(process.cwd(), '.next', 'standalone');
  if (fs.existsSync(standaloneDir)) {
    console.log('Preparing Next.js standalone folder for Hostinger deployment...');

    // Copy public
    const publicSrc = path.join(process.cwd(), 'public');
    const publicDest = path.join(standaloneDir, 'public');
    copyFolderSync(publicSrc, publicDest);

    // Copy .next/static
    const staticSrc = path.join(process.cwd(), '.next', 'static');
    const staticDest = path.join(standaloneDir, '.next', 'static');
    copyFolderSync(staticSrc, staticDest);

    console.log('✅ Standalone package prepared with static assets and public directory!');
  }
} catch (err) {
  console.warn('Warning during prepare-standalone:', err.message);
}
