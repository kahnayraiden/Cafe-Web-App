'use server';

import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' };
  }

  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as any;

    if (!user) {
      return { error: 'Sai tên đăng nhập hoặc mật khẩu.' };
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return { error: 'Sai tên đăng nhập hoặc mật khẩu.' };
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const session = await encrypt({ id: user.id, username: user.username, expires });

    const cookieStore = await cookies();
    cookieStore.set('session', session, {
      expires,
      httpOnly: true,
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Đã có lỗi xảy ra.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
