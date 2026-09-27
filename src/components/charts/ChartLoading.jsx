export default function ChartLoading({ label = 'Loading data…' }) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-3 text-gray-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2a2a30] border-t-blue-500" />
        <span className="text-xs">{label}</span>
      </div>
    );
  }