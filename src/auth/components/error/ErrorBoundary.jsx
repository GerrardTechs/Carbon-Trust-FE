/**
 * ErrorBoundary.jsx
 * Granular fault-isolation wrapper. Setiap komponen data-fetch
 * membungkus dirinya dengan ini agar error tidak propagate ke atas.
 *
 * Usage:
 *   <ErrorBoundary label="Dashboard KPI">
 *     <KpiCards ... />
 *   </ErrorBoundary>
 */
import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Kirim ke monitoring jika ada (Sentry, dll)
    if (typeof window.__carbonErrorLog === "function") {
      window.__carbonErrorLog({ error, componentStack: info.componentStack, label: this.props.label });
    }
    if (import.meta.env.DEV) {
      console.error(`[ErrorBoundary: ${this.props.label ?? "unknown"}]`, error, info);
    }
  }

  retry() {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { label = "Komponen", fallback } = this.props;

    // Kalau ada custom fallback dari parent, pakai itu
    if (fallback) return fallback(this.state.error, () => this.retry());

    return (
      <div
        role="alert"
        style={{
          margin: "12px 16px",
          padding: "14px 16px",
          borderRadius: 14,
          background: "#fff1f2",
          border: "1.5px solid #fecdd3",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#9f1239", marginBottom: 2 }}>
            Gagal memuat {label}
          </p>
          {import.meta.env.DEV && (
            <p style={{ fontSize: 11, color: "#be123c", fontFamily: "monospace", marginBottom: 8, wordBreak: "break-all" }}>
              {this.state.error?.message}
            </p>
          )}
          <button
            onClick={() => this.retry()}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "5px 14px",
              borderRadius: 8,
              border: "none",
              background: "#be123c",
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            🔄 Coba Lagi
          </button>
        </div>
      </div>
    );
  }
}

/**
 * withErrorBoundary — HOC untuk komponen fungsional.
 *
 * Usage:
 *   export default withErrorBoundary(MyComponent, { label: "My Section" });
 */
export function withErrorBoundary(Component, options = {}) {
  const Wrapped = (props) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );
  Wrapped.displayName = `WithErrorBoundary(${Component.displayName ?? Component.name})`;
  return Wrapped;
}