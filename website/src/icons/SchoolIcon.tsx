import React from "react";

export const SchoolIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM3.5 12.06v5.44L12 22l8.5-4.5v-5.44L12 16.5 3.5 12.06z"
      />
    </svg>
  );
};
