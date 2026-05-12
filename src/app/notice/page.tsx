'use client';

import { useState, useEffect } from 'react';
import { Megaphone, User } from 'lucide-react';
import SlideDialog from '@/components/dialog/SlideDialog';
import LoadingSpinner from '@/components/contents/LoadingSpinner';
import EmptyState from '@/components/contents/EmptyState';
import NoticeService, { NoticeType } from '@/api/service/NoticeService';
import { useInView } from 'react-intersection-observer';
import './Notice.scss';

export default function NoticePage() {
  const [activeTab, setActiveTab] = useState<NoticeType>('center');
  const [selectedNotice, setSelectedNotice] = useState<NoticeRes | null>(null);
  const [notices, setNotices] = useState<NoticeRes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchNotices = async (pageNum: number, isMore: boolean = false) => {
    if (isMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setNotices([]);
    }

    try {
      const res = await NoticeService.getNoticeList(activeTab, pageNum, 10);
      if (res?.list) {
        if (isMore) {
          setNotices(prev => [...prev, ...res.list]);
        } else {
          setNotices(res.list);
        }
        setHasMore(res.list.length === 10);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('[NoticePage] fetchNotices', err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 탭 변경 시 초기화
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchNotices(1, false);
  }, [activeTab]);

  // 무한 스크롤 감지
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotices(nextPage, true);
    }
  }, [inView, hasMore, isLoading, isLoadingMore]);

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
                <span className="date">{new Date(notice.createTime).toLocaleDateString()}</span>
              </div>
              <h2 className="notice-title">{notice.title}</h2>
            </button>
          ))
        ) : (
          <EmptyState icon={Megaphone} message="등록된 공지사항이 없습니다" />
        )}

        {/* 무한 스크롤 트리거 */}
        <div ref={ref} className="sentinel">
          {isLoadingMore && <LoadingSpinner size={20} />}
        </div>
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
                <span className="date">{new Date(selectedNotice.createTime).toLocaleDateString()}</span>
              </div>
              <h1 className="title">{selectedNotice.title}</h1>
              <div className="meta">
                <div className="info-item">
                  <User size={14} />
                  <span>{selectedNotice.author.name}</span>
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
