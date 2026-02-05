import ReactECharts from 'echarts-for-react';
import { COLORS, THRESHOLDS, getCommonChartOptions } from '../constants/colors';

export default function ProcessesWidget({ data, className }) {
  const cpuOption = {
    ...getCommonChartOptions(),
    grid: { top: 5, right: 15, bottom: 20, left: 5, containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: data.list.slice(0, 5).map(p => p.name),
      axisLine: { show: false },
      axisLabel: { color: COLORS.textSecondary, fontSize: 10 }
    },
    series: [{
      type: 'bar',
      data: data.list.slice(0, 5).map(p => ({
        value: p.cpu,
        itemStyle: {
          color: p.cpu > 50 ? COLORS.high : p.cpu > 20 ? COLORS.medium : COLORS.low,
          borderRadius: [0, 2, 2, 0]
        }
      })),
      barWidth: '70%',
      label: {
        show: true,
        position: 'right',
        fontSize: 10,
        color: COLORS.textSecondary,
        formatter: '{c}%'
      }
    }]
  };

  const memOption = {
    ...getCommonChartOptions(),
    grid: { top: 5, right: 15, bottom: 20, left: 5, containLabel: true },
    xAxis: {
      type: 'value',
      max: Math.max(...data.list.slice(0, 5).map(p => p.mem)) * 1.2,
      axisLine: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: data.list.slice(0, 5).map(p => p.name),
      axisLine: { show: false },
      axisLabel: { show: false }
    },
    series: [{
      type: 'bar',
      data: data.list.slice(0, 5).map(p => ({
        value: p.mem,
        itemStyle: {
          color: p.mem > 20 ? COLORS.memory : p.mem > 10 ? COLORS.disk : COLORS.medium,
          borderRadius: [0, 2, 2, 0]
        }
      })),
      barWidth: '70%',
      label: {
        show: true,
        position: 'right',
        fontSize: 10,
        color: COLORS.textSecondary,
        formatter: '{c}%'
      }
    }]
  };

  return (
    <div className={`rounded-xl p-3 transition-all duration-300 ${className || ''}`} style={{ background: COLORS.cardBackground }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: COLORS.disk }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Top 进程 (CPU)
        </h2>
        <div className="flex gap-3 text-xs" style={{ color: COLORS.textSecondary }}>
          <span>总计: {data.all}</span>
          <span style={{ color: COLORS.low }}>运行中: {data.running}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <ReactECharts option={cpuOption} style={{ height: 120 }} />
        </div>
        <div>
          <ReactECharts option={memOption} style={{ height: 120 }} />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-xs font-medium mb-2" style={{ color: COLORS.textSecondary }}>进程列表 (Top 10)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left" style={{ color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.border}` }}>
                <th className="pb-1.5 pr-3">PID</th>
                <th className="pb-1.5 pr-3">进程名</th>
                <th className="pb-1.5 pr-3">CPU</th>
                <th className="pb-1.5">内存</th>
              </tr>
            </thead>
            <tbody>
              {data.list.map((process, idx) => (
                <tr key={process.pid} className="border-b" style={{ borderColor: COLORS.border }}>
                  <td className="py-1.5 pr-3" style={{ color: COLORS.textSecondary }}>{process.pid}</td>
                  <td className="py-1.5 pr-3 font-medium">{process.name}</td>
                  <td className="py-1.5 pr-3">
                    <span style={{ color: process.cpu > 50 ? COLORS.high : process.cpu > 20 ? COLORS.medium : COLORS.low }}>
                      {process.cpu.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-1.5">
                    <span style={{ color: process.mem > 20 ? COLORS.memory : COLORS.textSecondary }}>
                      {process.mem.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
