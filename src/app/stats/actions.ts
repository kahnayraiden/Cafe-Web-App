'use server';

import db from '@/lib/db';

export async function getMonthlyStats(monthStr: string) {
  // monthStr is like "YYYY-MM"
  const startDate = `${monthStr}-01`;
  const endDate = `${monthStr}-31`;

  try {
    // 1. Total revenue and orders count
    const summaryStmt = db.prepare(`
      SELECT COUNT(id) as totalOrders, SUM(total_amount) as totalRevenue 
      FROM orders 
      WHERE order_date >= ? AND order_date <= ?
    `);
    const summary = summaryStmt.get(startDate, endDate) as { totalOrders: number, totalRevenue: number };

    // 2. Best selling items
    const topItemsStmt = db.prepare(`
      SELECT m.name, SUM(oi.quantity) as totalSold, SUM(oi.quantity * oi.price_at_time) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE o.order_date >= ? AND o.order_date <= ?
      GROUP BY m.id
      ORDER BY totalSold DESC
      LIMIT 10
    `);
    const topItems = topItemsStmt.all(startDate, endDate) as { name: string, totalSold: number, revenue: number }[];

    // 3. Daily breakdown
    const dailyStmt = db.prepare(`
      SELECT order_date as date, COUNT(id) as orderCount, SUM(total_amount) as revenue
      FROM orders
      WHERE order_date >= ? AND order_date <= ?
      GROUP BY order_date
      ORDER BY order_date DESC
    `);
    const dailyStats = dailyStmt.all(startDate, endDate) as { date: string, orderCount: number, revenue: number }[];

    return {
      totalOrders: summary.totalOrders || 0,
      totalRevenue: summary.totalRevenue || 0,
      topItems,
      dailyStats,
    };
  } catch (error) {
    console.error('Get stats error:', error);
    return { totalOrders: 0, totalRevenue: 0, topItems: [], dailyStats: [] };
  }
}

export async function getDailyDetail(date: string) {
  try {
    // Summary for the day
    const summaryStmt = db.prepare(`
      SELECT COUNT(id) as totalOrders, SUM(total_amount) as totalRevenue
      FROM orders
      WHERE order_date = ?
    `);
    const summary = summaryStmt.get(date) as { totalOrders: number; totalRevenue: number };

    // Items sold that day
    const itemsStmt = db.prepare(`
      SELECT m.name, SUM(oi.quantity) as totalSold, SUM(oi.quantity * oi.price_at_time) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE o.order_date = ?
      GROUP BY m.id
      ORDER BY totalSold DESC
    `);
    const items = itemsStmt.all(date) as { name: string; totalSold: number; revenue: number }[];

    return {
      totalOrders: summary.totalOrders || 0,
      totalRevenue: summary.totalRevenue || 0,
      items,
    };
  } catch (error) {
    console.error('Get daily detail error:', error);
    return { totalOrders: 0, totalRevenue: 0, items: [] };
  }
}
