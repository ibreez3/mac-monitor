import { COLORS, THRESHOLDS } from '../constants/colors.js';

// 生成时序图表的 X 轴时间标签
export function generateTimeLabels(data, count = 10) {
  if (!data || data.length === 0) return [];
  const step = Math.max(1, Math.floor(data.length / count));
  return data
    .filter((_, i) => i % step === 0)
    .map(d => {
      const date = new Date(d.timestamp);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    });
}

// 根据数值获取颜色
export function getValueColor(value, type) {
  const threshold = THRESHOLDS[type] || THRESHOLDS.cpu;
  if (value < threshold.warning) return COLORS.low;
  if (value < threshold.critical) return COLORS.medium;
  return COLORS.high;
}

// 生成时序折线图配置
export function getTrendLineOptions(data, config) {
  const {
    title,
    series = [],
    yAxisName = '',
    max = 100,
    threshold = null,
    areaStyle = false,
    smooth = true
  } = config;

  const timeLabels = generateTimeLabels(data);

  return {
    grid: {
      top: 40,
      right: 20,
      bottom: 30,
      left: 55,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: timeLabels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: COLORS.border } },
      axisLabel: { color: COLORS.textSecondary, fontSize: 10 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      max: max,
      axisLine: { show: false },
      axisLabel: { color: COLORS.textSecondary, formatter: `{value}${yAxisName}` },
      splitLine: { lineStyle: { color: COLORS.grid, type: 'dashed' } }
    },
    series: series.map(s => ({
      type: 'line',
      smooth: smooth,
      showSymbol: false,
      lineStyle: { width: 2 },
      areaStyle: areaStyle ? {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: s.color + '40' },
            { offset: 1, color: s.color + '05' }
          ]
        }
      } : undefined,
      ...s
    })),
    markLine: threshold ? {
      silent: true,
      symbol: 'none',
      lineStyle: {
        color: COLORS.high,
        type: 'dashed',
        width: 1
      },
      label: {
        formatter: `${threshold}${yAxisName}`,
        position: 'end',
        color: COLORS.high,
        fontSize: 10
      },
      data: [{ yAxis: threshold }]
    } : undefined
  };
}

// 生成双轴折线图配置
export function getDualAxisLineOptions(data, config) {
  const {
    seriesLeft,
    seriesRight,
    yAxisLeftName = '',
    yAxisRightName = '',
    maxLeft = 100,
    maxRight = 100
  } = config;

  const timeLabels = generateTimeLabels(data);

  return {
    grid: {
      top: 40,
      right: 65,
      bottom: 30,
      left: 55,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: timeLabels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: COLORS.border } },
      axisLabel: { color: COLORS.textSecondary, fontSize: 10 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        max: maxLeft,
        axisLine: { show: false },
        axisLabel: { color: COLORS.textSecondary, formatter: `{value}${yAxisLeftName}` },
        splitLine: { lineStyle: { color: COLORS.grid } }
      },
      {
        type: 'value',
        max: maxRight,
        axisLine: { show: false },
        axisLabel: { color: COLORS.textSecondary, formatter: `{value}${yAxisRightName}` },
        splitLine: { show: false }
      }
    ],
    series: [
      ...seriesLeft.map((s, i) => ({
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, type: i === 0 ? 'solid' : 'dashed' },
        yAxisIndex: 0,
        ...s
      })),
      ...seriesRight.map(s => ({
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2 },
        yAxisIndex: 1,
        ...s
      }))
    ]
  };
}
