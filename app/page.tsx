import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { ScreenProvider } from '@/context/ScreenContext';
import { CameraProvider } from '@/context/CameraContext';
import RemoteControl from '@/components/ui/RemoteControl';

const Scene = dynamic(() => import('@/components/three/Scene'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function HomePage() {
  return (
    <ScreenProvider>
      <CameraProvider>
      <main className="scene-fullscreen">
        <Scene />
        <header className="site-header-overlay">
          <h1 className="site-title">NUWRRRLD</h1>
        </header>
        <footer className="site-footer-overlay">
          <p className="footer-text">Drag to orbit • Scroll to zoom • Tap screen to select</p>
        </footer>
        <RemoteControl />
      </main>
      </CameraProvider>
    </ScreenProvider>
  );
}
