const MULTIPLIERS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

export function parseDurationToSeconds(value: string, fallbackSeconds: number): number {
  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) return fallbackSeconds;

  const amount = parseInt(match[1]!, 10);
  const unit = match[2]!.toLowerCase();
  return amount * (MULTIPLIERS[unit] ?? 60);
}

export function parseDurationToDate(value: string, fallbackSeconds: number): Date {
  const seconds = parseDurationToSeconds(value, fallbackSeconds);
  return new Date(Date.now() + seconds * 1000);
}
