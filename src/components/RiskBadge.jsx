import React from "react";

const RiskBadge = ({ level }) => {
  if (!level) return null;

  const getStyles = () => {
    switch (level) {
      case "HIGH":
        return {
          backgroundColor: "#fdecea",
          color: "#b71c1c",
          border: "1px solid #f44336",
          emoji: "🔴"
        };
      case "MEDIUM":
        return {
          backgroundColor: "#fff8e1",
          color: "#e65100",
          border: "1px solid #ff9800",
          emoji: "🟡"
        };
      case "LOW":
        return {
          backgroundColor: "#e8f5e9",
          color: "#1b5e20",
          border: "1px solid #4caf50",
          emoji: "🟢"
        };
      default:
        return {};
    }
  };

  const styles = getStyles();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "bold",
        fontSize: "14px",
        ...styles
      }}
    >
      <span>{styles.emoji}</span>
      <span>{level} RISK</span>
    </div>
  );
};

export default RiskBadge;