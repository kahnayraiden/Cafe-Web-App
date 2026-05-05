import { NextResponse } from 'next/server';
import db from '@/lib/db';
import * as xlsx from 'xlsx';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // e.g. "2026-05"

  if (!month) {
    return new NextResponse('Missing month parameter', { status: 400 });
  }

  try {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`; // Simple approximation, SQLite handles date string comparison

    const stmt = db.prepare(`
      SELECT o.id as OrderId, o.order_date as Date, m.name as ItemName, oi.quantity as Quantity, oi.price_at_time as Price, (oi.quantity * oi.price_at_time) as Total
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE o.order_date >= ? AND o.order_date <= ?
      ORDER BY o.order_date DESC, o.id DESC
    `);
    
    const data = stmt.all(startDate, endDate);

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'ThongKe');

    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="ThongKe_${month}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return new NextResponse('Lỗi xuất file', { status: 500 });
  }
}
