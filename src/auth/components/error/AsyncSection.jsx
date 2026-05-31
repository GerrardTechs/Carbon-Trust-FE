/**
 * AsyncSection.jsx
 * Satu komponen yang menggabungkan ErrorBoundary + Suspense.
 * Dipakai di setiap section yang fetch data async.
 *
 * Usage:
 *   <AsyncSection label="Market Projects" skeleton={<ProjectsSkeleton />}>
 *     <ProjectList ... />
 *   </AsyncSection>
 */
import { Suspense } from "react";
import { ErrorBoundary } from "./ErrorBoundary.jsx";

export function AsyncSection({
  children,
  label,
  skeleton = <DefaultSkeleton />,
  fallback,
  onRetry,
  className = "",
}) {
  return (
    <ErrorBoundary label={label} fallback={fallback} onRetry={onRetry}>
      <Suspense fallback={skeleton}>
        <div className={className}>{children}</div>
      </Suspense>
    </ErrorBoundary>
  );
}

function DefaultSkeleton() {
  return (
    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      {[80, 60, 90].map((w, i) => (
        <div
          key={i}
          style={{
            height: 16,
            width: `${w}%`,
            borderRadius: 8,
            background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}