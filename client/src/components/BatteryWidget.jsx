import ReactECharts from 'echarts-for-react';
import { COLORS, getCommonChartOptions } from '../constants/colors';

export default function BatteryWidget({ data, className = '' }) {
  // 电池环形图配置 - 紧凑版
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
          value: data.percent,
          name: '已用',
          itemStyle: {
            color: data.percent > 50 ? COLORS.low :
                   data.percent > 20 ? COLORS.medium :
                   COLORS.high
          }
        },
        {
          value: 100 - data.percent,
          name: '剩余',
          itemStyle: { color: COLORS.border }
        }
      ]
    }],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '42%',
        style: {
          text: `${Math.round(data.percent)}%`,
          fontSize: 28,
          fontWeight: 'bold',
          fill: data.percent > 50 ? COLORS.low :
                 data.percent > 20 ? COLORS.medium :
                 COLORS.high,
          textAlign: 'center'
        }
      },
      {
        type: 'text',
        left: 'center',
        top: '58%',
        style: {
          text: data.isCharging ? '充电中 ⚡' : '电池',
          fontSize: 10,
          fill: COLORS.textSecondary,
          textAlign: 'center'
        }
      }
    ]
  };

  // 检查是否需要告警
  const isWarning = data.percent < 20 && !data.isCharging;

  return (
    <div className={`rounded-xl p-3 transition-all duration-300 flex flex-col ${isWarning ? 'card-warning' : ''} ${className}`} style={{ background: COLORS.cardBackground }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: COLORS.battery }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          电池
        </h2>
        <div className="flex items-center gap-1.5">
          {data.isCharging ? (
            <>
              <span className="status-dot" style={{ background: COLORS.low }}></span>
              <span className="text-xs" style={{ color: COLORS.low }}>充电中</span>
            </>
          ) : (
            <>
              <span className="status-dot" style={{ background: COLORS.textSecondary }}></span>
              <span className="text-xs" style={{ color: COLORS.textSecondary }}>使用中</span>
            </>
          )}
        </div>
      </div>

      {/* 环形图 */}
      <div className="flex justify-center mb-2 flex-grow">
        <ReactECharts option={pieOption} style={{ height: 120 }} />
      </div>

      {/* 详细信息 */}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: `${COLORS.battery}10` }}>
          <span style={{ color: COLORS.textSecondary }}>循环次数</span>
          <span className="font-medium">{data.cycleCount || '--'}</span>
        </div>
        <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: `${COLORS.battery}10` }}>
          <span style={{ color: COLORS.textSecondary }}>健康度</span>
          <span className="font-medium">{data.health !== 'unknown' ? `${data.health}%` : '--'}</span>
        </div>
        <div className="flex justify-between items-center col-span-2 p-2 rounded-lg" style={{ background: `${COLORS.battery}10` }}>
          <span style={{ color: COLORS.textSecondary }}>剩余时间</span>
          <span className="font-medium">
            {data.timeRemaining !== 'unknown' && data.timeRemaining > 0 && data.timeRemaining < 6000 && !data.isCharging
              ? `${Math.floor(data.timeRemaining / 60)}小时 ${data.timeRemaining % 60}分钟`
              : data.isCharging
                ? '充电中...'
                : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}
