// app/page.tsx
import HomeMenu from '../components/HomeMenu';
// 確保數據導入路徑正確
import menuData from '../data/menuData.json';

// Next.js App Router 預設的首頁導出元件
export default function Home() {
  return (
    // 渲染 HomeMenu，並傳遞 JSON 數據
    <HomeMenu menuData={menuData} />
  );
}