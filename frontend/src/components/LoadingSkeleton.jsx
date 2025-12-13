import React, { useEffect, useState } from 'react';
import '../styles/LoadingSkeleton.css';

function LoadingSkeleton({ duration = 5000 }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min((elapsed / duration) * 100, 100);
      setProgress(percent);
      if (percent === 100) clearInterval(timer);
    }, 20);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div className="skeleton-container">
      <div className="cup">
        <div
          className="water"
          style={{ height: `${progress}%` }}
        >
          <div className="wave wave1" />
          <div className="wave wave2" />
        </div>
      </div>
      <div className="loading-text">Rising up...</div>
    </div>
  );
}

export default LoadingSkeleton;
 