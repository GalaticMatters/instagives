export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="instagives-mark" x1="4" y1="2" x2="28" y2="30">
          <stop offset="0%" stopColor="#f7c6d8" />
          <stop offset="52%" stopColor="#ffd0b8" />
          <stop offset="100%" stopColor="#ddcff5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#instagives-mark)" />
      <path
        d="M16 8.2c-1.1-1.8-3.8-2-4.8-.5-1 1.5.5 2.8 2.1 3.4L16 12.4l2.7-1.3c1.6-.6 3.1-1.9 2.1-3.4-1-1.5-3.7-1.3-4.8.5Z"
        fill="#6d3b50"
      />
      <rect x="8.2" y="13.6" width="15.6" height="10.2" rx="2" fill="#6d3b50" />
      <path d="M16 13.6v10.2M8.2 18h15.6" stroke="#fff6f8" strokeWidth="1.4" />
    </svg>
  );
}
