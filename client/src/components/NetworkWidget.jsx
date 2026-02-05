import ReactECharts from 'echarts-for-react';
import { COLORS, getCommonChartOptions } from '../constants/colors';

export default function NetworkWidget({ data, history = [] }) {
  // 时序趋势图 - 紧凑版
  const trendOption = history.length > 1 ? {
    ...getCommonChartOptions(),
    grid: { top: 35, right: 15, bottom: 20, left: 50, containLabel: false },
    xAxis: {
      type: 'category',
      data: history.map((_, i) => i % 10 === 0 ? '' : ''),
      boundaryGap: false,
      axisLine: { lineStyle: { color: COLORS.border } },
      axisLabel: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        color: COLORS.textSecondary,
        fontSize: 8,
        formatter: (value) => {
          if (value === 0) return '0';
          return value < 1024 ? `${value.toFixed(0)}K` : `${(value / 1024).toFixed(1)}M`;
        }
      },
      splitLine: { lineStyle: { color: COLORS.grid } }
    },
    series: [
      {
        name: '下载',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: history.map(h => h.rx_sec),
        lineStyle: { width: 2, color: COLORS.inbound },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: COLORS.inbound + '40' },
              { offset: 1, color: COLORS.inbound + '05' }
            ]
          }
        }
      },
      {
        name: '上传',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: history.map(h => h.tx_sec),
        lineStyle: { width: 2, color: COLORS.outbound }
      }
    ],
    legend: {
      data: ['下载', '上传'],
      top: 0,
      right: 8,
      textStyle: { fontSize: 9, color: COLORS.textSecondary },
      itemWidth: 10,
      itemHeight: 6
    },
    title: {
      text: '流量趋势',
      left: 8,
      top: 0,
      textStyle: { fontSize: 10, color: COLORS.textSecondary }
    }
  } : null;

  // 实时速度仪表盘 - 紧凑版
  const gaugeOption = {
    ...getCommonChartOptions(),
    series: [
      {
        type: 'gauge',
        center: ['30%', '60%'],
        radius: '70%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: Math.max(10240, data.rx_sec * 1.5),
        splitNumber: 5,
        progress: {
          show: true,
          roundCap: true,
          width: 6
        },
        pointer: { show: false },
        axisLine: {
          lineStyle: {
            width: 6,
            color: [[1, COLORS.inbound]]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          formatter: (value) => value < 1024 ? `${value.toFixed(1)}` : `${(value / 1024).toFixed(1)}`,
          fontSize: 12,
          color: COLORS.inbound,
          offsetCenter: [0, '25%']
        },
        title: {
          offsetCenter: [0, '50%'],
          fontSize: 8,
          color: COLORS.textSecondary
        },
        data: [{ value: data.rx_sec, name: '↓ KB/s' }]
      },
      {
        type: 'gauge',
        center: ['70%', '60%'],
        radius: '70%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: Math.max(10240, data.tx_sec * 1.5),
        splitNumber: 5,
        progress: {
          show: true,
          roundCap: true,
          width: 6
        },
        pointer: { show: false },
        axisLine: {
          lineStyle: {
            width: 6,
            color: [[1, COLORS.outbound]]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          formatter: (value) => value < 1024 ? `${value.toFixed(1)}` : `${(value / 1024).toFixed(1)}`,
          fontSize: 12,
          color: COLORS.outbound,
          offsetCenter: [0, '25%']
        },
        title: {
          offsetCenter: [0, '50%'],
          fontSize: 8,
          color: COLORS.textSecondary
        },
        data: [{ value: data.tx_sec, name: '↑ KB/s' }]
      }
    ]
  };

  // 检查是否需要告警
  const totalSpeed = data.rx_sec + data.tx_sec;
  const isWarning = totalSpeed > 10240;

  return (
    <div className={`rounded-xl p-3 transition-all duration-300 ${isWarning ? 'card-warning' : ''}`} style={{ background: COLORS.cardBackground }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: COLORS.network }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          网络
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${COLORS.network}20`, color: COLORS.network }}>
          {data.interface}
        </span>
      </div>

      {/* 趋势图 */}
      <div className="mb-2">
        {trendOption && (
          <ReactECharts option={trendOption} style={{ height: 100 }} />
        )}
      </div>

      {/* 仪表盘 */}
      <div className="mb-2">
        <ReactECharts option={gaugeOption} style={{ height: 80 }} />
      </div>

      {/* 详细信息 */}
      <div className="grid grid-cols-2 gap-1.5 text-xs p-2 rounded-lg" style={{ background: `${COLORS.network}05` }}>
        <div className="flex justify-between items-center">
          <span style={{ color: COLORS.textSecondary }}>IP</span>
          <span className="font-medium truncate" title={data.ip}>{data.ip}</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: COLORS.textSecondary }}>MAC</span>
          <span className="font-medium truncate" title={data.mac}>{data.mac.slice(0, 8)}...</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.inbound }}></span>
            <span style={{ color: COLORS.textSecondary }}>总下载</span>
          </span>
          <span style={{ color: COLORS.inbound }}>{(data.rx_total / 1024 / 1024 / 1024).toFixed(2)} GB</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.outbound }}></span>
            <span style={{ color: COLORS.textSecondary }}>总上传</span>
          </span>
          <span style={{ color: COLORS.outbound }}>{(data.tx_total / 1024 / 1024 / 1024).toFixed(2)} GB</span>
        </div>
      </div>
    </div>
  );
}
