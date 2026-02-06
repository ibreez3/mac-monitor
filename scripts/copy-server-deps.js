const fs = require('fs');
const path = require('path');

// Copy server and its dependencies to a temporary location for packaging
const sourceDir = path.join(__dirname, '..', 'server');
const targetDir = path.join(__dirname, '..', 'server-bundle');

// Remove existing bundle
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}

// Create target directory
fs.mkdirSync(targetDir, { recursive: true });

// Copy server files
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(sourceDir, targetDir);

// Copy required dependencies
const dependencies = ['express', 'cors', 'socket.io', 'systeminformation'];
const rootPackageJson = require(path.join(__dirname, '..', 'package.json'));

// Create package.json for server bundle
const serverPackageJson = {
  name: 'mac-monitor-server',
  version: '1.0.0',
  type: 'module',
  dependencies: {}
};

for (const dep of dependencies) {
  const version = rootPackageJson.dependencies[dep];
  if (version) {
    serverPackageJson.dependencies[dep] = version;
    // Copy the module
    const srcModule = path.join(__dirname, '..', 'node_modules', dep);
    const destModule = path.join(targetDir, 'node_modules', dep);
    
    if (fs.existsSync(srcModule)) {
      console.log(`Copying ${dep}...`);
      copyDir(srcModule, destModule);
    }
  }
}

fs.writeFileSync(
  path.join(targetDir, 'package.json'),
  JSON.stringify(serverPackageJson, null, 2)
);

console.log('Server bundle created at:', targetDir);
