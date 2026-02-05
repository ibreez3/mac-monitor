import { COLORS } from '../constants/colors';

export default function SystemWidget({ data, className = '' }) {
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}天 ${hours}小时`;
    if (hours > 0) return `${hours}小时 ${minutes}分钟`;
    return `${minutes}分钟`;
  };

  return (
    <div className={`rounded-xl p-3 transition-all duration-300 ${className}`} style={{ background: COLORS.cardBackground }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: COLORS.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          系统
        </h2>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: COLORS.border }}>
          <span style={{ color: COLORS.textSecondary }}>系统</span>
          <span className="font-medium">{data.distro} {data.release}</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: COLORS.border }}>
          <span style={{ color: COLORS.textSecondary }}>架构</span>
          <span className="font-medium">{data.arch}</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: COLORS.border }}>
          <span style={{ color: COLORS.textSecondary }}>主机名</span>
          <span className="font-medium truncate ml-2">{data.hostname}</span>
        </div>
        <div className="flex justify-between items-center py-1.5">
          <span style={{ color: COLORS.textSecondary }}>运行时间</span>
          <span className="font-medium" style={{ color: COLORS.low }}>{formatUptime(data.uptime)}</span>
        </div>
      </div>
    </div>
  );
}
