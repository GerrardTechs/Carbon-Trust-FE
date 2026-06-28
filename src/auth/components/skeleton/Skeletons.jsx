/**
 * Skeletons.jsx
 * Skeleton loaders untuk tiap section utama CarbonTrust.
 * Dipakai sebagai prop `skeleton` di <AsyncSection>.
 */

const CSS = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .sk-pulse {
    background: linear-gradient(90deg, #f0f4f0 25%, #e4ebe4 50%, #f0f4f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
    border-radius: 8px;
  }
`;

function SkBase({ style, className = "" }) {
  return <div className={`sk-pulse ${className}`} style={style} />;
}

/** KPI cards (3 kartu angka di Dashboard) */
export function KpiSkeleton() {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 12, border: "1px solid #e5e7eb" }}>
            <SkBase style={{ height: 24, width: 36, borderRadius: 6, marginBottom: 6 }} />
            <SkBase style={{ height: 20, width: "70%", marginBottom: 4 }} />
            <SkBase style={{ height: 12, width: "50%" }} />
          </div>
        ))}
      </div>
    </>
  );
}

/** Parcel list rows */
export function ParcelListSkeleton({ count = 3 }) {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 14, padding: 14,
            border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12,
          }}>
            <SkBase style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <SkBase style={{ height: 13, width: "65%", marginBottom: 6 }} />
              <SkBase style={{ height: 11, width: "45%" }} />
            </div>
            <SkBase style={{ height: 22, width: 60, borderRadius: 99 }} />
          </div>
        ))}
      </div>
    </>
  );
}

/** Market project cards */
export function MarketSkeleton({ count = 4 }) {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 16, padding: 16,
            border: "1px solid #e5e7eb",
          }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              <SkBase style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <SkBase style={{ height: 14, width: "70%", marginBottom: 6 }} />
                <SkBase style={{ height: 11, width: "50%", marginBottom: 6 }} />
                <SkBase style={{ height: 11, width: "40%" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
              {[0, 1, 2, 3].map(j => (
                <SkBase key={j} style={{ height: 38, borderRadius: 8 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Admin overview */
export function AdminSkeleton() {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ background: "#1e293b", borderRadius: 14, padding: 14 }}>
              <SkBase style={{ height: 12, width: "60%", marginBottom: 8, background: "#334155" }} />
              <SkBase style={{ height: 24, width: "80%", background: "#334155" }} />
            </div>
          ))}
        </div>
        <SkBase style={{ height: 40, borderRadius: 12 }} />
        {[0, 1, 2].map(i => (
          <SkBase key={i} style={{ height: 64, borderRadius: 12 }} />
        ))}
      </div>
    </>
  );
}

/** Profile company cards */
export function ProfileSkeleton() {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #e5e7eb" }}>
          <SkBase style={{ height: 80, width: "100%", borderRadius: 12, marginBottom: 12 }} />
          <SkBase style={{ height: 14, width: "60%", marginBottom: 8 }} />
          <SkBase style={{ height: 12, width: "40%" }} />
        </div>
        {[0, 1].map(i => (
          <SkBase key={i} style={{ height: 56, borderRadius: 14 }} />
        ))}
      </div>
    </>
  );
}

/** PublicView project cards */
export function PublicViewSkeleton({ count = 5 }) {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: 14, display: "flex", gap: 12 }}>
              <SkBase style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <SkBase style={{ height: 13, width: "65%", marginBottom: 6 }} />
                <SkBase style={{ height: 11, width: "45%" }} />
              </div>
              <SkBase style={{ height: 36, width: 44, borderRadius: 8 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderTop: "1px solid #f1f5f9" }}>
              {[0, 1, 2, 3].map(j => (
                <div key={j} style={{ padding: "10px 8px", textAlign: "center", borderRight: j < 3 ? "1px solid #f1f5f9" : "none" }}>
                  <SkBase style={{ height: 12, width: "60%", margin: "0 auto 4px" }} />
                  <SkBase style={{ height: 10, width: "40%", margin: "0 auto" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Generic card skeleton */
export function CardSkeleton({ lines = 3, height = 80 }) {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ margin: "8px 16px", background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #e5e7eb" }}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkBase key={i} style={{
            height: i === 0 ? 16 : 12,
            width: i === 0 ? "70%" : `${45 + i * 10}%`,
            marginBottom: i < lines - 1 ? 8 : 0,
          }} />
        ))}
      </div>
    </>
  );
}