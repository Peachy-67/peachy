import React from "react";
import "../styles/UiPolishImprovements.css";

export default function UIButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  ariaLabel,
}) {
  return (
    <button
      type={type}
      className="peachy-button transition-smooth"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || undefined}
    >
      {children}
    </button>
  );
}