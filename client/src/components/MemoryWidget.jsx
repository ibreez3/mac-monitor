import ReactECharts from 'echarts-for-react';
import { COLORS, THRESHOLDS, getCommonChartOptions } from '../constants/colors';
import { getTrendLineOptions } from '../utils/chartHelpers';

export default function MemoryWidget({ data, history = [], className = '' }) {
  const totalGB = data.total / 1024 / 1024 / 1024;
  const usedGB = data.used / 1024 / 1024 / 1024;
  const cachedGB = data.cached / 1024 / 1024 / 1024;
  const freeGB = data.free / 1024 / 1024 / 1024;
  const swapUsedGB = data.swapUsed / 1024 / 1024 / 1024;
  const swapTotalGB = data.swapTotal / 1024 / 1024 / 1024;

  // 时序趋势图
  const trendOption = history.length > 1 ? {
    ...getCommonChartOptions(),
    ...getTrendLineOptions(history, {
      series: [{
        name: '内存使用率',
        data: history.map(h => Math.round(h.usagePercent)),
        color: COLORS.memory
      }],
      yAxisName: '%',
      max: 100,
      threshold: THRESHOLDS.memory.critical,
      areaStyle: true
    }),
    title: {
      text: '内存使用率趋势',
      left: 'center',
      top: 5,
      textStyle: { fontSize: 10, color: COLORS.textSecondary }
    }
  } : null;

  // 检查是否需要告警
  const isWarning = data.usagePercent >= THRESHOLDS.memory.critical;

  return (
    <div className={`rounded-xl p-3 transition-all duration-300 ${isWarning ? 'card-warning' : ''} ${className}`} style={{ background: COLORS.cardBackground }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: COLORS.memory }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          内存
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${COLORS.memory}20`, color: COLORS.memory }}>
          {totalGB.toFixed(0)} GB
        </span>
      </div>

      {/* 左右布局：左侧趋势图，右侧信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 左侧：时序趋势图 */}
        <div>
          {trendOption && (
            <ReactECharts option={trendOption} style={{ height: 120 }} />
          )}
        </div>

        {/* 右侧：详细信息 */}
        <div className="flex flex-col justify-center space-y-2 text-xs">
          {/* 总体使用率 */}
          <div className="p-2 rounded-lg" style={{ background: `${COLORS.memory}10` }}>
            <div className="flex justify-between items-center mb-1">
              <span style={{ color: COLORS.textSecondary }}>总使用率</span>
              <span className="text-xl font-bold" style={{ color: COLORS.memory }}>
                {Math.round(data.usagePercent)}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: COLORS.border }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${data.usagePercent}%`,
                  background: `linear-gradient(90deg, ${COLORS.memory}, ${COLORS.gradients.memory.end})`
                }}
              />
            </div>
          </div>

          {/* 内存分类 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.memory }}></span>
                <span style={{ color: COLORS.textSecondary }}>已用</span>
              </span>
              <span className="font-medium">{usedGB.toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.low }}></span>
                <span style={{ color: COLORS.textSecondary }}>缓存</span>
              </span>
              <span className="font-medium">{cachedGB.toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.border }}></span>
                <span style={{ color: COLORS.textSecondary }}>可用</span>
              </span>
              <span className="font-medium">{freeGB.toFixed(1)} GB</span>
            </div>
          </div>

          {/* 交换内存 */}
          <div className="flex justify-between items-center p-2 rounded-lg text-xs" style={{ background: `${COLORS.swap}10` }}>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.swap }}></span>
              <span style={{ color: COLORS.textSecondary }}>交换</span>
            </span>
            <span className="font-medium">
              {swapUsedGB.toFixed(1)} / {swapTotalGB.toFixed(1)} GB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
