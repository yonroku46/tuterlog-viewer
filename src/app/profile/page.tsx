'use client';

import { useState } from 'react';
import { Bell, Pencil, Smile, Building2, CreditCard, Package, Search, ChevronRight, Settings, ShieldCheck, HelpCircle, LogOut, Globe, Check } from 'lucide-react';
import SlideDialog from '@/components/dialog/SlideDialog';
import './Profile.scss';

export default function ProfilePage() {
  const [activeMenu, setActiveMenu] = useState<ProfileMenuType>(null);
  const [language, setLanguage] = useState('ko');

  const closeDialog = () => setActiveMenu(null);

  const getMenuTitle = () => {
    switch (activeMenu) {
      case 'CENTER': return '센터 조회';
      case 'TICKET': return '수강권 조회';
      case 'PRODUCT': return '상품 조회';
      case 'HISTORY': return '전체 이용 내역';
      case 'NOTICE_SETTING': return '알림 설정';
      case 'SYSTEM_SETTING': return '환경 설정';
      default: return '';
    }
  };

  const renderDialogContent = () => {
    switch (activeMenu) {
      case 'CENTER':
        return (
          <div className="center-search-content">
            <div className="search-box">
              <input type="text" placeholder="센터 이름을 입력하세요" />
              <Search size={20} />
            </div>
            <div className="center-list">
              <div className="center-item">
                <h4>필라테스 A 센터</h4>
                <p>서울특별시 강남구 역삼동 123-45</p>
                <div className="center-date">2023.12.31</div>
              </div>
              <div className="center-item">
                <h4>요가 B 센터</h4>
                <p>서울특별시 서초구 서초동 678-90</p>
                <div className="center-date">2022.01.01 ~ 2023.01.01</div>
              </div>
            </div>
          </div>
        );
      case 'TICKET':
        return (
          <div className="history-list">
            <div className="history-item">
              <div className="date">2024. 03. 14</div>
              <div className="content">
                <div className="type">수강권 구매</div>
                <div className="detail">6:1 그룹 회원권 (30회)</div>
              </div>
            </div>
            <div className="history-item">
              <div className="date">2023. 12. 01</div>
              <div className="content">
                <div className="type">수강권 만료</div>
                <div className="detail">1:1 개인 레슨 (10회)</div>
              </div>
            </div>
          </div>
        );
      case 'PRODUCT':
        return (
          <div className="history-list">
            <div className="history-item">
              <div className="date">2024. 05. 01</div>
              <div className="content">
                <div className="type">상품 구매</div>
                <div className="detail">개인 락커 이용권 (3개월)</div>
              </div>
            </div>
            <div className="history-item">
              <div className="date">2024. 04. 15</div>
              <div className="content">
                <div className="type">상품 대여</div>
                <div className="detail">운동복 대여 (1일)</div>
              </div>
            </div>
          </div>
        );
      case 'HISTORY':
        return (
          <div className="history-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="history-item">
                <div className="date">2024.05.0{i}</div>
                <div className="content">
                  <div className="type">수업 예약</div>
                  <div className="detail">리포머 필라테스 A (이은주 강사)</div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'NOTICE_SETTING':
        return (
          <div className="setting-list-container">
            <div className="setting-list">
              <div className="setting-item">
                <span>수업 시작 알림</span>
                <div className="toggle active"></div>
              </div>
              <div className="setting-item">
                <span>마케팅 정보 수신 동의</span>
                <div className="toggle"></div>
              </div>
            </div>
          </div>
        );
      case 'SYSTEM_SETTING':
        return (
          <div className="setting-list-container">
            <div className="setting-group">
              <h4 className="group-label">언어 설정</h4>
              <div className="language-selector">
                <button 
                  className={`lang-item ${language === 'ko' ? 'active' : ''}`}
                  onClick={() => setLanguage('ko')}
                >
                  <div className="left">
                    <Globe size={18} />
                    <span>한국어</span>
                  </div>
                  {language === 'ko' && <Check size={18} className="check-icon" />}
                </button>
              </div>
            </div>

            <div className="setting-group">
              <h4 className="group-label">앱 정보</h4>
              <div className="menu-list">
                <button className="menu-item">
                  <div className="left">
                    <div className="icon-wrapper"><ShieldCheck size={20} /></div>
                    <span>개인정보 처리방침</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
                <button className="menu-item">
                  <div className="left">
                    <div className="icon-wrapper"><HelpCircle size={20} /></div>
                    <span>고객 센터</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
                <button className="menu-item logout">
                  <div className="left">
                    <div className="icon-wrapper"><LogOut size={20} /></div>
                    <span>로그아웃</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="version-info">버전 정보 1.0.4</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-page">
      <section className="user-info-section">
        <div className="avatar">
          <Smile size={32} />
        </div>
        <div className="user-text">
          <h2 className="name">홍길동 님</h2>
          <p className="details">
            010-0000-0000<br />
            hong@tuterlog.com
          </p>
        </div>
        <button className="edit-btn">
          <Pencil size={16} />
        </button>
      </section>

      <section>
        <h3 className="section-title">내 이용 정보</h3>
        <div className="menu-list">
          <button className="menu-item" onClick={() => setActiveMenu('CENTER')}>
            <div className="left">
              <div className="icon-wrapper"><Building2 size={20} /></div>
              <span>센터 조회</span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button className="menu-item" onClick={() => setActiveMenu('TICKET')}>
            <div className="left">
              <div className="icon-wrapper"><CreditCard size={20} /></div>
              <span>수강권 조회</span>
            </div>
            <div className="right">
              <span className="status">사용 중</span>
              <ChevronRight size={18} />
            </div>
          </button>
          <button className="menu-item" onClick={() => setActiveMenu('PRODUCT')}>
            <div className="left">
              <div className="icon-wrapper"><Package size={20} /></div>
              <span>상품 조회</span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button className="menu-item" onClick={() => setActiveMenu('HISTORY')}>
            <div className="left">
              <div className="icon-wrapper"><Search size={20} /></div>
              <span>전체 이용 내역 조회</span>
            </div>
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <section>
        <h3 className="section-title">서비스 설정</h3>
        <div className="menu-list">
          <button className="menu-item" onClick={() => setActiveMenu('NOTICE_SETTING')}>
            <div className="left">
              <div className="icon-wrapper"><Bell size={20} /></div>
              <span>알림 설정</span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button className="menu-item" onClick={() => setActiveMenu('SYSTEM_SETTING')}>
            <div className="left">
              <div className="icon-wrapper"><Settings size={20} /></div>
              <span>환경 설정</span>
            </div>
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <SlideDialog 
        isOpen={activeMenu !== null} 
        onClose={closeDialog} 
        title={getMenuTitle()}
      >
        {renderDialogContent()}
      </SlideDialog>
    </div>
  );
}
