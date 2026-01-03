import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/ui/LoadingScreen';

const Scene = dynamic(() => import('@/components/three/Scene'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function HomePage() {
  return (
    <>
      {/* Fixed 3D canvas background */}
      <div className="scene-fixed">
        <Scene />
      </div>

      {/* Scrollable content overlay */}
      <main className="scroll-container">
        <header className="site-header">
          <h1 className="site-title">NUWRRRLD</h1>
        </header>

        {/* Scroll spacer for camera navigation */}
        <div className="scroll-spacer" />

        <footer className="site-footer">
          <p className="footer-text">Scroll to explore</p>
        </footer>
      </main>
    </>
  );
}
