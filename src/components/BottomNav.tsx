'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Coffee, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  if (pathname === '/login') return null;

  const navItems = [
    { href: '/', icon: Home, label: 'Đơn hàng' },
    { href: '/menu', icon: Coffee, label: 'Menu' },
    { href: '/stats', icon: BarChart3, label: 'Thống kê' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--nav-height)',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--glass-border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000,
      paddingBottom: 'env(safe-area-inset-bottom)', // for iPhone notch
    }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link 
            key={item.href} 
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'color 0.2s',
            }}
          >
            <Icon size={24} style={{ marginBottom: '4px' }} />
            <span style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
