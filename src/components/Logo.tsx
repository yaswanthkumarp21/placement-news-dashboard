/** OpsPulse mark: a rounded tile in the brand gradient with a pulse line (the "pulse" of operations) and a green beat dot. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="pn-logo-svg">
      <defs>
        <linearGradient id="ops-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd60a" />
          <stop offset="0.6" stopColor="#ffb347" />
          <stop offset="1" stopColor="#ff5fa2" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#ops-g)" />
      <path d="M4.5 17.5h5.5l2.6-7 4.2 14 3.2-9.5 1.6 2.5h5.9" fill="none" stroke="#09090b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="27" cy="8" r="2.6" fill="#5be3a4" stroke="#09090b" strokeWidth="1.4" />
    </svg>
  );
}
