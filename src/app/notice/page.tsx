'use client';

import { useState } from 'react';
import { Megaphone, User } from 'lucide-react';
import SlideDialog from '@/components/dialog/SlideDialog';
import './Notice.scss';

export default function NoticePage() {
  const [activeTab, setActiveTab] = useState<'center' | 'service'>('center');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const centerNotices: Notice[] = [
    {
      noticeId: '1',
      tag: '센터',
      facility: true,
      title: '[강남점] 6월 필라테스 기구 교체 및 내부 수리 안내',
      date: '2026.05.09',
      author: '센터 관리자',
      content: '안녕하세요. TuterLog 강남점입니다.\n\n더 쾌적한 운동 환경을 제공해 드리기 위해 6월 한 달간 노후된 기구 교체 및 내부 수리 작업을 진행할 예정입니다.\n\n- 기간: 2026년 6월 1일 ~ 6월 15일\n- 내용: 리포머 전원 교체 및 탈의실 리모델링\n\n공사 기간 중에는 일부 수업이 제한될 수 있으니 예약 시 참고 부탁드립니다. 감사합니다.'
    },
    {
      noticeId: '2',
      tag: '안내',
      title: '여름 휴가철 센터 운영 시간 변경 안내',
      date: '2026.05.07',
      author: '운영팀',
      content: '7월~8월 여름 휴가 시즌 동안 센터 운영 시간이 다음과 같이 변경됩니다.\n\n평일: 07:00 ~ 22:00 (기존 23:00)\n주말: 09:00 ~ 18:00 (동일)\n\n이용에 착오 없으시길 바랍니다.'
    },
  ];

  const serviceNotices: Notice[] = [
    {
      noticeId: '3',
      tag: '중요',
      important: true,
      title: '시스템 점검 안내 (5월 15일 새벽 2시~4시)',
      date: '2026.05.08',
      author: '시스템 관리자',
      content: '안정적인 서비스 제공을 위해 시스템 점검이 진행될 예정입니다.\n\n점검 시간 동안에는 앱 접속 및 예약이 불가능하오니 양해 부탁드립니다.'
    },
    {
      noticeId: '4',
      tag: '공지',
      title: 'TuterLog 앱 버전 업데이트 안내 (v2.1.0)',
      date: '2026.05.05',
      author: '서비스팀',
      content: '새로운 버전이 출시되었습니다!\n\n[업데이트 내용]\n- 예약 취소 대기 기능 추가\n- 마이페이지 UI 개선\n- 기타 버그 수정\n\n지금 바로 스토어에서 업데이트해 보세요.'
    },
  ];

  const currentNotices = activeTab === 'center' ? centerNotices : serviceNotices;

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
        {currentNotices.length > 0 ? (
          currentNotices.map((notice) => (
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
          <div className="empty-state">
            <Megaphone size={48} className="empty-icon" />
            <p>등록된 공지사항이 없습니다.</p>
          </div>
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
