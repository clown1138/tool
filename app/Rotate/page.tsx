// app/page.js
import TransitionSlider from '@/components/CustomWheel'; // 假設路徑正確

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <TransitionSlider />
    </main>
  );
}
