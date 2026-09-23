export const RefreshSpinner = (props: {
  progress: number;
  spinning: boolean;
}) => {
  const size = 30;
  const stroke = 2.4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const amount = props.spinning
    ? 0.72
    : Math.max(0.08, Math.min(1, props.progress));
  const dash = circumference * amount;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={props.spinning ? 'refresh-spin' : undefined}
      style={
        props.spinning
          ? undefined
          : { transform: `rotate(${props.progress * 220}deg)` }
      }
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='rgb(148 163 184 / 0.28)'
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='#a5b4fc'
        strokeWidth={stroke}
        strokeLinecap='round'
        strokeDasharray={`${dash} ${circumference}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};
