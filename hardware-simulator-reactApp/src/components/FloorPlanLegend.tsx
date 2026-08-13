export function FloorPlanLegend() {
  const items = [
    { color: '#22c55e', shadow: '0 0 6px rgba(34, 197, 94, 0.5)', label: 'ON' },
    { color: '#64748b', shadow: 'none', label: 'OFF' },
    { color: '#ef4444', shadow: '0 0 6px rgba(239, 68, 68, 0.5)', label: 'Error' },
    { color: '#f59e0b', shadow: '0 0 6px rgba(245, 158, 11, 0.4)', label: 'Disconnected' },
  ];

  return (
    <div className="flex items-center justify-center gap-5 mt-3 px-4 flex-wrap">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: item.color,
              boxShadow: item.shadow,
            }}
          />
          <span className="text-[0.72rem] text-[var(--text-muted)] font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
