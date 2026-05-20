'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import SlideDialog from '@/components/dialog/SlideDialog';
import NotificationList from '@/components/contents/NotificationList';
import SseStatus from '@/components/contents/SseStatus';
import { useAuth } from '@/providers/AuthProvider';
import { useNotification } from '@/providers/NotificationProvider';
import './Header.scss';

const Header = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadCount } = useNotification();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [selectedCenter, setSelectedCenter] = useState('전체 센터');

  useEffect(() => {
    // Only run on client
    const savedCenter = localStorage.getItem('selectedCenter');
    if (savedCenter) {
      setSelectedCenter(savedCenter);
    }
  }, [pathname]);

  const getPageConfig = (path: string) => {
    switch (path) {
      case '/':
        const userName = user?.name || '사용자';
        return { title: `안녕하세요, ${userName}님!` };
      case '/lounge':
        return { title: '라운지' };
      case '/reserve':
        return { title: '수업예약' };
      case '/profile':
        return { title: '마이페이지' };
      case '/notice':
        return { title: '공지사항' };
      default:
        return { title: '' };
    }
  };

  const { title } = getPageConfig(pathname);

  if (!title) return null;

  return (
    <>
      <header className="header">
        <h1 className="title">{title}</h1>
        <div className="header-actions">
          <button className="action-btn" onClick={() => setIsNotificationOpen(true)}>
            <Bell size={22} />
            {unreadCount > 0 && <span className="unread-dot" />}
          </button>
        </div>
      </header>

      <SlideDialog
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        title="알림"
        rightElement={<SseStatus />}
        noPadding
      >
        <NotificationList />
      </SlideDialog>
    </>
  );
};

export default Header;
