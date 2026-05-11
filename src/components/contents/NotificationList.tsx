'use client';

import { useMemo, useState } from 'react';
import { Bell, User } from 'lucide-react';
import dayjs from 'dayjs';
import './NotificationList.scss';

const NotificationList = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      appNotificationId: '3',
      title: '수업 미리 알림',
      message: '[2026.04.03 (금) 09:00] [체어 | 리포머] 수업이 예정되어 있습니다.',
      time: '오전 09:12',
      fullDate: '2026년 04월 03일',
      isRead: false,
      iconType: 'AVATAR'
    },
    {
      appNotificationId: '1',
      title: '잔여횟수 미리 알림',
      message: '[마토바 미쿠]님! [그룹 레슨/50회]의 잔여횟수가 3 회 남았습니다.',
      time: '오후 02:30',
      fullDate: '2026년 05월 11일',
      centerName: '엠씨기구필라테스 김해점',
      isRead: true,
      iconType: 'LOGO'
    },
    {
      appNotificationId: '2',
      title: '잔여일 미리 알림',
      message: '[마토바 미쿠]님! [그룹 레슨/50회]의 잔여일이 3 일 남았습니다.',
      time: '오전 11:05',
      fullDate: '2026년 04월 04일',
      centerName: '엠씨기구필라테스 김해점',
      isRead: true,
      iconType: 'LOGO'
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.appNotificationId === id ? { ...n, isRead: true } : n
    ));
  };

  // Group and sort notifications
  const sortedGroupedNotifications = useMemo(() => {
    const parseDate = (dateStr: string) => {
      const match = dateStr.match(/(\d+)년 (\d+)월 (\d+)일/);
      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
      return dateStr;
    };

    const sorted = [...notifications].sort((a, b) => 
      dayjs(parseDate(b.fullDate)).unix() - dayjs(parseDate(a.fullDate)).unix()
    );

    const groups = sorted.reduce((acc, n) => {
      if (!acc[n.fullDate]) acc[n.fullDate] = [];
      acc[n.fullDate].push(n);
      return acc;
    }, {} as Record<string, AppNotification[]>);

    return Object.entries(groups).sort((a, b) => 
      dayjs(parseDate(b[0])).unix() - dayjs(parseDate(a[0])).unix()
    );
  }, [notifications]);

  const getDisplayDate = (fullDate: string) => {
    const parseDate = (dateStr: string) => {
      const match = dateStr.match(/(\d+)년 (\d+)월 (\d+)일/);
      if (match) return `${match[1]}-${match[2]}-${match[3]}`;
      return dateStr;
    };
    
    const targetDate = dayjs(parseDate(fullDate));
    const today = dayjs();
    
    if (targetDate.isSame(today, 'day')) return '오늘';
    if (targetDate.isSame(today.subtract(1, 'day'), 'day')) return '어제';
    return targetDate.format('M월 D일');
  };

  return (
    <div className="notification-list">
      <div className="list-header">
        <button className="mark-all-read" onClick={markAllAsRead}>모두 읽음으로 표시</button>
      </div>

      {sortedGroupedNotifications.map(([date, items]) => (
        <div key={date} className="date-group">
          <h3 className="group-date">{getDisplayDate(date)}</h3>
          <div className="notification-items">
            {items.map((item) => (
              <div 
                key={item.appNotificationId} 
                className={`notification-item ${!item.isRead ? 'unread' : ''}`}
                onClick={() => markAsRead(item.appNotificationId)}
              >
                <div className="icon-area">
                  {item.iconType === 'LOGO' ? (
                    <Bell className="logo-icon" />
                  ) : (
                    <div className="default-avatar">
                      <User size={24} />
                    </div>
                  )}
                </div>
                <div className="content-area">
                  <div className="header-row">
                    <div className="title-group">
                      <span className="item-title">{item.title}</span>
                      <span className="item-time">{item.time}</span>
                    </div>
                  </div>
                  <p className="item-message">{item.message}</p>
                  {item.centerName && <span className="item-footer">{item.centerName}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
