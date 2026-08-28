/** A stable, pleasant color per class label (used by overlays and result rows). */
const COLORS = [
  '#2F6BFF',
  '#12A594',
  '#E5484D',
  '#F2820D',
  '#7C5CFF',
  '#E5484D',
  '#0EA5E9',
  '#EC4899',
  '#16A34A',
  '#CA8A04',
];

export function domainColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) | 0;
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}
