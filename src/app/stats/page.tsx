import { getMonthlyStats } from './actions';
import StatsClient from './StatsClient';

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const selectedMonth = resolvedSearchParams.month || currentMonth;

  const stats = await getMonthlyStats(selectedMonth);

  return (
    <div className="page-container">
      <h1 className="page-title">Thống Kê</h1>
      <StatsClient initialMonth={selectedMonth} stats={stats} />
    </div>
  );
}
