import { G } from "../constants/tokens.js";

export function AuthSwitchLink({ prefix, linkText, onClick }) {
  return (
    <p style={{ textAlign: "center", fontSize: 13, color: G.slate600, marginTop: 20, lineHeight: 1.5 }}>
      {prefix}{" "}
      <button
        type="button"
        onClick={onClick}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          font: "inherit",
          fontWeight: 700,
          color: G.green700,
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        {linkText}
      </button>
    </p>
  );
}
