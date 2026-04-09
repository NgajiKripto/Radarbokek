const ScallopedDivider = ({ color, className = "", flip = false }) => {
  const w = 1200;
  const count = 60;
  const step = w / count; // 20 units per scallop
  const r = step / 2;     // 10 — radius and flat-area height
  const h = r * 2;        // 20 — total SVG height

  // Rectangle (y=0 to y=r) + downward semicircle bumps (y=r to y=2r)
  let d = `M0,${r}`;
  for (let i = 0; i < count; i++) {
    d += ` A${r},${r} 0 0,1 ${(i + 1) * step},${r}`;
  }
  d += ` L${w},0 L0,0 Z`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`w-full block relative z-10 ${className}`.trim()}
      style={{
        height: `${h}px`,
        display: 'block',
        ...(flip ? { transform: 'scaleY(-1)', marginTop: `-${r}px` } : {}),
      }}
    >
      <path d={d} fill={color} />
    </svg>
  );
};

export default ScallopedDivider;
