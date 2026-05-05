'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from './actions';
import { Coffee } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const res = await login(formData);
    
    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '50%', marginBottom: '24px' }}>
          <Coffee size={48} color="var(--accent)" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Cà Phê Quản Lý</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'center' }}>Đăng nhập để tiếp tục</p>

        <form action={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <div>
            <input 
              name="username" 
              type="text" 
              placeholder="Tên đăng nhập" 
              className="input-field" 
              required
            />
          </div>
          <div>
            <input 
              name="password" 
              type="password" 
              placeholder="Mật khẩu" 
              className="input-field" 
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
