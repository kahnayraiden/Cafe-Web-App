'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, getOrderDetails, deleteOrder } from './actions';
import { Plus, X, Receipt, Calendar, Banknote, Smartphone } from 'lucide-react';

type Order = { id: number; order_date: string; total_amount: number; created_at: string; payment_method: string };
type MenuItem = { id: number; name: string; price: number };

export default function OrdersClient({
  initialDate,
  initialPaymentFilter,
  orders,
  menuItems,
}: {
  initialDate: string;
  initialPaymentFilter: string;
  orders: Order[];
  menuItems: MenuItem[];
}) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [paymentFilter, setPaymentFilter] = useState(initialPaymentFilter);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ id: number; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [isLoading, setIsLoading] = useState(false);
  
  const [viewOrderId, setViewOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [viewPaymentMethod, setViewPaymentMethod] = useState<string>('cash');

  function navigate(newDate: string, newPayment: string) {
    const params = new URLSearchParams();
    params.set('date', newDate);
    if (newPayment !== 'all') params.set('payment', newPayment);
    router.push(`/?${params.toString()}`);
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value;
    setDate(newDate);
    navigate(newDate, paymentFilter);
  }

  function handlePaymentFilterChange(value: string) {
    setPaymentFilter(value);
    navigate(date, value);
  }

  async function handleCreateOrder() {
    if (selectedItems.length === 0) return;
    setIsLoading(true);
    
    const itemsToSubmit = selectedItems.map(item => {
      const menu = menuItems.find(m => m.id === item.id);
      return { id: item.id, quantity: item.quantity, price: menu?.price || 0 };
    });

    await createOrder(date, itemsToSubmit, paymentMethod);
    setIsAdding(false);
    setSelectedItems([]);
    setPaymentMethod('cash');
    setIsLoading(false);
  }

  async function handleViewDetails(orderId: number) {
    setViewOrderId(orderId);
    const result = await getOrderDetails(orderId);
    setOrderDetails(result.items);
    setViewPaymentMethod(result.paymentMethod);
  }

  const newOrderTotal = selectedItems.reduce((sum, item) => {
    const menu = menuItems.find(m => m.id === item.id);
    return sum + (menu?.price || 0) * item.quantity;
  }, 0);

  function paymentLabel(method: string) {
    return method === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt';
  }

  function paymentColor(method: string) {
    return method === 'transfer' ? '#8b5cf6' : 'var(--success)';
  }

  const filterBtnStyle = (value: string) => ({
    flex: 1,
    padding: '8px 0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600 as const,
    textAlign: 'center' as const,
    transition: 'all 0.2s',
    background: paymentFilter === value ? 'var(--accent)' : 'transparent',
    color: paymentFilter === value ? '#fff' : 'var(--text-secondary)',
  });

  const payMethodBtnStyle = (value: string) => ({
    flex: 1,
    padding: '12px 0',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600 as const,
    textAlign: 'center' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: '8px',
    transition: 'all 0.2s',
    background: paymentMethod === value
      ? (value === 'cash' ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.2)')
      : 'rgba(255,255,255,0.05)',
    color: paymentMethod === value
      ? (value === 'cash' ? 'var(--success)' : '#8b5cf6')
      : 'var(--text-secondary)',
    border: paymentMethod === value
      ? `1.5px solid ${value === 'cash' ? 'var(--success)' : '#8b5cf6'}`
      : '1.5px solid transparent',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Date picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Calendar color="var(--accent)" size={22} />
        <input 
          type="date" 
          value={date} 
          onChange={handleDateChange} 
          className="input-field" 
          style={{ flex: 1 }}
        />
      </div>

      {/* Payment filter */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '10px',
        padding: '4px',
      }}>
        <button style={filterBtnStyle('all')} onClick={() => handlePaymentFilterChange('all')}>Tất cả</button>
        <button style={filterBtnStyle('cash')} onClick={() => handlePaymentFilterChange('cash')}>💵 Tiền mặt</button>
        <button style={filterBtnStyle('transfer')} onClick={() => handlePaymentFilterChange('transfer')}>📱 Chuyển khoản</button>
      </div>

      <button onClick={() => setIsAdding(true)} className="btn-primary">
        <Plus size={20} /> Tạo Đơn Mới
      </button>

      {/* Orders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '8px' }}>
          Đơn đã bán ({orders.length})
        </h3>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
            Không có đơn hàng nào.
          </div>
        ) : (
          orders.map((order) => (
            <div 
              key={order.id} 
              className="glass-panel" 
              onClick={() => handleViewDetails(order.id)}
              style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Đơn #{order.id}</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: order.payment_method === 'transfer' ? 'rgba(139,92,246,0.2)' : 'rgba(34,197,94,0.2)',
                    color: paymentColor(order.payment_method),
                  }}>
                    {paymentLabel(order.payment_method)}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {new Date(order.created_at).toLocaleTimeString('vi-VN')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '18px' }}>
                  {order.total_amount.toLocaleString('vi-VN')} đ
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Bạn có chắc chắn muốn xóa đơn này?')) {
                      deleteOrder(order.id);
                    }
                  }}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: 'var(--danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 'bold', flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Details Modal */}
      {viewOrderId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', zIndex: 2000
        }}>
          <div className="glass-panel" style={{
            width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
            padding: '24px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
            maxHeight: '80vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Đơn #{viewOrderId}</h2>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: viewPaymentMethod === 'transfer' ? 'rgba(139,92,246,0.2)' : 'rgba(34,197,94,0.2)',
                  color: paymentColor(viewPaymentMethod),
                }}>
                  {paymentLabel(viewPaymentMethod)}
                </span>
              </div>
              <button onClick={() => setViewOrderId(null)}><X /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {orderDetails.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {item.quantity} x {item.price_at_time.toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {(item.quantity * item.price_at_time).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {isAdding && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', zIndex: 2000
        }}>
          <div className="glass-panel" style={{
            width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
            padding: '24px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Tạo Đơn Hàng</h2>
              <button onClick={() => setIsAdding(false)}><X /></button>
            </div>

            {/* Menu items */}
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {menuItems.map(item => {
                const selected = selectedItems.find(s => s.id === item.id);
                const quantity = selected ? selected.quantity : 0;
                
                return (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                      <div style={{ color: 'var(--accent)', fontSize: '14px' }}>{item.price.toLocaleString('vi-VN')} đ</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {quantity > 0 && (
                        <button 
                          onClick={() => {
                            if (quantity === 1) setSelectedItems(selectedItems.filter(s => s.id !== item.id));
                            else setSelectedItems(selectedItems.map(s => s.id === item.id ? { ...s, quantity: quantity - 1 } : s));
                          }}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}
                        >-</button>
                      )}
                      {quantity > 0 && <span style={{ width: '20px', textAlign: 'center' }}>{quantity}</span>}
                      <button 
                        onClick={() => {
                          if (quantity === 0) setSelectedItems([...selectedItems, { id: item.id, quantity: 1 }]);
                          else setSelectedItems(selectedItems.map(s => s.id === item.id ? { ...s, quantity: quantity + 1 } : s));
                        }}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'white' }}
                      >+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment method selector + total + submit */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Payment method */}
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Thanh toán bằng</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={payMethodBtnStyle('cash')} onClick={() => setPaymentMethod('cash')}>
                    <Banknote size={18} /> Tiền mặt
                  </button>
                  <button style={payMethodBtnStyle('transfer')} onClick={() => setPaymentMethod('transfer')}>
                    <Smartphone size={18} /> Chuyển khoản
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                <span>Tổng tiền:</span>
                <span style={{ color: 'var(--accent)' }}>{newOrderTotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <button 
                onClick={handleCreateOrder} 
                className="btn-primary" 
                disabled={isLoading || selectedItems.length === 0}
                style={{ height: '50px' }}
              >
                <Receipt size={20} />
                {isLoading ? 'Đang xử lý...' : 'Thanh Toán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
