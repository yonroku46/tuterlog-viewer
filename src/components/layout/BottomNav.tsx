'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Calendar, Home, User, Megaphone } from 'lucide-react';
import './BottomNav.scss';

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { label: '라운지', icon: MessageSquare, href: '/lounge' },
    { label: '예약', icon: Calendar, href: '/reserve' },
    { label: '홈', icon: Home, href: '/' },
    { label: '마이페이지', icon: User, href: '/profile' },
    { label: '공지', icon: Megaphone, href: '/notice' },
  ];

  const hidePaths = ['/login', '/register', '/forgot-password'];
  if (hidePaths.includes(pathname)) return null;

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="icon" strokeWidth={isActive ? 2.5 : 2} />
            <span className="label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
