import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import si from 'systeminformation';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible paths for the client dist folder
  const clientDistPath = path.join(__dirname, '../client/dist');
  const appPathDist = path.join(__dirname, '../../client/dist');
  const resourcesPath = process.resourcesPath ? path.join(process.resourcesPath, 'client', 'dist') : null;

  // Use the first path that exists
  const fs = await import('fs');
  let staticPath = clientDistPath;

  if (fs.existsSync(clientDistPath)) {
    staticPath = clientDistPath;
  } else if (fs.existsSync(appPathDist)) {
    staticPath = appPathDist;
  } else if (resourcesPath && fs.existsSync(resourcesPath)) {
    staticPath = resourcesPath;
  }

  console.log('Serving static files from:', staticPath);
  app.use(express.static(staticPath));
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 缓存上一次的网络统计数据，用于计算速度
let lastNetworkStats = null;
let lastDiskStats = null;

// 采集系统信息
async function collectSystemInfo() {
  try {
    // 并行采集所有数据
    const [
      cpuLoad,
      cpuTemp,
      mem,
      osInfo,
      battery,
      diskLayout,
      fsSize,
      networkStats,
      networkInterfaces,
      gpu,
      processes,
      diskIO
    ] = await Promise.all([
      si.currentLoad(),
      si.cpuTemperature(),
      si.mem(),
      si.osInfo(),
      si.battery(),
      si.diskLayout(),
      si.fsSize(),
      si.networkStats(),
      si.networkInterfaces(),
      si.graphics(),
      si.processes(),
      si.disksIO() // 获取磁盘 I/O 统计
    ]);

    // 计算网络速度
    let networkSpeed = { rx_sec: 0, tx_sec: 0 };
    if (lastNetworkStats) {
      const lastRx = lastNetworkStats[0]?.rx_bytes || 0;
      const lastTx = lastNetworkStats[0]?.tx_bytes || 0;
      const currentRx = networkStats[0]?.rx_bytes || 0;
      const currentTx = networkStats[0]?.tx_bytes || 0;
      networkSpeed = {
        rx_sec: (currentRx - lastRx) / 1024, // KB/s
        tx_sec: (currentTx - lastTx) / 1024  // KB/s
      };
    }
    lastNetworkStats = networkStats;

    // 计算磁盘 I/O 速度
    let diskActivity = { read: 0, write: 0, rIO: 0, wIO: 0 };
    if (lastDiskStats && diskIO && diskIO.length > 0) {
      const lastRIO = lastDiskStats[0]?.rIO || 0;
      const lastWIO = lastDiskStats[0]?.wIO || 0;
      const currentRIO = diskIO[0]?.rIO || 0;
      const currentWIO = diskIO[0]?.wIO || 0;
      // 计算 KB/s
      diskActivity = {
        read: Math.max(0, (currentRIO - lastRIO) / 1024),
        write: Math.max(0, (currentWIO - lastWIO) / 1024),
        rIO: currentRIO,
        wIO: currentWIO
      };
    } else if (diskIO && diskIO.length > 0) {
      // 第一次采集，只记录总数
      diskActivity = {
        read: 0,
        write: 0,
        rIO: diskIO[0]?.rIO || 0,
        wIO: diskIO[0]?.wIO || 0
      };
    }
    lastDiskStats = diskIO;

    // 获取主要网络接口
    const primaryInterface = networkInterfaces.find(iface =>
      iface.operstate === 'up' && !iface.internal
    );

    return {
      timestamp: Date.now(),
      cpu: {
        usage: cpuLoad.currentLoad,
        cores: cpuLoad.cpus.map(cpu => cpu.load),
        temp: cpuTemp.main || cpuTemp.cores?.[0] || 0,
        speed: cpuLoad.cpus[0]?.speed || 0
      },
      gpu: {
        controllers: gpu.controllers.map(g => ({
          model: g.model,
          usage: g.utilizationGpu || 0,
          memoryUsed: g.vram || g.memoryUsed || 0,
          memoryTotal: g.vram || g.memoryTotal || 0
        }))
      },
      memory: {
        total: mem.total || 0,
        used: mem.active || 0,
        free: mem.available || 0,
        cached: mem.buffcache || 0,
        swapUsed: mem.swapused || 0,
        swapTotal: mem.swaptotal || 0,
        usagePercent: ((mem.active || 0) / (mem.total || 1)) * 100
      },
      disk: {
        layout: diskLayout.map(d => ({
          device: d.device,
          type: d.type,
          name: d.name,
          size: d.size
        })),
        fs: fsSize.map(fs => ({
          mount: fs.mount,
          size: fs.size,
          used: fs.used,
          usePercent: fs.use,
          type: fs.type
        })),
        activity: diskActivity,
        // 新增：磁盘 I/O 统计
        io: diskIO && diskIO.length > 0 ? {
          name: diskIO[0].name,
          readSec: diskActivity.read, // KB/s
          writeSec: diskActivity.write, // KB/s
          totalRead: diskActivity.rIO, // bytes
          totalWrite: diskActivity.wIO // bytes
        } : null
      },
      network: {
        interface: primaryInterface?.iface || 'lo0',
        ip: primaryInterface?.ip4 || '127.0.0.1',
        mac: primaryInterface?.mac || '',
        rx_sec: networkSpeed.rx_sec,
        tx_sec: networkSpeed.tx_sec,
        rx_total: networkStats[0]?.rx_bytes || 0,
        tx_total: networkStats[0]?.tx_bytes || 0
      },
      battery: {
        percent: battery.percent,
        isCharging: battery.isCharging,
        cycleCount: battery.cycleCount,
        health: battery.health || 'unknown',
        timeRemaining: battery.timeRemaining || 'unknown'
      },
      system: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        hostname: osInfo.hostname,
        uptime: os.uptime() // 使用 Node.js 原生的 os.uptime() 替代 osInfo.uptime
      },
      load: {
        '1min': os.loadavg()[0],
        '5min': os.loadavg()[1],
        '15min': os.loadavg()[2]
      },
      processes: {
        all: processes.all,
        running: processes.running,
        blocked: processes.blocked,
        sleeping: processes.sleeping,
        list: processes.list
          .sort((a, b) => b.cpu - a.cpu)
          .slice(0, 10)
          .map(p => ({
            pid: p.pid,
            name: p.name,
            cpu: p.cpu,
            mem: p.mem,
            state: p.state
          }))
      }
    };
  } catch (error) {
    console.error('Error collecting system info:', error);
    return null;
  }
}

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // 立即发送一次数据
  collectSystemInfo().then(data => {
    if (data) {
      socket.emit('system-info', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// 定时推送数据 (每秒更新)
setInterval(async () => {
  const data = await collectSystemInfo();
  if (data) {
    io.emit('system-info', data);
  }
}, 1000);

// REST API 端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', connectedClients: io.engine.clientsCount });
});

app.get('/api/info', async (req, res) => {
  const data = await collectSystemInfo();
  res.json(data);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Mac Monitor Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready for connections`);
});
