type Props = {
  points: number[];
  up?: boolean;
  className?: string;
};

export function MiniChart({ points, up = true, className }: Props) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 30 - ((p - min) / span) * 26 - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d={`${d} L100,30 L0,30 Z`}
        fill={up ? "var(--primary)" : "var(--destructive)"}
        opacity="0.12"
      />
      <path
        d={d}
        fill="none"
        stroke={up ? "var(--primary)" : "var(--destructive)"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
