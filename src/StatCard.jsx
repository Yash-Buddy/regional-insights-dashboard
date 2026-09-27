import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function StatCard({ label, value, prefix = '', suffix = '', decimals = 0, accent = '#116B09' }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const interpolate = d3.interpolateNumber(0, value);
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      setDisplay(interpolate(d3.easeCubicOut(t)));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return (
    <div
      className="h-full rounded-2xl p-5 flex flex-col justify-between text-white"
      style={{ background: accent }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-80">{label}</span>
        <span className="opacity-60 text-lg leading-none">···</span>
      </div>
      <div className="text-3xl font-bold">
        {prefix}
        {display.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
        {suffix}
      </div>
    </div>
  );
}