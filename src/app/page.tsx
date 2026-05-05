import { getOrders } from './actions';
import { getMenuItems } from './menu/actions';
import OrdersClient from './OrdersClient';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; payment?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const today = new Date().toLocaleDateString('en-CA');
  const selectedDate = resolvedSearchParams.date || today;
  const paymentFilter = resolvedSearchParams.payment || 'all';

  const orders = await getOrders(selectedDate, paymentFilter);
  const menuItems = await getMenuItems();

  return (
    <div className="page-container">
      <h1 className="page-title">Đơn Hàng</h1>
      <OrdersClient
        initialDate={selectedDate}
        initialPaymentFilter={paymentFilter}
        orders={orders}
        menuItems={menuItems}
      />
    </div>
  );
}
