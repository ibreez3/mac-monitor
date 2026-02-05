import ReactECharts from 'echarts-for-react';
import { COLORS, THRESHOLDS, getCommonChartOptions } from '../constants/colors';

export default function DiskWidget({ data }) {
  const mainDisk = data.fs[0];
  const usePercent = mainDisk?.usePercent || 0;
  const usedGB = (mainDisk?.used || 0) / 1024 / 1024 / 1024;
  const totalGB = (mainDisk?.size || 0) / 1024 / 1024 / 1024;

  const usageColor = usePercent < THRESHOLDS.disk.warning ? COLORS.low :
                     usePercent < THRESHOLDS.disk.critical ? COLORS.medium :
                     COLORS.high;

  // 环形仪表盘
  const gaugeOption = {
    ...getCommonChartOptions(),
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      radius: '80%',
      center: ['50%', '60%'],
      min: 0,
      max: 100,
      progress: {
        show: true,
        roundCap: true,
        width: 12
      },
      pointer: { show: false },
      axisLine: {
        lineStyle: {
          width: 12,
          color: [[1, {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: COLORS.low },
              { offset: 0.8, color: COLORS.medium },
              { offset: 1, color: COLORS.high }
            ]
          }]]
        }
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        offsetCenter: [0, '10%']
      },
      title: {
        offsetCenter: [0, '45%'],
        fontSize: 10,
        color: COLORS.textSecondary
      },
      data: [{ value: Math.round(usePercent), name: '磁盘使用率' }]
    }]
  };

  // 多文件系统对比
  const fsCompareOption = {
    ...getCommonChartOptions(),
    grid: { top: 10, right: 20, bottom: 30, left: 80, containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: COLORS.textSecondary, formatter: '{value}%' },
      splitLine: { lineStyle: { color: COLORS.grid } }
    },
    yAxis: {
      type: 'category',
      data: data.fs.slice(0, 5).map(fs => fs.mount),
      axisLine: { show: false },
      axisLabel: { color: COLORS.textSecondary, fontSize: 10 }
    },
    series: [{
      type: 'bar',
      data: data.fs.slice(0, 5).map(fs => ({
        value: Math.round(fs.usePercent),
        itemStyle: {
          color: fs.usePercent < THRESHOLDS.disk.warning ? COLORS.low :
                 fs.usePercent < THRESHOLDS.disk.critical ? COLORS.medium :
                 COLORS.high,
          borderRadius: [0, 2, 2, 0]
        }
      })),
      barWidth: '60%',
      label: {
        show: true,
        position: 'right',
        fontSize: 9,
        color: COLORS.textSecondary,
        formatter: '{c}%'
      }
    }]
  };

  // 检查是否需要告警
  const isWarning = usePercent >= THRESHOLDS.disk.critical;

  return (
    <div className={`rounded-xl p-3 transition-all duration-300 ${isWarning ? 'card-warning' : ''}`} style={{ background: COLORS.cardBackground }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: COLORS.disk }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          磁盘
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${COLORS.disk}20`, color: COLORS.disk }}>
          {mainDisk?.mount}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* 仪表盘 */}
        <div>
          <ReactECharts option={gaugeOption} style={{ height: 100 }} />
        </div>
        {/* 文件系统对比 */}
        <div>
          <ReactECharts option={fsCompareOption} style={{ height: 100 }} />
        </div>
      </div>

      {/* 详细信息 */}
      <div className="space-y-1.5 text-xs mt-2">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: usageColor }}></span>
            <span style={{ color: COLORS.textSecondary }}>已用</span>
          </span>
          <span className="font-medium">{usedGB.toFixed(1)} GB / {totalGB.toFixed(0)} GB</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: COLORS.textSecondary }}>类型</span>
          <span className="font-medium">{mainDisk?.type}</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: COLORS.textSecondary }}>设备</span>
          <span className="font-medium text-xs">{data.layout[0]?.name}</span>
        </div>
      </div>
    </div>
  );
}
