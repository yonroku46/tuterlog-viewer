'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Pencil, Smile, Building2, CreditCard, Package, Search, ChevronRight, Settings, ShieldCheck, HelpCircle, LogOut, Globe, Check, Image as ImageIcon, Phone, Mail, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import SlideDialog from '@/components/dialog/SlideDialog';
import LoadingSpinner from '@/components/contents/LoadingSpinner';
import EmptyState from '@/components/contents/EmptyState';
import Skeleton from '@/components/contents/Skeleton';
import ProfileService from '@/api/service/ProfileService';
import { useAuth } from '@/providers/AuthProvider';
import { CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS } from '@/common/constants';
import AppImage from '@/components/contents/AppImage';
import './Profile.scss';

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // 페이지 마운트 시 프로필 로드
  useEffect(() => {
    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        const res = await ProfileService.getProfile();
        if (res) setProfile(res);
      } catch (err: any) {
        enqueueSnackbar(err.message || '프로필 정보를 불러오는데 실패했습니다.', { variant: 'error' });
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

  const closeDialog = () => {
    setActiveMenu(null);
    setOpenFaqIndex(null);
  };

  const handleBack = () => {
    if (activeMenu === 'PRIVACY' || activeMenu === 'CUSTOMER_CENTER') {
      setActiveMenu('SYSTEM_SETTING');
      setOpenFaqIndex(null);
      return;
    }
    closeDialog();
  };

  const handleToggleNotification = async (key: 'classReminder' | 'marketing') => {
    if (!profile) return;
    const updatedValue = !profile[key];
    setProfile({ ...profile, [key]: updatedValue });
    try {
      await ProfileService.updateProfile({ [key]: updatedValue });
      enqueueSnackbar('알림 설정이 변경되었습니다.', { variant: 'success' });
    } catch (err: any) {
      // 실패 시 롤백 (profile 복구)
      setProfile({ ...profile });
      enqueueSnackbar(err.message || '설정 변경에 실패했습니다.', { variant: 'error' });
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setIsDialogLoading(true);
    try {
      // 실제 구현 시에는 FormData를 사용하여 이미지 파일과 함께 전송
      await ProfileService.updateProfile({ ...editData, profileImg: avatarPreview || profile.profileImg });
      setProfile({ ...profile, ...editData, profileImg: avatarPreview || profile.profileImg } as UserProfile);
      enqueueSnackbar('프로필이 수정되었습니다.', { variant: 'success' });
      closeDialog();
    } catch (err: any) {
      enqueueSnackbar(err.message || '프로필 수정에 실패했습니다.', { variant: 'error' });
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
      case 'PRIVACY': return '개인정보 처리방침';
      case 'CUSTOMER_CENTER': return '고객 센터';
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
                <div className="date">{dayjs(item.createTime).format('YYYY.MM.DD HH:mm')}</div>
                <div className="content">
                  <div className="type" style={{ color: CONTENT_TYPE_COLORS[item.contentType] }}>
                    {CONTENT_TYPE_LABELS[item.contentType] || item.contentType}
                  </div>
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
                <div className="date">{dayjs(item.createTime).format('YYYY.MM.DD HH:mm')}</div>
                <div className="content">
                  <div className="type" style={{ color: CONTENT_TYPE_COLORS[item.contentType] }}>
                    {CONTENT_TYPE_LABELS[item.contentType] || item.contentType}
                  </div>
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
                <div className="date">{dayjs(item.createTime).format('YYYY.MM.DD HH:mm')}</div>
                <div className="content">
                  <div className="type" style={{ color: CONTENT_TYPE_COLORS[item.contentType] }}>
                    {CONTENT_TYPE_LABELS[item.contentType] || item.contentType}
                  </div>
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
                <button className="menu-item" onClick={() => setActiveMenu('PRIVACY')}>
                  <div className="left">
                    <div className="icon-wrapper"><ShieldCheck size={20} /></div>
                    <span>개인정보 처리방침</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
                <button className="menu-item" onClick={() => setActiveMenu('CUSTOMER_CENTER')}>
                  <div className="left">
                    <div className="icon-wrapper"><HelpCircle size={20} /></div>
                    <span>고객 센터</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
                <button className="menu-item logout" onClick={logout}>
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

      case 'PRIVACY':
        return (
          <div className="privacy-content">
            <div className="privacy-card">
              <div className="privacy-section">
                <h4>제1조 (목적)</h4>
                <p>(주)유니버스(이하 "회사")는 이용자의 개인정보를 소중하게 생각하며, "개인정보 보호법" 등 관련 법령을 준수하고 있습니다. 본 방침은 회사가 제공하는 튜터로그 서비스(이하 "서비스")를 통해 수집된 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.</p>
              </div>

              <div className="privacy-section">
                <h4>제2조 (수집하는 개인정보 항목 및 수집방법)</h4>
                <p>회사는 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.
                {"\n"}1. 수집항목
                {"\n"}- 필수: 이름, 이메일 주소, 휴대전화번호, 비밀번호, 소셜 로그인 식별자(소셜 가입 시)
                {"\n"}- 선택: 프로필 이미지, 마케팅 수신 동의 여부
                {"\n"}- 자동 수집: IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 불량 이용 기록, 기기 정보
                {"\n"}2. 수집방법: 앱 내 회원가입, 프로필 수정, 서비스 이용 과정에서의 자동 생성</p>
              </div>

              <div className="privacy-section">
                <h4>제3조 (개인정보의 수집 및 이용목적)</h4>
                <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.
                {"\n"}- 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금 정산
                {"\n"}- 회원 관리: 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 불량 회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 고충 처리, 고지사항 전달
                {"\n"}- 마케팅 및 광고에 활용: 신규 서비스 개발 및 맞춤 서비스 제공, 통계적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성 확인, 이벤트 정보 및 광고성 정보 제공 및 참여기회 제공(동의 시)</p>
              </div>

              <div className="privacy-section">
                <h4>제4조 (개인정보의 보유 및 이용기간)</h4>
                <p>회사는 이용자의 개인정보를 회원 탈퇴 시까지 보유하며, 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관련 법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 일정 기간 보관합니다.
                {"\n"}- 계약 또는 청약철회 등에 관한 기록: 5년
                {"\n"}- 대금결제 및 재화 등의 공급에 관한 기록: 5년
                {"\n"}- 소비자의 불만 또는 분쟁처리에 관한 기록: 3년
                {"\n"}- 접속 로그, 접속 IP 정보: 3개월</p>
              </div>

              <div className="privacy-section">
                <h4>제5조 (개인정보의 파기절차 및 방법)</h4>
                <p>1. 파기절차: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.
                {"\n"}2. 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이 문서에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</p>
              </div>

              <div className="privacy-section">
                <h4>제6조 (이용자 및 법정대리인의 권리와 그 행사방법)</h4>
                <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지(탈퇴)를 요청할 수 있습니다.
                {"\n"}- 앱 내 "프로필 수정" 기능을 통한 정보 변경
                {"\n"}- 고객센터(support@univus.jp)를 통한 서면, 전화 또는 이메일 연락 시 지체 없이 조치
                {"\n"}- 이용자가 개인정보의 오류에 대한 정정을 요청하신 경우에는 정정을 완료하기 전까지 당해 개인정보를 이용 또는 제공하지 않습니다.</p>
              </div>

              <div className="privacy-section">
                <h4>제7조 (개인정보 보호책임자 및 문의처)</h4>
                <p>회사는 개인정보를 보호하고 관련 불만을 처리하기 위하여 아래와 같이 책임자를 지정하고 있습니다.
                {"\n"}- 개인정보 보호책임자: 관리자
                {"\n"}- 연락처: support@univus.jp
                {"\n"}귀하께서는 회사의 서비스를 이용하시며 발생하는 모든 개인정보 보호 관련 민원을 개인정보 보호책임자에게 신고하실 수 있습니다.</p>
              </div>

              <div className="last-updated">최종 수정일: 2026년 5월 13일</div>
            </div>
          </div>
        );

      case 'CUSTOMER_CENTER':
        const faqs = [
          { q: '수강권 환불은 어떻게 하나요?', a: '튜터로그는 센터 운영 관리를 위한 시스템을 제공하는 서비스로, 환불 규정 및 절차는 등록하신 센터의 운영 방침에 따릅니다. 상세 내용은 센터 사무국으로 문의해 주시기 바랍니다.' },
          { q: '수업 예약 및 취소는 언제까지 가능한가요?', a: '수업 예약 및 취소 마감 시간은 각 센터의 운영 정책에 따라 상이합니다. 예약 화면의 안내 사항을 확인하시거나 센터에 직접 문의해 주세요.' },
          { q: '서비스 이용 중 오류가 발생했어요.', a: '서비스 이용 중 발생하는 기술적인 오류나 불편 사항은 고객센터 이메일(support@univus.jp)로 문의해 주시면 신속히 확인하여 답변 드리겠습니다.' },
          { q: '센터 정보를 변경하고 싶어요.', a: '등록된 센터 정보 변경이나 수강권 이전 등은 해당 센터의 승인이 필요한 사항입니다. 이용 중이신 센터 관리자에게 문의해 주세요.' },
        ];

        return (
          <div className="customer-center-content">
            <div className="contact-email-section">
              <div className="email-card">
                <div className="icon-circle"><Mail size={22} /></div>
                <div className="text-group">
                  <div className="label">이메일 문의</div>
                  <div className="value">support@univus.jp</div>
                </div>
                <button 
                  className="copy-btn" 
                  onClick={() => {
                    navigator.clipboard.writeText('support@univus.jp');
                    enqueueSnackbar('이메일 주소가 복사되었습니다.', { variant: 'info' });
                  }}
                >
                  복사
                </button>
              </div>
            </div>

            <div className="faq-section">
              <h4 className="section-label">자주 묻는 질문</h4>
              <div className="faq-list">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="faq-item">
                    <button 
                      className="faq-question" 
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    >
                      <span>{faq.q}</span>
                      {openFaqIndex === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {openFaqIndex === idx && (
                      <div className="faq-answer">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="operating-hours">
              <h5>고객센터 운영시간</h5>
              <p>평일: 09:00 ~ 18:00 (점심시간 12:00 ~ 13:00)</p>
              <p>주말 및 공휴일: 휴무</p>
            </div>
          </div>
        );

      case 'EDIT_PROFILE':
        return (
          <div className="setting-list-container">
            <div className="edit-avatar-section">
              <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                <div className="avatar-img">
                  <AppImage 
                    src={avatarPreview || profile?.profileImg} 
                    alt="avatar" 
                    width={80} 
                    height={80} 
                    fallback={<Smile size={40} />}
                  />
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
                <div className="setting-item-input">
                  <label>성별</label>
                  <select 
                    className="gender-select"
                    value={editData.gender || ''} 
                    onChange={e => setEditData({ ...editData, gender: e.target.value })}
                  >
                    <option value="" disabled>성별 선택</option>
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                    <option value="O">기타</option>
                  </select>
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
              <AppImage 
                src={profile?.profileImg} 
                alt="avatar" 
                width={60} 
                height={60} 
                style={{ borderRadius: '50%' }}
                fallback={<Smile size={32} />}
              />
            </div>
            <div className="user-text">
                  <h2 className="name">{profile?.name ?? '—'} 님</h2>
                  <p className="details">
                    {profile?.phone ?? '—'} · {profile?.gender === 'M' ? '남성' : profile?.gender === 'F' ? '여성' : profile?.gender === 'O' ? '기타' : '성별 미설정'}<br />
                    {profile?.email ?? '—'}
                  </p>
            </div>
            <button className="edit-btn" onClick={() => {
              setEditData({ name: profile?.name, phone: profile?.phone, email: profile?.email, gender: profile?.gender });
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
        onClose={handleBack}
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
