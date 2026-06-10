interface StatusBadgeProps {
  label: string;
}

const CLASS_MAP: Record<string, string> = {
  active: 'badge-success',
  approved: 'badge-success',
  archived: 'badge-neutral',
  closed: 'badge-neutral',
  generated: 'badge-success',
  in_progress: 'badge-warning',
  settled: 'badge-success',
  reconciled: 'badge-success',
  completed: 'badge-success',
  draft: 'badge-neutral',
  pending: 'badge-warning',
  published: 'badge-success',
  matched: 'badge-success',
  queued: 'badge-warning',
  unmatched: 'badge-warning',
  invited: 'badge-warning',
  in_review: 'badge-warning',
  resolved: 'badge-success',
  sent: 'badge-success',
  failed: 'badge-danger',
  triaged: 'badge-warning',
  processing: 'badge-warning',
  open: 'badge-warning',
  rejected: 'badge-danger',
  exception: 'badge-danger',
  suspended: 'badge-danger',
  verified: 'badge-success',
  critical: 'badge-danger',
};

export function StatusBadge({ label }: StatusBadgeProps) {
  const normalized = label.toLowerCase().replace(/\s+/g, '_');
  return <span className={`status-badge ${CLASS_MAP[normalized] ?? 'badge-neutral'}`}>{label}</span>;
}
