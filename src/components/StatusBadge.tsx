interface StatusBadgeProps {
  label: string;
}

const CLASS_MAP: Record<string, string> = {
  active: 'badge-success',
  approved: 'badge-success',
  generated: 'badge-success',
  settled: 'badge-success',
  reconciled: 'badge-success',
  completed: 'badge-success',
  pending: 'badge-warning',
  invited: 'badge-warning',
  in_review: 'badge-warning',
  processing: 'badge-warning',
  open: 'badge-warning',
  rejected: 'badge-danger',
  suspended: 'badge-danger',
  critical: 'badge-danger',
};

export function StatusBadge({ label }: StatusBadgeProps) {
  const normalized = label.toLowerCase().replace(/\s+/g, '_');
  return <span className={`status-badge ${CLASS_MAP[normalized] ?? 'badge-neutral'}`}>{label}</span>;
}
