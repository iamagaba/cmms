import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);


const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Helper: Count repairs per week number
function getRepairCountsByWeek(workOrders: { created_at: string }[], year: number) {
  const counts: Record<number, number> = {};
  workOrders.forEach((wo) => {
    const d = dayjs(wo.created_at);
    if (d.year() === year) {
      const week = d.week();
      counts[week] = (counts[week] || 0) + 1;
    }
  });
  return counts;
}

function getWeeksByMonth(year: number): { [month: number]: number[] } {
  const months: { [month: number]: number[] } = {};
  for (let m = 0; m < 12; m++) months[m] = [];
  for (let w = 1; w <= 53; w++) {
    const d = dayjs().year(year).week(w).startOf("week");
    const month = d.month();
    if (month >= 0 && month < 12 && !months[month].includes(w)) months[month].push(w);
  }
  return months;
}

export const RepairActivityTimeline = ({
  workOrders,
  selectedWeek,
  onSelectWeek,
}: {
  workOrders: { created_at: string }[];
  selectedWeek?: number | null;
  onSelectWeek?: (week: number) => void;
}) => {
  const year = dayjs().year();
  const weeksByMonth = getWeeksByMonth(year);
  const repairCounts = getRepairCountsByWeek(workOrders, year);
  // Color for weeks with work orders
  function getCellColor(count: number, isSelected: boolean) {
    if (isSelected) return 'var(--mantine-color-purple-6)';
    if (count === 0) return 'var(--mantine-color-gray-1)';
    if (count === 1) return 'var(--mantine-color-green-2)';
    if (count === 2) return 'var(--mantine-color-yellow-3)';
    if (count === 3) return 'var(--mantine-color-yellow-4)';
    if (count >= 4) return 'var(--mantine-color-red-4)';
    return 'var(--mantine-color-gray-1)';
  }
  return (
    <div style={{ background: 'var(--mantine-color-body)', borderRadius: 'var(--mantine-radius-md)', padding: 16, boxShadow: 'var(--mantine-shadow-sm)', overflowX: 'auto' }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Repair Activity Timeline</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 8,
          width: '100%',
          minWidth: 0,
        }}
      >
        {monthNames.map((month, mIdx) => (
          <div key={month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15, whiteSpace: 'nowrap' }}>{month}</div>
            {weeksByMonth[mIdx].map((week) => {
              const count = repairCounts[week] || 0;
              const isSelected = selectedWeek === week;
              return (
                <div
                  key={week}
                  style={{
                    background: getCellColor(count, isSelected),
                    borderRadius: 6,
                    marginBottom: 4,
                    width: '100%',
                    textAlign: 'center',
                    padding: '2px 0',
                    fontSize: 15,
                    minHeight: 22,
                    color: isSelected ? 'white' : 'var(--mantine-color-text)',
                    fontWeight: 500,
                    boxShadow: 'none',
                    cursor: count > 0 ? 'pointer' : 'default',
                    outline: isSelected ? '2px solid var(--mantine-color-purple-6)' : 'none',
                    transition: 'all 0.2s',
                    userSelect: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => count > 0 && onSelectWeek?.(week)}
                  title={count > 0 ? `${count} work order${count > 1 ? 's' : ''}` : undefined}
                >
                  {week}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
