'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addMenuItem(formData: FormData) {
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);

  if (!name || isNaN(price)) {
    return { error: 'Dữ liệu không hợp lệ.' };
  }

  try {
    const stmt = db.prepare('INSERT INTO menu_items (name, price) VALUES (?, ?)');
    stmt.run(name, price);
    revalidatePath('/menu');
    return { success: true };
  } catch (error) {
    console.error('Add menu item error:', error);
    return { error: 'Không thể thêm món mới.' };
  }
}

export async function deleteMenuItem(id: number) {
  try {
    const stmt = db.prepare('DELETE FROM menu_items WHERE id = ?');
    stmt.run(id);
    revalidatePath('/menu');
    return { success: true };
  } catch (error) {
    console.error('Delete menu item error:', error);
    return { error: 'Không thể xóa món.' };
  }
}

export async function getMenuItems() {
  try {
    const stmt = db.prepare('SELECT * FROM menu_items ORDER BY name ASC');
    return stmt.all() as { id: number; name: string; price: number }[];
  } catch (error) {
    console.error('Get menu items error:', error);
    return [];
  }
}
