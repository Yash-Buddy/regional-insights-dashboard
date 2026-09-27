export default function ChartTooltip({ x, y, visible, children }) {
    if (!visible) return null;
    return (
      <div
        className="pointer-events-none absolute z-50 rounded-lg border border-[#2a2a30] bg-[#1c1c22] px-3 py-2 text-xs text-gray-100 shadow-lg"
        style={{ left: x + 14, top: y + 14 }}
      >
        {children}
      </div>
    );
  }