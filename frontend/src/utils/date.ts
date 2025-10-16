// 通用的人性化时间格式化工具
// 规则：
// - 1小时内：X分钟前（最小1分钟）
// - 1小时以上，24小时以内：X小时前
// - 24小时以上，一周以内：X天前
// - 一周以上：YYYY-MM-DD（不含时间）

export function formatRelativeTime(input?: string | Date | null): string {
  if (!input) return '-';
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return '-';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return `${minutes}分钟前`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours}小时前`;
  }
  if (diffMs < week) {
    const days = Math.floor(diffMs / day);
    return `${days}天前`;
  }

  // 返回本地时区的 YYYY-MM-DD
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
