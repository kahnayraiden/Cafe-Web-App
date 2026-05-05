'use client';

import { useState } from 'react';
import { addMenuItem, deleteMenuItem } from './actions';
import { Plus, Trash2 } from 'lucide-react';

type MenuItem = { id: number; name: string; price: number };

export default function MenuClient({ initialItems }: { initialItems: MenuItem[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAdd(formData: FormData) {
    setIsLoading(true);
    await addMenuItem(formData);
    setIsAdding(false);
    setIsLoading(false);
  }

  async function handleDelete(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa món này?')) {
      await deleteMenuItem(id);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {isAdding ? (
        <form action={handleAdd} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontWeight: 600 }}>Thêm món mới</h3>
          <input type="text" name="name" placeholder="Tên món" className="input-field" required />
          <input type="number" name="price" placeholder="Giá (VNĐ)" className="input-field" required min="0" step="1000" />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn-primary" disabled={isLoading}>Lưu</button>
            <button type="button" onClick={() => setIsAdding(false)} className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)' }}>Hủy</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setIsAdding(true)} className="btn-primary" style={{ background: 'var(--success)' }}>
          <Plus size={20} /> Thêm món mới
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {initialItems.map((item) => (
          <div key={item.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '18px' }}>{item.name}</div>
              <div style={{ color: 'var(--accent)', fontWeight: 500 }}>{item.price.toLocaleString('vi-VN')} đ</div>
            </div>
            <button onClick={() => handleDelete(item.id)} className="btn-danger">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {initialItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
            Chưa có món nào trong menu.
          </div>
        )}
      </div>
    </div>
  );
}
