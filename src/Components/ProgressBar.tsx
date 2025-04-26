import React from "react";

interface ProgressBarProps {
  totalRaised: number;
  tripTotal: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalRaised, tripTotal }) => {
  const percentage = Math.min((totalRaised / tripTotal) * 100, 100).toFixed(1);

  return (
    <div className="progress-container">
      <div className="progress-bar-wrapper">
        <div className="progress-bar" style={{ width: `${percentage}%` }} />
      </div>
      <p>{`R$ ${totalRaised.toFixed(2)} / R$ ${tripTotal.toFixed(2)} (${percentage}%)`}</p>
    </div>
  );
};

export default ProgressBar;
