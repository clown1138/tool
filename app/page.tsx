import HomeMenu from '../components/HomeMenu';
import menuData from '../data/menuData.json';

export default function Home() {
  return (
    <HomeMenu menuData={menuData} />
  );
}