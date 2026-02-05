import ReactECharts from 'echarts-for-react';
import { COLORS, THRESHOLDS, getCommonChartOptions } from '../constants/colors';
import { getTrendLineOptions } from '../utils/chartHelpers';

export default function GPUWidget({ data, history = [] }) {
  const primaryGPU = data.controllers[0];
  const usage = primaryGPU?.usage || 0;
  const memoryTotal = primaryGPU?.memoryTotal || 1;
  const memoryUsed = primaryGPU?.memoryUsed || 0;
  const memoryPercent = (memoryUsed / memoryTotal) * 100;

  // 使用率仪表盘
  const gaugeOption = {
    ...getCommonChartOptions(),
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      radius: '85%',
      center: ['50%', '60%'],
      min: 0,
      max: 100,
      progress: {
        show: true,
        roundCap: true,
        width: 10
      },
      pointer: { show: false },
      axisLine: {
        lineStyle: {
          width: 10,
          color: [[1, {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: COLORS.low },
              { offset: 0.7, color: COLORS.medium },
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
      data: [{ value: Math.round(usage), name: 'GPU 使用率' }]
    }]
  };

  // 显存环形图
  const memoryOption = {
    ...getCommonChartOptions(),
    series: [{
      type: 'pie',
      radius: ['55%', '75%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: [
        {
          value: memoryUsed,
          name: '已用',
          itemStyle: { color: COLORS.gpu }
        },
        {
          value: memoryTotal - memoryUsed,
          name: '可用',
          itemStyle: { color: COLORS.border }
        }
      ]
    }],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '40%',
        style: {
          text: `${Math.round(memoryPercent)}%`,
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
          text: `${(memoryUsed / 1024).toFixed(1)} / ${(memoryTotal / 1024).toFixed(1)} GB`,
          fontSize: 9,
          fill: COLORS.textSecondary,
          textAlign: 'center'
        }
      }
    ]
  };

  // 双轴趋势图（使用率 + 显存）
  const trendOption = history.length > 1 ? {
    ...getCommonChartOptions(),
    ...getDualAxisLineOptions(history, {
      seriesLeft: [{
        name: 'GPU 使用率',
        data: history.map(h => Math.round(h.usage)),
        color: COLORS.gpu
      }],
      seriesRight: [{
        name: '显存使用',
        data: history.map(h => Math.round((h.memoryUsed / memoryTotal) * 100)),
        color: COLORS.memory
      }],
      yAxisLeftName: '%',
      yAxisRightName: '%',
      maxLeft: 100,
      maxRight: 100
    }),
    title: {
      text: 'GPU 使用率 & 显存趋势',
      left: 'center',
      top: 5,
      textStyle: { fontSize: 11, color: COLORS.textSecondary }
    }
  } : null;

  // 检查是否需要告警
  const isWarning = usage >= THRESHOLDS.gpu.critical;

  return (
    <div className={`rounded-xl p-3 transition-all duration-300 ${isWarning ? 'card-warning' : ''}`} style={{ background: COLORS.cardBackground }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: COLORS.gpu }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          GPU
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${COLORS.gpu}20`, color: COLORS.gpu }}>
          {primaryGPU?.model || 'Unknown'}
        </span>
      </div>

      {/* 时序趋势图 */}
      {trendOption && (
        <div className="mb-2">
          <ReactECharts option={trendOption} style={{ height: 80 }} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {/* 使用率仪表盘 */}
        <div>
          <ReactECharts option={gaugeOption} style={{ height: 100 }} />
        </div>
        {/* 显存环形图 */}
        <div>
          <ReactECharts option={memoryOption} style={{ height: 100 }} />
        </div>
      </div>

      {/* 详细信息 */}
      <div className="text-xs mt-2">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.gpu }}></span>
            <span style={{ color: COLORS.textSecondary }}>显存</span>
          </span>
          <span className="font-medium">
            {(memoryUsed / 1024).toFixed(1)} GB
            <span style={{ color: COLORS.textSecondary }}> / </span>
            {(memoryTotal / 1024).toFixed(1)} GB
          </span>
        </div>
      </div>

      {data.controllers.length > 1 && (
        <p className="text-xs mt-2" style={{ color: COLORS.textSecondary }}>
          +{data.controllers.length - 1} 其他 GPU
        </p>
      )}

      {/* Apple Silicon 提示 */}
      {primaryGPU?.model?.includes('Apple') && usage === 0 && memoryUsed === 0 && (
         <p className="text-xs mt-2 text-center opacity-60" style={{ color: COLORS.textSecondary }}>
           * Apple Silicon GPU 实时数据获取受限
         </p>
      )}
    </div>
  );
}

function getDualAxisLineOptions(history, config) {
  const { seriesLeft, seriesRight, yAxisLeftName, yAxisRightName, maxLeft, maxRight } = config;
  const timeLabels = history.map((_, i) => {
    const s = Math.max(0, history.length - 60 + i);
    return s % 10 === 0 ? '' : '';
  });

  return {
    grid: { top: 35, right: 55, bottom: 25, left: 45, containLabel: false },
    xAxis: {
      type: 'category',
      data: timeLabels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: COLORS.border } },
      axisLabel: { show: false },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        max: maxLeft,
        axisLine: { show: false },
        axisLabel: { color: COLORS.textSecondary, fontSize: 9, formatter: `{value}${yAxisLeftName}` },
        splitLine: { lineStyle: { color: COLORS.grid } }
      },
      {
        type: 'value',
        max: maxRight,
        axisLine: { show: false },
        axisLabel: { color: COLORS.textSecondary, fontSize: 9, formatter: `{value}${yAxisRightName}` },
        splitLine: { show: false }
      }
    ],
    series: [
      { ...seriesLeft[0], type: 'line', smooth: true, showSymbol: false, lineStyle: { width: 2 }, yAxisIndex: 0 },
      { ...seriesRight[0], type: 'line', smooth: true, showSymbol: false, lineStyle: { width: 2, type: 'dashed' }, yAxisIndex: 1 }
    ]
  };
}
