'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, CalendarDays, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { getDailyDetail } from './actions';

type StatsType = {
  totalOrders: number;
  totalRevenue: number;
  topItems: { name: string; totalSold: number; revenue: number }[];
  dailyStats: { date: string; orderCount: number; revenue: number }[];
};

type DailyDetail = {
  totalOrders: number;
  totalRevenue: number;
  items: { name: string; totalSold: number; revenue: number }[];
};

type Tab = 'overview' | 'daily';

export default function StatsClient({ initialMonth, stats }: { initialMonth: string; stats: StatsType }) {
  const router = useRouter();
  const [month, setMonth] = useState(initialMonth);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<DailyDetail | null>(null);
  const [loadingDay, setLoadingDay] = useState<string | null>(null);

  function handleMonthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newMonth = e.target.value;
    setMonth(newMonth);
    setSelectedDay(null);
    setDayDetail(null);
    router.push(`/stats?month=${newMonth}`);
  }

  function handleExport() {
    window.open(`/api/export?month=${month}`, '_blank');
  }

  async function handleDayClick(date: string) {
    if (selectedDay === date) {
      setSelectedDay(null);
      setDayDetail(null);
      return;
    }
    setLoadingDay(date);
    setSelectedDay(date);
    const detail = await getDailyDetail(date);
    setDayDetail(detail);
    setLoadingDay(null);
  }

  const maxDailyRevenue = stats.dailyStats.length > 0
    ? Math.max(...stats.dailyStats.map(d => d.revenue))
    : 0;

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
  }

  function formatDateFull(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const tabStyle = (tab: Tab) => ({
    flex: 1,
    padding: '12px 0',
    textAlign: 'center' as const,
    fontWeight: 600,
    fontSize: '15px',
    borderRadius: '10px',
    transition: 'all 0.25s ease',
    background: activeTab === tab ? 'var(--accent)' : 'transparent',
    color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Month picker + Export */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="month"
          value={month}
          onChange={handleMonthChange}
          className="input-field"
          style={{ flex: 1 }}
        />
        <button onClick={handleExport} className="btn-primary" style={{ width: 'auto', background: 'var(--success)' }}>
          <Download size={20} /> Excel
        </button>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '4px',
      }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>
          Tổng quan
        </button>
        <button style={tabStyle('daily')} onClick={() => setActiveTab('daily')}>
          Theo ngày
        </button>
      </div>

      {/* ===== TAB: Tổng quan ===== */}
      {activeTab === 'overview' && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Tổng đơn hàng</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalOrders}</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Tổng doanh thu</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>
                {stats.totalRevenue.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>

          {/* Top items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <TrendingUp size={20} color="var(--success)" />
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Món bán chạy</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.topItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                Chưa có dữ liệu bán hàng.
              </div>
            ) : (
              stats.topItems.map((item, index) => (
                <div key={index} className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: index === 0 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : index === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : index === 2 ? 'linear-gradient(135deg, #b45309, #78350f)' : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '16px', fontSize: '14px'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Đã bán: {item.totalSold} ly</div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    {item.revenue.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ===== TAB: Theo ngày ===== */}
      {activeTab === 'daily' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Doanh thu theo ngày</h3>
          </div>

          {stats.dailyStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
              Chưa có dữ liệu trong tháng này.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.dailyStats.map((day) => {
                const isSelected = selectedDay === day.date;
                return (
                  <div key={day.date}>
                    {/* Day row */}
                    <div
                      onClick={() => handleDayClick(day.date)}
                      className="glass-panel"
                      style={{
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        borderColor: isSelected ? 'var(--accent)' : undefined,
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <div style={{ minWidth: '80px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{formatDate(day.date)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{day.orderCount} đơn</div>
                      </div>
                      <div style={{ flex: 1, position: 'relative', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${maxDailyRevenue > 0 ? (day.revenue / maxDailyRevenue) * 100 : 0}%`,
                          background: 'linear-gradient(90deg, var(--accent), #8b5cf6)',
                          borderRadius: '8px',
                          transition: 'width 0.5s ease',
                          minWidth: '4px',
                        }} />
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', minWidth: '90px', textAlign: 'right' }}>
                        {day.revenue.toLocaleString('vi-VN')} đ
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {isSelected ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isSelected && (
                      <div style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid var(--glass-border)',
                        borderTop: 'none',
                        borderRadius: '0 0 16px 16px',
                        padding: '16px',
                      }}>
                        {loadingDay === day.date ? (
                          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
                            Đang tải...
                          </div>
                        ) : dayDetail ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {formatDateFull(day.date)}
                              </span>
                              <span style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 600 }}>
                                {dayDetail.totalOrders} đơn · {dayDetail.totalRevenue.toLocaleString('vi-VN')} đ
                              </span>
                            </div>

                            {dayDetail.items.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Không có chi tiết.
                              </div>
                            ) : (
                              dayDetail.items.map((item, idx) => (
                                <div key={idx} style={{
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                                }}>
                                  <div>
                                    <div style={{ fontWeight: 500, fontSize: '15px' }}>{item.name}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Bán {item.totalSold} ly</div>
                                  </div>
                                  <div style={{ fontWeight: 600, fontSize: '15px' }}>
                                    {item.revenue.toLocaleString('vi-VN')} đ
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
