import { getMenuItems } from './actions';
import MenuClient from './MenuClient';

export default async function MenuPage() {
  const items = await getMenuItems();

  return (
    <div className="page-container">
      <h1 className="page-title">Thực Đơn</h1>
      <MenuClient initialItems={items} />
    </div>
  );
}
