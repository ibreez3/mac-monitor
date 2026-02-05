// 极简科技风色彩系统 - 基于设计规范
export const COLORS = {
  // 状态色彩 - 优化后的预警色系
  low: '#34D399',      // 绿色 - 正常状态
  medium: '#FBBF24',   // 黄色 - 警告状态
  high: '#EF4444',     // 红色 - 严重状态

  // 向后兼容别名
  normal: '#34D399',
  warning: '#FBBF24',
  critical: '#EF4444',

  // 网络色系 - 优化
  inbound: '#34D399',  // 绿色 - 入站/下载
  outbound: '#60A5FA', // 蓝色 - 出站/上传

  // 模块专属色系
  cpu: '#60A5FA',      // 蓝色 - CPU
  gpu: '#F472B6',      // 粉色 - GPU
  memory: '#A78BFA',   // 紫色 - Memory
  disk: '#FB923C',     // 橙色 - Disk
  network: '#34D399',  // 绿色 - Network
  battery: '#34D399',  // 绿色 - Battery
  swap: '#6B7280',     // 灰色 - Swap

  // 背景与文本 - 深色优化
  background: '#0F0F0F',
  cardBackground: '#1A1A1A',
  cardHover: '#222222',
  text: '#ffffff',
  textSecondary: '#9CA3AF',
  border: '#2A2A2A',
  grid: '#1F1F1F',

  // 渐变色定义
  gradients: {
    cpu: {
      start: '#60A5FA',
      end: '#3B82F6'
    },
    gpu: {
      start: '#F472B6',
      end: '#EC4899'
    },
    memory: {
      start: '#A78BFA',
      end: '#8B5CF6'
    },
    battery: {
      high: '#34D399',
      mid: '#FBBF24',
      low: '#EF4444'
    }
  }
};

// 阈值配置
export const THRESHOLDS = {
  cpu: {
    warning: 60,
    critical: 80
  },
  gpu: {
    warning: 70,
    critical: 85
  },
  memory: {
    warning: 70,
    critical: 85
  },
  disk: {
    warning: 80,
    critical: 90
  },
  temperature: {
    warning: 70,
    critical: 85
  },
  network: {
    warning: 70,
    critical: 85
  },
  load: {
    warning: 2,    // 2x 核心数
    critical: 4   // 4x 核心数
  }
};

// ECharts 通用配置
export const getCommonChartOptions = () => ({
  backgroundColor: 'transparent',
  textStyle: { fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  tooltip: {
    backgroundColor: 'rgba(45, 45, 47, 0.95)',
    borderColor: '#3a3a3c',
    textStyle: { color: '#fff' },
    padding: [12, 16],
    extraCssText: 'backdrop-filter: blur(10px); border-radius: 8px;'
  }
});
