'use client';

import { useState, useEffect } from 'react';
import { Megaphone, User } from 'lucide-react';
import SlideDialog from '@/components/dialog/SlideDialog';
import LoadingSpinner from '@/components/contents/LoadingSpinner';
import EmptyState from '@/components/contents/EmptyState';
import NoticeService, { NoticeType } from '@/api/service/NoticeService';
import './Notice.scss';

export default function NoticePage() {
  const [activeTab, setActiveTab] = useState<NoticeType>('center');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      setIsLoading(true);
      setNotices([]);
      try {
        const res = await NoticeService.getNoticeList(activeTab);
        if (res?.list) setNotices(res.list);
      } catch (err) {
        console.error('[NoticePage] fetchNotices', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, [activeTab]);

  return (
    <div className="notice-page">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'center' ? 'active' : ''}`}
          onClick={() => setActiveTab('center')}
        >
          센터 공지
        </button>
        <button
          className={`tab ${activeTab === 'service' ? 'active' : ''}`}
          onClick={() => setActiveTab('service')}
        >
          서비스 공지
        </button>
      </div>

      <div className="notice-list">
        {isLoading ? (
          <LoadingSpinner />
        ) : notices.length > 0 ? (
          notices.map(notice => (
            <button
              key={notice.noticeId}
              className="notice-item"
              onClick={() => setSelectedNotice(notice)}
            >
              <div className="notice-top">
                <span className={`tag ${notice.important ? 'important' : ''} ${notice.facility ? 'facility' : ''}`}>
                  {notice.tag}
                </span>
                <span className="date">{notice.date}</span>
              </div>
              <h2 className="notice-title">{notice.title}</h2>
            </button>
          ))
        ) : (
          <EmptyState icon={Megaphone} message="등록된 공지사항이 없습니다" />
        )}
      </div>

      <SlideDialog
        isOpen={selectedNotice !== null}
        onClose={() => setSelectedNotice(null)}
        title="공지사항"
        noPadding
      >
        {selectedNotice && (
          <div className="notice-detail">
            <div className="detail-header">
              <div className="detail-top">
                <span className={`tag ${selectedNotice.important ? 'important' : ''} ${selectedNotice.facility ? 'facility' : ''}`}>
                  {selectedNotice.tag}
                </span>
                <span className="date">{selectedNotice.date}</span>
              </div>
              <h1 className="title">{selectedNotice.title}</h1>
              <div className="meta">
                <div className="info-item">
                  <User size={14} />
                  <span>{selectedNotice.author}</span>
                </div>
              </div>
            </div>
            <div className="detail-body">
              {selectedNotice.content.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
            </div>
          </div>
        )}
      </SlideDialog>
    </div>
  );
}
