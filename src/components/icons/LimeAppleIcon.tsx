interface LimeIconProps {
  className?: string;
  size?: number;
}

export function LimeAppleIcon({ className = "size-5", size }: LimeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        fill="#8ef000"
        d="M15.22 3.54c-.66.8-1.57 1.3-2.47 1.22-.16-.9.23-1.83.82-2.46.64-.69 1.64-1.2 2.45-1.3.1.92-.25 1.83-.8 2.54z"
      />
      <path
        fill="#8ef000"
        d="M17.18 12.37c.03 2.76 2.42 3.68 2.45 3.7-.02.07-.38 1.32-1.27 2.61-.77 1.12-1.56 2.23-2.82 2.26-1.24.02-1.63-.74-3.06-.74-1.42 0-1.86.72-3.05.76-1.24.05-2.17-1.24-2.95-2.37-1.6-2.31-2.83-6.52-1.18-9.38.82-1.42 2.28-2.32 3.86-2.35 1.22-.02 2.37.82 3.12.82.74 0 2.14-.99 3.61-.84.62.03 2.35.25 3.46 1.88-.09.06-2.07 1.2-2.05 3.45z"
      />
    </svg>
  );
}
