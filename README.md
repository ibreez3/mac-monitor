# MacBook 系统监控 Web 应用

一个实时监控 MacBook 系统信息的 Web 应用，提供美观的可视化界面。

## 功能特性

### 基础监控指标
- **CPU** - 实时使用率、各核心负载、温度、频率
- **GPU** - 使用率、显存占用
- **磁盘** - 存储使用率、磁盘类型、I/O 活动
- **网络** - 上下行速度、总流量统计

### 扩展监控指标
- **内存** - 使用率、可用内存、缓存、交换分区
- **电池** - 电量、健康状态、循环次数、剩余时间
- **系统负载** - 1/5/15分钟平均负载
- **系统信息** - 主机名、系统版本、运行时间
- **Top 进程** - 资源占用最高的进程列表

## 技术栈

### 后端
- **Node.js + Express** - Web 服务器
- **systeminformation** - 跨平台系统信息采集
- **Socket.IO** - WebSocket 实时通信

### 前端
- **React 18** - UI 框架
- **ECharts** - 数据可视化
- **TailwindCSS** - 样式系统
- **Vite** - 构建工具

## 安装与运行

### 前置要求
- Node.js >= 18.0.0
- npm 或 yarn

### 快速启动

```bash
# 1. 进入项目目录
cd mac-monitor

# 2. 安装依赖
cd server && npm install && cd ../client && npm install && cd ..

# 3. 启动服务

# 方式一：使用启动脚本（推荐）
chmod +x start.sh
./start.sh

# 方式二：分别启动
# 终端1 - 启动后端
cd server && npm start

# 终端2 - 启动前端
cd client && npm run dev
```

### 访问地址

- **Web UI**: http://localhost:3000
- **API**: http://localhost:3001/api

## 目录结构

```
mac-monitor/
├── server/
│   ├── index.js          # 后端服务入口
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/   # React 组件
│   │   ├── utils/        # 工具函数
│   │   ├── App.jsx       # 主应用组件
│   │   └── main.jsx      # 入口文件
│   ├── index.html
│   └── package.json
├── start.sh              # 启动脚本
└── README.md
```

## 配置说明

### 修改服务端口

**后端端口** (默认 3001):
```javascript
// server/index.js
const PORT = process.env.PORT || 3001;
```

**前端端口** (默认 3000):
```javascript
// client/vite.config.js
server: {
  port: 3000
}
```

### 连接到远程服务器

```bash
# 修改客户端环境变量
VITE_SOCKET_URL=http://your-server-ip:3001
```

## 生产部署

### 构建前端

```bash
cd client
npm run build
```

### 使用 Nginx 部署

```nginx
server {
    listen 80;
    server_name monitor.example.com;

    # 前端静态文件
    location / {
        root /path/to/mac-monitor/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 使用 PM2 守护进程

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd server
pm2 start index.js --name mac-monitor-server

# 查看状态
pm2 status

# 设置开机自启
pm2 startup
pm2 save
```

## 截图

TODO: 添加界面截图

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
