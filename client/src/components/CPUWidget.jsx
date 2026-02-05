import ReactECharts from 'echarts-for-react';
import { COLORS, THRESHOLDS, getCommonChartOptions } from '../constants/colors';
import { getTrendLineOptions } from '../utils/chartHelpers';

export default function CPUWidget({ data, history = [], className = '' }) {
  const usageColor =
    data.usage < THRESHOLDS.cpu.warning ? COLORS.low :
    data.usage < THRESHOLDS.cpu.critical ? COLORS.medium :
    COLORS.high;

  // 时序趋势图 - 紧凑版
  const trendOption = history.length > 1 ? {
    ...getCommonChartOptions(),
    ...getTrendLineOptions(history, {
      series: [{
        name: 'CPU 使用率',
        data: history.map(h => Math.round(h.usage)),
        color: COLORS.cpu
      }],
      yAxisName: '%',
      max: 100,
      threshold: THRESHOLDS.cpu.critical,
      areaStyle: true
    }),
    title: {
      text: 'CPU 使用率趋势',
      left: 'center',
      top: 5,
      textStyle: { fontSize: 10, color: COLORS.textSecondary }
    }
  } : null;

  // 仪表盘配置 - 紧凑版
  const gaugeOption = {
    ...getCommonChartOptions(),
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      radius: '70%',
      center: ['50%', '60%'],
      min: 0,
      max: 100,
      splitNumber: 10,
      itemStyle: { color: usageColor },
      progress: {
        show: true,
        roundCap: true,
        width: 8
      },
      pointer: { show: false },
      axisLine: {
        lineStyle: {
          width: 8,
          color: [[1, {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: COLORS.low },
              { offset: 0.6, color: COLORS.medium },
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        offsetCenter: [0, '10%']
      },
      title: {
        offsetCenter: [0, '40%'],
        fontSize: 9,
        color: COLORS.textSecondary
      },
      data: [{ value: Math.round(data.usage), name: '使用率' }]
    }]
  };

  // 核心利用率柱状图 - 紧凑版
  const coreOption = {
    ...getCommonChartOptions(),
    grid: { top: 8, right: 8, bottom: 18, left: 28 },
    xAxis: {
      type: 'category',
      data: data.cores.map((_, i) => `C${i + 1}`),
      axisLine: { lineStyle: { color: COLORS.border } },
      axisLabel: { color: COLORS.textSecondary, fontSize: 7 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: COLORS.textSecondary, formatter: '{value}%', fontSize: 7 },
      splitLine: { lineStyle: { color: COLORS.grid } }
    },
    series: [{
      type: 'bar',
      data: data.cores.map(c => Math.round(c)),
      itemStyle: {
        color: (params) => {
          if (params.value < THRESHOLDS.cpu.warning) return COLORS.low;
          if (params.value < THRESHOLDS.cpu.critical) return COLORS.medium;
          return COLORS.high;
        },
        borderRadius: [2, 2, 0, 0]
      },
      barWidth: '70%',
      label: {
        show: true,
        position: 'top',
        fontSize: 6,
        color: COLORS.textSecondary,
        formatter: '{c}%'
      }
    }],
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    }
  };

  // 检查是否需要告警
  const isWarning = data.usage >= THRESHOLDS.cpu.critical;

  return (
    <div className={`rounded-xl p-3 transition-all duration-300 flex flex-col ${isWarning ? 'card-warning' : ''} ${className}`} style={{ background: COLORS.cardBackground }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: COLORS.cpu }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          CPU
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${COLORS.cpu}20`, color: COLORS.cpu }}>
          {data.cores.length} 核心
        </span>
      </div>

      {/* 时序趋势图 */}
      {trendOption && (
        <div className="flex-grow" style={{ minHeight: '120px' }}>
          <ReactECharts option={trendOption} style={{ height: '140px' }} />
        </div>
      )}

      {/* 下部分：仪表盘和柱状图 */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <ReactECharts option={gaugeOption} style={{ height: 90 }} />
        </div>
        <div>
          <ReactECharts option={coreOption} style={{ height: 90 }} />
        </div>
      </div>

      {/* 详细信息 */}
      <div className="grid grid-cols-2 gap-1.5 mt-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: data.temp > THRESHOLDS.temperature.critical ? COLORS.high : data.temp > THRESHOLDS.temperature.warning ? COLORS.medium : COLORS.low }}></span>
            <span style={{ color: COLORS.textSecondary }}>温度</span>
          </span>
          <span className="font-medium">{data.temp > 0 ? `${data.temp.toFixed(1)}°C` : '--'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.low }}></span>
            <span style={{ color: COLORS.textSecondary }}>频率</span>
          </span>
          <span className="font-medium">{data.speed > 0 ? `${data.speed.toFixed(2)} GHz` : '--'}</span>
        </div>
      </div>
    </div>
  );
}
