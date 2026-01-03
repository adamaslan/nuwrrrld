import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/ui/LoadingScreen';

const Scene = dynamic(() => import('@/components/three/Scene'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function HomePage() {
  return (
    <main className="scene-fullscreen">
      <Scene />
      <header className="site-header-overlay">
        <h1 className="site-title">NUWRRRLD</h1>
      </header>
      <footer className="site-footer-overlay">
        <p className="footer-text">Drag to orbit • Scroll to zoom</p>
      </footer>
    </main>
  );
}
