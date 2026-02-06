const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess = null;
let mainWindow = null;

// Get the correct path for server files in production
function getServerPath() {
  // Try multiple possible paths for the packaged app
  const possiblePaths = [
    // When unpacked from asar
    path.join(process.resourcesPath, 'app.asar.unpacked', 'server', 'index.js'),
    path.join(app.getAppPath(), 'app.asar.unpacked', 'server', 'index.js'),
    // In development or normal asar
    path.join(__dirname, 'server', 'index.js'),
    path.join(process.resourcesPath, 'app', 'server', 'index.js'),
  ];
  
  for (const p of possiblePaths) {
    console.log('Checking path:', p);
    return p; // Return first path, spawn will error if it doesn't exist
  }
  
  return path.join(__dirname, 'server', 'index.js');
}

// Start the Node.js server
function startServer() {
  const serverPath = getServerPath();
  
  console.log('Starting server from:', serverPath);
  console.log('App path:', app.getAppPath());
  console.log('Resources path:', process.resourcesPath);
  
  serverProcess = spawn('node', [serverPath], {
    env: { ...process.env, NODE_ENV: 'production', PORT: '3001' },
    stdio: 'inherit',
    cwd: path.dirname(serverPath)
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });

  serverProcess.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
  });

  // Wait for server to start
  return new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    title: 'Mac Monitor'
  });

  // Load from HTTP server (server serves the static files)
  const startUrl = 'http://localhost:3001';
  
  console.log('Loading app from:', startUrl);

  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
  });

  // Open DevTools for debugging (remove in production)
  mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  await startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
