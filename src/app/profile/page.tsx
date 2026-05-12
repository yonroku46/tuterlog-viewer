'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Pencil, Smile, Building2, CreditCard, Package, Search, ChevronRight, Settings, ShieldCheck, HelpCircle, LogOut, Globe, Check, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import SlideDialog from '@/components/dialog/SlideDialog';
import LoadingSpinner from '@/components/contents/LoadingSpinner';
import EmptyState from '@/components/contents/EmptyState';
import Skeleton from '@/components/contents/Skeleton';
import ProfileService from '@/api/service/ProfileService';
import './Profile.scss';

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMenu, setActiveMenu] = useState<ProfileMenuType>(null);
  const [language, setLanguage] = useState('ko');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [centers, setCenters] = useState<UserCenter[]>([]);
  const [tickets, setTickets] = useState<UsageHistoryItem[]>([]);
  const [products, setProducts] = useState<UsageHistoryItem[]>([]);
  const [history, setHistory] = useState<UsageHistoryItem[]>([]);
  const [isDialogLoading, setIsDialogLoading] = useState(false);

  // 페이지 마운트 시 프로필 로드
  useEffect(() => {
    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        const res = await ProfileService.getProfile();
        if (res) setProfile(res);
      } catch (err) {
        console.error('[ProfilePage] getProfile', err);
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 다이얼로그 열릴 때 해당 데이터 조회
  useEffect(() => {
    if (!activeMenu) return;

    const fetchDialogData = async () => {
      setIsDialogLoading(true);
      try {
        switch (activeMenu) {
          case 'CENTER': {
            const res = await ProfileService.getMyCenters();
            if (res?.list) setCenters(res.list);
            break;
          }
          case 'TICKET': {
            const res = await ProfileService.getMyTickets();
            if (res?.list) setTickets(res.list);
            break;
          }
          case 'PRODUCT': {
            const res = await ProfileService.getMyProducts();
            if (res?.list) setProducts(res.list);
            break;
          }
          case 'HISTORY': {
            const res = await ProfileService.getUsageHistory();
            if (res?.list) setHistory(res.list);
            break;
          }
          case 'NOTICE_SETTING': {
            // 알림 설정은 이미 profile 객체에 포함되어 있으므로 추가 조회 생략
            break;
          }
        }
      } catch (err) {
        console.error('[ProfilePage] fetchDialogData', err);
      } finally {
        setIsDialogLoading(false);
      }
    };

    fetchDialogData();
  }, [activeMenu]);

  const closeDialog = () => setActiveMenu(null);

  const handleToggleNotification = async (key: 'classReminder' | 'marketing') => {
    if (!profile) return;
    const updatedValue = !profile[key];
    setProfile({ ...profile, [key]: updatedValue });
    try {
      await ProfileService.updateProfile({ [key]: updatedValue });
    } catch {
      // 실패 시 롤백 (profile 복구)
      setProfile({ ...profile });
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setIsDialogLoading(true);
    try {
      // 실제 구현 시에는 FormData를 사용하여 이미지 파일과 함께 전송
      await ProfileService.updateProfile({ ...editData, profileImg: avatarPreview || profile.profileImg });
      setProfile({ ...profile, ...editData, profileImg: avatarPreview || profile.profileImg } as UserProfile);
      closeDialog();
    } catch (err) {
      console.error('[ProfilePage] handleUpdateProfile', err);
    } finally {
      setIsDialogLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getMenuTitle = () => {
    switch (activeMenu) {
      case 'EDIT_PROFILE': return '프로필 수정';
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
    if (isDialogLoading) return <LoadingSpinner />;

    switch (activeMenu) {
      case 'CENTER':
        return (
          <div className="center-search-content">
            <div className="search-box">
              <input type="text" placeholder="센터 이름을 입력하세요" />
              <Search size={20} />
            </div>
            {centers.length > 0 ? (
              <div className="center-list">
                {centers.map(center => (
                  <div key={center.centerId} className="center-item">
                    <h4>{center.name}</h4>
                    <p>{center.address}</p>
                    <div className="center-date">
                      {center.enrolledDate}{center.expiredDate ? ` ~ ${center.expiredDate}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="가입된 센터가 없습니다" variant="dialog" />
            )}
          </div>
        );

      case 'TICKET':
        return (
          <div className="history-list">
            {tickets.length > 0 ? tickets.map(item => (
              <div key={item.historyId} className="history-item">
                <div className="date">{item.createTime}</div>
                <div className="content">
                  <div className="type">{item.contentType}</div>
                  <div className="detail">{item.contentDetail}</div>
                </div>
              </div>
            )) : <EmptyState message="수강권 내역이 없습니다" variant="dialog" />}
          </div>
        );

      case 'PRODUCT':
        return (
          <div className="history-list">
            {products.length > 0 ? products.map(item => (
              <div key={item.historyId} className="history-item">
                <div className="date">{item.createTime}</div>
                <div className="content">
                  <div className="type">{item.contentType}</div>
                  <div className="detail">{item.contentDetail}</div>
                </div>
              </div>
            )) : <EmptyState message="상품 내역이 없습니다" variant="dialog" />}
          </div>
        );

      case 'HISTORY':
        return (
          <div className="history-list">
            {history.length > 0 ? history.map(item => (
              <div key={item.historyId} className="history-item">
                <div className="date">{item.createTime}</div>
                <div className="content">
                  <div className="type">{item.contentType}</div>
                  <div className="detail">{item.contentDetail}</div>
                </div>
              </div>
            )) : <EmptyState message="이용 내역이 없습니다" variant="dialog" />}
          </div>
        );

      case 'NOTICE_SETTING':
        return (
          <div className="setting-list-container">
            <div className="setting-list">
              <div className="setting-item">
                <span>수업 시작 알림</span>
                <div
                  className={`toggle ${profile?.classReminder ? 'active' : ''}`}
                  onClick={() => handleToggleNotification('classReminder')}
                />
              </div>
              <div className="setting-item">
                <span>마케팅 정보 수신 동의</span>
                <div
                  className={`toggle ${profile?.marketing ? 'active' : ''}`}
                  onClick={() => handleToggleNotification('marketing')}
                />
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

      case 'EDIT_PROFILE':
        return (
          <div className="setting-list-container">
            <div className="edit-avatar-section">
              <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                <div className="avatar-img">
                  {avatarPreview || profile?.profileImg ? (
                    <Image src={avatarPreview || profile?.profileImg || ''} alt="avatar" width={80} height={80} />
                  ) : (
                    <Smile size={40} />
                  )}
                </div>
                <div className="camera-icon">
                  <ImageIcon size={16} />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                hidden 
                accept="image/*" 
                onChange={handleAvatarChange} 
              />
            </div>

            <div className="setting-group">
              <h4 className="group-label">기본 정보</h4>
              <div className="setting-list">
                <div className="setting-item-input">
                  <label>이름</label>
                  <input 
                    type="text" 
                    value={editData.name || ''} 
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="setting-item-input">
                  <label>연락처</label>
                  <input 
                    type="text" 
                    value={editData.phone || ''} 
                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
                <div className="setting-item-input">
                  <label>이메일</label>
                  <input 
                    type="text" 
                    value={editData.email || ''} 
                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-page">
      <section className={`user-info-section ${isProfileLoading ? 'is-loading' : ''}`}>
        {isProfileLoading ? (
          <>
            <Skeleton variant="circle" width="3.75rem" height="3.75rem" />
            <div style={{ marginLeft: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Skeleton variant="text" width="5rem" height="1.125rem" />
              <Skeleton variant="text" width="8rem" height="1.5rem" />
            </div>
          </>
        ) : (
          <>
            <div className="avatar">
              {profile?.profileImg ? (
                <Image src={profile.profileImg} alt="avatar" width={60} height={60} style={{ borderRadius: '50%' }} />
              ) : (
                <Smile size={32} />
              )}
            </div>
            <div className="user-text">
                  <h2 className="name">{profile?.name ?? '—'} 님</h2>
                  <p className="details">
                    {profile?.phone ?? '—'}<br />
                    {profile?.email ?? '—'}
                  </p>
            </div>
            <button className="edit-btn" onClick={() => {
              setEditData({ name: profile?.name, phone: profile?.phone, email: profile?.email });
              setAvatarPreview(null);
              setActiveMenu('EDIT_PROFILE');
            }}>
              <Pencil size={16} />
            </button>
          </>
        )}
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
            <ChevronRight size={18} />
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
        footer={activeMenu === 'EDIT_PROFILE' ? (
          <div className="write-dialog-footer">
            <button className="submit-btn active" onClick={handleUpdateProfile}>저장하기</button>
          </div>
        ) : undefined}
      >
        {renderDialogContent()}
      </SlideDialog>
    </div>
  );
}
