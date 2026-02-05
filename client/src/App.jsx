import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import BatteryWidget from './components/BatteryWidget';
import CPUWidget from './components/CPUWidget';
import DiskIOWidget from './components/DiskIOWidget';
import DiskWidget from './components/DiskWidget';
import GPUWidget from './components/GPUWidget';
import LoadWidget from './components/LoadWidget';
import MemoryWidget from './components/MemoryWidget';
import NetworkWidget from './components/NetworkWidget';
import ProcessesWidget from './components/ProcessesWidget';
import SystemWidget from './components/SystemWidget';
import { COLORS } from './constants/colors';
import { useHistoryData } from './hooks/useHistoryData';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

function App() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [connected, setConnected] = useState(false);
  const updateInterval = useRef(null);
  const { history, addCpuData, addGpuData, addMemoryData, addNetworkData, addLoadData, addDiskIOData } = useHistoryData();

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socket.on('system-info', (data) => {
      setSystemInfo(data);
      // 收集历史数据
      addCpuData(data.cpu);
      addGpuData(data.gpu);
      addMemoryData(data.memory);
      addNetworkData(data.network);
      addLoadData(data.load);
      addDiskIOData(data.disk);
    });

    return () => {
      socket.disconnect();
      if (updateInterval.current) clearInterval(updateInterval.current);
    };
  }, [addCpuData, addGpuData, addMemoryData, addNetworkData, addLoadData, addDiskIOData]);

  if (!systemInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.background }}>
        <div className="text-center">
          <div className={`status-dot mx-auto mb-4 ${connected ? 'bg-[#34D399]' : 'bg-[#EF4444]'}`} />
          <p style={{ color: COLORS.textSecondary }} className="text-lg">
            {connected ? '正在加载系统信息...' : '正在连接服务器...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: COLORS.background }}>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold" style={{
              background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              MacBook 系统监控
            </h1>
            <p style={{ color: COLORS.textSecondary }} className="mt-1">{systemInfo.system?.hostname}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`status-dot ${connected ? 'bg-[#34D399]' : 'bg-[#EF4444]'}`} />
            <span className="text-sm" style={{ color: COLORS.textSecondary }}>
              {connected ? '已连接' : '未连接'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid - 重新组织布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {/* CPU - Column 1, Row 1-2 (占据左侧两行) */}
        <CPUWidget data={systemInfo.cpu} history={history.cpu} className="xl:row-span-2" />

        {/* Memory - Column 2-3, Row 1 (占据中间顶部两列) */}
        <MemoryWidget data={systemInfo.memory} history={history.memory} className="xl:col-span-2" />

        {/* System & Battery Stack - Column 4, Row 1-2 (占据右侧一列，上下排列) */}
        <div className="flex flex-col gap-3 md:gap-4 xl:row-span-2">
          <SystemWidget data={systemInfo.system} />
          <BatteryWidget data={systemInfo.battery} className="flex-grow" />
        </div>

        {/* GPU - Column 2, Row 2 */}
        <GPUWidget data={systemInfo.gpu} history={history.gpu} />

        {/* Network - Column 3, Row 2 */}
        <NetworkWidget data={systemInfo.network} history={history.network} />

        {/* Disk - 下移 */}
        <DiskWidget data={systemInfo.disk} />

        {/* Disk I/O - 新增 */}
        <DiskIOWidget data={systemInfo.disk} />

        {/* Load - 放到最右侧 */}
        <LoadWidget data={systemInfo.load} />

        {/* Processes - 全宽 */}
        <ProcessesWidget data={systemInfo.processes} className="md:col-span-2 xl:col-span-4" />
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm" style={{ color: COLORS.textSecondary }}>
        <p>最后更新: {new Date(systemInfo.timestamp).toLocaleString('zh-CN')}</p>
      </footer>
    </div>
  );
}

export default App;
