'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getOrders(date: string, paymentFilter?: string) {
  try {
    let sql = `SELECT * FROM orders WHERE order_date = ?`;
    const params: any[] = [date];

    if (paymentFilter && paymentFilter !== 'all') {
      sql += ` AND payment_method = ?`;
      params.push(paymentFilter);
    }

    sql += ` ORDER BY created_at DESC`;

    const stmt = db.prepare(sql);
    return stmt.all(...params) as any[];
  } catch (error) {
    console.error('Get orders error:', error);
    return [];
  }
}

export async function getOrderDetails(orderId: number) {
  try {
    const orderStmt = db.prepare(`SELECT payment_method FROM orders WHERE id = ?`);
    const order = orderStmt.get(orderId) as any;

    const stmt = db.prepare(`
      SELECT oi.*, m.name 
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `);
    const items = stmt.all(orderId) as any[];
    return { items, paymentMethod: order?.payment_method || 'cash' };
  } catch (error) {
    console.error('Get order details error:', error);
    return { items: [], paymentMethod: 'cash' };
  }
}

export async function createOrder(
  date: string,
  items: { id: number; quantity: number; price: number }[],
  paymentMethod: string
) {
  if (!items || items.length === 0) return { error: 'Đơn hàng trống.' };
  
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  try {
    const transaction = db.transaction(() => {
      const orderStmt = db.prepare('INSERT INTO orders (order_date, total_amount, payment_method) VALUES (?, ?, ?)');
      const info = orderStmt.run(date, totalAmount, paymentMethod);
      const orderId = info.lastInsertRowid;

      const itemStmt = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (?, ?, ?, ?)');
      for (const item of items) {
        itemStmt.run(orderId, item.id, item.quantity, item.price);
      }
      return orderId;
    });

    const orderId = transaction();
    revalidatePath('/');
    return { success: true, orderId };
  } catch (error) {
    console.error('Create order error:', error);
    return { error: 'Không thể tạo đơn hàng.' };
  }
}

export async function deleteOrder(orderId: number) {
  try {
    db.prepare('DELETE FROM order_items WHERE order_id = ?').run(orderId);
    db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete order error:', error);
    return { error: 'Không thể xóa đơn hàng.' };
  }
}
