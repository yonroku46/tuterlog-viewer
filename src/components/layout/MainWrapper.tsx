'use client';

import { usePathname } from 'next/navigation';
import { servicePrefix } from '@/providers/AuthProvider';
import Header from './Header';
import BottomNav from './BottomNav';

interface MainWrapperProps {
  children: React.ReactNode;
}

export default function MainWrapper({ children }: MainWrapperProps) {
  const pathname = usePathname();
  const isService = pathname ? pathname.startsWith(servicePrefix) : false;

  return (
    <main className={isService ? 'service-main' : 'public-main'}>
      <div className="content-area">
        <Header />
        {children}
      </div>
      <BottomNav />
      <div id="dialog-root" />
    </main>
  );
}
