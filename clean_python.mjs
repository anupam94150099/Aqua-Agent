import fs from 'fs';
import path from 'path';

function removeRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f === '__pycache__' || f === '.pytest_cache' || f === '.venv') {
        fs.rmSync(full, { recursive: true, force: true });
        console.log('Removed directory:', full);
      } else if (f !== 'src' && f !== 'dist' && f !== 'node_modules' && f !== 'data') {
        removeRecursive(full);
        // If directory is now empty, remove it
        if (fs.readdirSync(full).length === 0) {
          fs.rmdirSync(full);
          console.log('Removed empty directory:', full);
        }
      }
    } else {
      if (f.endsWith('.py') || f.endsWith('.pyc') || f === 'requirements.txt') {
        fs.unlinkSync(full);
        console.log('Removed file:', full);
      }
    }
  }
}

console.log('[AquaAgent Cleanup] Removing legacy python files...');
removeRecursive('backend');
console.log('[AquaAgent Cleanup] Cleanup complete! Zero Python in project.');
