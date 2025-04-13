import React from "react";

const ScoreCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white p-4 rounded-2xl shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default ScoreCard;