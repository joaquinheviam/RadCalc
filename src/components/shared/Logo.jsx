import { useId } from 'react';

export default function Logo({ size = 40 }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#grad-${id})`} />
      <circle cx="32" cy="32" r="9" fill="none" stroke="white" strokeWidth="3" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="3" />
      <circle cx="32" cy="32" r="3.4" fill="white" />
    </svg>
  );
}
