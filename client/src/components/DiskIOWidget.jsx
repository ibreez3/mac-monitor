import ReactECharts from 'echarts-for-react';
import { COLORS, getCommonChartOptions } from '../constants/colors';

export default function DiskIOWidget({ data }) {
  const diskIO = data?.io;
  const readSpeed = diskIO?.readSec || 0;
  const writeSpeed = diskIO?.writeSec || 0;
  const totalReadGB = (diskIO?.totalRead || 0) / 1024 / 1024 / 1024;
  const totalWriteGB = (diskIO?.totalWrite || 0) / 1024 / 1024 / 1024;

  // 双仪表盘 - 读写速度
  const gaugeOption = {
    ...getCommonChartOptions(),
    series: [
      {
        type: 'gauge',
        center: ['30%', '60%'],
        radius: '75%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: Math.max(10240, readSpeed * 2),
        splitNumber: 5,
        progress: {
          show: true,
          roundCap: true,
          width: 8
        },
        pointer: { show: false },
        axisLine: {
          lineStyle: {
            width: 8,
            color: [[1, COLORS.inbound]]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          formatter: (value) => value < 1024 ? `${value.toFixed(1)}` : `${(value / 1024).toFixed(1)}`,
          fontSize: 16,
          color: COLORS.inbound,
          offsetCenter: [0, '20%']
        },
        title: {
          offsetCenter: [0, '50%'],
          fontSize: 9,
          color: COLORS.textSecondary
        },
        data: [{ value: readSpeed, name: '↓ KB/s' }]
      },
      {
        type: 'gauge',
        center: ['70%', '60%'],
        radius: '75%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: Math.max(10240, writeSpeed * 2),
        splitNumber: 5,
        progress: {
          show: true,
          roundCap: true,
          width: 8
        },
        pointer: { show: false },
        axisLine: {
          lineStyle: {
            width: 8,
            color: [[1, COLORS.outbound]]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          formatter: (value) => value < 1024 ? `${value.toFixed(1)}` : `${(value / 1024).toFixed(1)}`,
          fontSize: 16,
          color: COLORS.outbound,
          offsetCenter: [0, '20%']
        },
        title: {
          offsetCenter: [0, '50%'],
          fontSize: 9,
          color: COLORS.textSecondary
        },
        data: [{ value: writeSpeed, name: '↑ KB/s' }]
      }
    ]
  };

  // 环形图 - 总读写比例
  const pieOption = {
    ...getCommonChartOptions(),
    series: [{
      type: 'pie',
      radius: ['55%', '75%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: [
        {
          value: totalReadGB,
          name: '读取',
          itemStyle: { color: COLORS.inbound }
        },
        {
          value: totalWriteGB,
          name: '写入',
          itemStyle: { color: COLORS.outbound }
        }
      ]
    }],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '40%',
        style: {
          text: `${(totalReadGB + totalWriteGB).toFixed(1)}`,
          fontSize: 18,
          fontWeight: 'bold',
          fill: '#fff',
          textAlign: 'center'
        }
      },
      {
        type: 'text',
        left: 'center',
        top: '55%',
        style: {
          text: 'GB 总量',
          fontSize: 9,
          fill: COLORS.textSecondary,
          textAlign: 'center'
        }
      }
    ]
  };

  return (
    <div className="rounded-xl p-3 transition-all duration-300" style={{ background: COLORS.cardBackground }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: COLORS.disk }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          磁盘 I/O
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${COLORS.disk}20`, color: COLORS.disk }}>
          {diskIO?.name || '未知'}
        </span>
      </div>

      {/* 上部：双仪表盘 */}
      <div className="mb-2">
        <ReactECharts option={gaugeOption} style={{ height: 80 }} />
      </div>

      {/* 中部：环形图 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        <div className="flex justify-center">
          <ReactECharts option={pieOption} style={{ height: 100 }} />
        </div>

        {/* 详细信息 */}
        <div className="flex flex-col justify-center space-y-1.5 text-xs">
          <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: `${COLORS.inbound}10` }}>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.inbound }}></span>
              <span style={{ color: COLORS.textSecondary }}>读取速度</span>
            </span>
            <span className="font-medium" style={{ color: COLORS.inbound }}>
              {readSpeed < 1024 ? `${readSpeed.toFixed(1)} KB/s` : `${(readSpeed / 1024).toFixed(2)} MB/s`}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: `${COLORS.outbound}10` }}>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.outbound }}></span>
              <span style={{ color: COLORS.textSecondary }}>写入速度</span>
            </span>
            <span className="font-medium" style={{ color: COLORS.outbound }}>
              {writeSpeed < 1024 ? `${writeSpeed.toFixed(1)} KB/s` : `${(writeSpeed / 1024).toFixed(2)} MB/s`}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: `${COLORS.disk}10` }}>
            <span style={{ color: COLORS.textSecondary }}>总读取</span>
            <span className="font-medium">{totalReadGB.toFixed(2)} GB</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: `${COLORS.disk}10` }}>
            <span style={{ color: COLORS.textSecondary }}>总写入</span>
            <span className="font-medium">{totalWriteGB.toFixed(2)} GB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
