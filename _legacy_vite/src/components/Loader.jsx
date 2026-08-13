// src/components/Loader.jsx
import { useEffect, useState } from 'react';

export default function Loader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading]     = useState(false);

  useEffect(() => {
    // Simulate progress: fast at first, then slows near 90%, jumps to 100 at end
    const steps = [
      { target: 40,  delay: 80  },
      { target: 70,  delay: 180 },
      { target: 88,  delay: 300 },
      { target: 100, delay: 500 },
    ];

    let current = 0;
    let timeouts = [];

    steps.forEach(({ target, delay }) => {
      const t = setTimeout(() => {
        setProgress(target);
        if (target === 100) {
          // brief pause at 100%, then fade out
          const t2 = setTimeout(() => {
            setFading(true);
            const t3 = setTimeout(onDone, 420); // wait for fade transition
            timeouts.push(t3);
          }, 280);
          timeouts.push(t2);
        }
      }, (current += delay));
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className={`loader-backdrop ${fading ? 'loader-fade-out' : ''}`}>
      <div className="loader-content">
        {/* Spinning logo */}
        <div className="loader-logo-wrap w-10 h-10">
          <img
            src="/Logo.svg"
            alt="PromptBoard"
            className="loader-logo"
          />
        </div>

        {/* Progress bar */}
        <div className="loader-bar-track">
          <div
            className="loader-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="loader-pct">{progress}%</div>
      </div>
    </div>
  );
}
