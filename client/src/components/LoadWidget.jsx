import ReactECharts from 'echarts-for-react';
import { COLORS, getCommonChartOptions } from '../constants/colors';

export default function LoadWidget({ data }) {
  const getCpuCount = () => navigator.hardwareConcurrency || 4;

  const option = {
    ...getCommonChartOptions(),
    grid: { top: 20, right: 20, bottom: 25, left: 45, containLabel: false },
    xAxis: {
      type: 'category',
      data: ['1分钟', '5分钟', '15分钟'],
      axisLine: { lineStyle: { color: COLORS.border } },
      axisLabel: { color: COLORS.textSecondary },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { 
        color: COLORS.textSecondary,
        formatter: (value) => value.toFixed(1)
      },
      splitLine: { lineStyle: { color: COLORS.grid } }
    },
    series: [{
      type: 'bar',
      data: [data['1min'], data['5min'], data['15min']],
      itemStyle: {
        color: (params) => {
          const cores = getCpuCount();
          const value = params.value;
          const maxLoad = cores * 2;
          if (value < cores) return COLORS.low;
          if (value < maxLoad) return COLORS.medium;
          return COLORS.high;
        },
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        color: '#fff',
        fontSize: 9,
        formatter: (params) => params.value.toFixed(2)
      }
    }],
    markLine: {
      silent: true,
      symbol: 'none',
      lineStyle: {
        color: COLORS.medium,
        type: 'dashed',
        width: 1
      },
      label: {
        formatter: `核心数: ${getCpuCount()}`,
        position: 'end',
        color: COLORS.medium,
        fontSize: 9
      },
      data: [{ yAxis: getCpuCount() }]
    }
  };

  // 检查是否需要告警
  const isWarning = data['1min'] > getCpuCount() * 2;

  return (
    <div className={`rounded-xl p-3 transition-all duration-300 ${isWarning ? 'card-warning' : ''}`} style={{ background: COLORS.cardBackground }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: COLORS.medium }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          系统负载
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${COLORS.medium}20`, color: COLORS.medium }}>
          {getCpuCount()} 核心
        </span>
      </div>

      <ReactECharts option={option} style={{ height: 120 }} />

      {/* 图例 */}
      <div className="mt-2 flex justify-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.low }}></span>
          <span style={{ color: COLORS.textSecondary }}>&lt; {getCpuCount()} (正常)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.medium }}></span>
          <span style={{ color: COLORS.textSecondary }}>{getCpuCount()} - {getCpuCount() * 2}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.high }}></span>
          <span style={{ color: COLORS.textSecondary }}>&gt; {getCpuCount() * 2}</span>
        </div>
      </div>
    </div>
  );
}
