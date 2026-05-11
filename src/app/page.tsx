'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { User, ChevronDown, Check, MapPin, AlertCircle, Trash2, MoreVertical, CalendarDays, Trophy, Activity } from 'lucide-react';
import SlideDialog from '@/components/dialog/SlideDialog';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import './Home.scss';

dayjs.locale('ko');

const CENTERS = ['TutorLog 필라테스 강남점', 'TutorLog 요가 서초점', 'TutorLog 번지 피트니스 광교점'];

const TICKETS = [
  {
    id: 1,
    type: 'GROUP',
    subTitle: '6:1 · 횟수제 · 주3회 · 당일변경 1회',
    name: '6:1 그룹 회원권',
    dateRange: '2024. 3. 14. ~ 2024. 12. 31. (93일 남음)',
    stats: { available: 29, cancelable: 30, remaining: '30 / 30' }
  },
  {
    id: 2,
    type: 'PT',
    subTitle: '1:1 · 개인레슨 · 상시가능',
    name: '1:1 개인 PT 10회권',
    dateRange: '2024. 04. 01. ~ 2024. 07. 01. (52일 남음)',
    stats: { available: 8, cancelable: 10, remaining: '8 / 10' }
  }
];

const USER_RESERVATIONS: Reservation[] = [
  { reservationId: '1', centerId: 0, date: '2026-05-11', time: '09:00 - 09:50', className: '6:1 리포머&캐딜락', instructor: '이유나 강사', room: '리포머 룸', status: 'CONFIRMED', reservedCount: 5, capacity: 6 },
  { reservationId: '2', centerId: 0, date: '2026-05-16', time: '14:00 - 14:50', className: '6:1 체어 & 바렐', instructor: '박소윤 강사', room: '체어 룸', status: 'CONFIRMED', reservedCount: 6, capacity: 6 },
  { reservationId: '3', centerId: 1, date: '2026-05-15', time: '19:00 - 19:50', className: '빈야사 요가 A', instructor: '김하늘 강사', room: 'Studio 2', status: 'CANCELLED', reservedCount: 15, capacity: 15 },
  { reservationId: '4', centerId: 0, date: '2026-05-20', time: '11:00 - 11:50', className: '6:1 스프링보드', instructor: '이유나 강사', room: 'Reformer 2', status: 'CONFIRMED', reservedCount: 4, capacity: 6 },
];

const ReservedCard = ({ 
  reservation, 
  showCancel = true, 
  onCancel 
}: { 
  reservation: Reservation; 
  showCancel?: boolean;
  onCancel?: (id: string) => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 바깥 클릭 시 닫기 로직
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="reserved-card">
      <div className="class-date">
        <div className="date-left">
          <span className="date-text">
            {dayjs(reservation.date).format('YYYY. M. D (ddd)')} {reservation.time}
          </span>
          <span className={`status-badge ${reservation.status.toLocaleLowerCase()}`}>
            {reservation.status === 'CONFIRMED' ? '예약확정' : reservation.status === 'CANCELLED' ? '취소' : '대기중'}
          </span>
        </div>
        
        {showCancel && (
          <div className="more-menu-container" ref={menuRef}>
            <button className="more-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <MoreVertical size={18} />
            </button>
            {isMenuOpen && (
              <div className="menu-dropdown">
                <button onClick={() => {
                  const isToday = dayjs(reservation.date).isSame(dayjs(), 'day');
                  if (isToday) {
                    alert('당일 수업은 취소가 불가능합니다.');
                    setIsMenuOpen(false);
                    return;
                  }
                  onCancel?.(reservation.reservationId);
                  setIsMenuOpen(false);
                }}>
                  <Trash2 size={14} />
                  예약 취소하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="class-info">
        <div className="instructor-img">
          {reservation.instructor ? (
            <div className="fallback-icon">
              <User size={20} color="#aeaeb2" />
            </div>
          ) : null}
        </div>
        <div className="details">
          <p className="title">{reservation.className}</p>
          <p className="desc">{reservation.instructor} | {reservation.room}</p>
          <div className="attendance-info">
            <span className="capacity-label">{reservation.capacity}명 정원</span>
            <span className="divider">·</span>
            <span className="booked-label">{reservation.reservedCount}명 예약됨</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [selectedCenter, setSelectedCenter] = useState(CENTERS[0]);
  const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false);
  const [isAllReservationsOpen, setIsAllReservationsOpen] = useState(false);
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  const carouselRef = useRef<HTMLDivElement>(null);
  const dateScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDateDragging, setIsDateDragging] = useState(false);
  const [dateStartX, setDateStartX] = useState(0);
  const [dateScrollLeft, setDateScrollLeft] = useState(0);

  // Load persisted center on mount
  useEffect(() => {
    const savedCenter = localStorage.getItem('selectedCenter');
    if (savedCenter && CENTERS.includes(savedCenter)) {
      setSelectedCenter(savedCenter);
    }
  }, []);

  // 현재 선택된 센터의 지점 인덱스 (Mock용)
  const centerIndex = CENTERS.indexOf(selectedCenter);

  // 현재 센터의 예약 내역
  const myReservations = useMemo(() => {
    return USER_RESERVATIONS.filter(res => res.centerId === centerIndex)
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());
  }, [centerIndex]);

  // 선택된 날짜의 예약 내역 (홈 화면용)
  const reservationsForDate = useMemo(() => {
    return myReservations.filter(res => dayjs(res.date).isSame(selectedDate, 'day'));
  }, [myReservations, selectedDate]);

  const dateRange = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => {
      const date = dayjs().add(i, 'day');
      const isFirstDayOfMonth = date.date() === 1;
      return {
        full: date.format('YYYY-MM-DD'),
        day: date.format('D'),
        weekDay: i === 0 ? '오늘' : date.format('dd'),
        isSunday: date.day() === 0,
        isSaturday: date.day() === 6,
        month: (i === 0 || isFirstDayOfMonth) ? date.format('M월') : null,
      };
    });
  }, []);

  const handleCenterSelect = (center: string) => {
    setSelectedCenter(center);
    localStorage.setItem('selectedCenter', center);
    setIsCenterDialogOpen(false);
  };

  const handleCancel = (id: string) => {
    if (confirm('이 예약을 취소하시겠습니까?')) {
      alert('취소되었습니다.');
    }
  };

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const width = carouselRef.current.offsetWidth;
      const cardWidth = width * 0.88 + 16;
      carouselRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
      setActiveTicketIndex(index);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      const sl = carouselRef.current.scrollLeft;
      const width = carouselRef.current.offsetWidth;
      const cardWidth = width * 0.88 + 16;
      const index = Math.round(sl / cardWidth);
      scrollToIndex(index);
    }
  };

  const onDateMouseDown = (e: React.MouseEvent) => {
    if (!dateScrollRef.current) return;
    setIsDateDragging(true);
    setDateStartX(e.pageX - dateScrollRef.current.offsetLeft);
    setDateScrollLeft(dateScrollRef.current.scrollLeft);
  };

  const onDateMouseMove = (e: React.MouseEvent) => {
    if (!isDateDragging || !dateScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - dateScrollRef.current.offsetLeft;
    const walk = (x - dateStartX) * 1.5;
    dateScrollRef.current.scrollLeft = dateScrollLeft - walk;
  };

  const onDateMouseUp = () => setIsDateDragging(false);

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="center-selector" onClick={() => setIsCenterDialogOpen(true)}>
          <h1>{selectedCenter}</h1>
          <ChevronDown size={20} strokeWidth={2.5} />
        </div>
      </header>

      <SlideDialog
        isOpen={isCenterDialogOpen}
        onClose={() => setIsCenterDialogOpen(false)}
        title="시설 선택"
      >
        <div className="center-select-list">
          {CENTERS.map((center) => (
            <button
              key={center}
              className={`center-select-item ${selectedCenter === center ? 'active' : ''}`}
              onClick={() => handleCenterSelect(center)}
            >
              <span className="name">{center}</span>
              {selectedCenter === center && <Check size={20} className="check-icon" />}
            </button>
          ))}
        </div>
      </SlideDialog>

      <div className="ticket-carousel-container">
        <div 
          className={`ticket-carousel ${TICKETS.length === 1 ? 'is-single' : ''} ${isDragging ? 'dragging' : ''}`}
          ref={carouselRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {TICKETS.map((ticket, i) => (
            <div 
              key={ticket.id} 
              className={`premium-ticket ${ticket.type === 'PT' ? 'pt-ticket' : ''} ${activeTicketIndex === i ? 'active' : ''}`}
            >
              <div className="ticket-header">
                <span className="center-name">{selectedCenter}</span>
                <span className="status-badge">사용 중</span>
              </div>
              <h2 className="ticket-name">{ticket.name}</h2>
              <div className="usage-progress">
                <div className="label-row">
                  <span>수강 현황</span>
                  <span className="remaining">{ticket.stats.available} / {ticket.stats.cancelable}회</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(ticket.stats.available / ticket.stats.cancelable) * 100}%` }}></div>
                </div>
              </div>
              <div className="expiry-info">
                <CalendarDays size={14} />
                <span>{ticket.dateRange.split('(')[0].trim()} ({ticket.dateRange.split('(')[1]}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="label-group">
              <Activity size={14} />
              <span className="label">이번 달 수강</span>
            </div>
            <div className="value">{TICKETS[activeTicketIndex].type === 'GROUP' ? '12' : '2'}<span>회</span></div>
          </div>
          <div className="stat-item">
            <div className="label-group">
              <Trophy size={14} />
              <span className="label">평균 수강 빈도</span>
            </div>
            <div className="value">{TICKETS[activeTicketIndex].type === 'GROUP' ? '주 2.5' : '주 1.2'}<span>회</span></div>
          </div>
        </div>

        {TICKETS.length > 1 && (
          <div className="carousel-indicators">
            {TICKETS.map((_, i) => (
              <div 
                key={i} 
                className={`dot ${activeTicketIndex === i ? 'active' : ''}`}
                onClick={() => scrollToIndex(i)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="reserved-section">
        <div className="section-header">
          <h3>예약된 수업</h3>
          <button className="view-all" onClick={() => setIsAllReservationsOpen(true)}>예약 전체보기</button>
        </div>

        <div 
          className={`date-selector ${isDateDragging ? 'dragging' : ''}`}
          ref={dateScrollRef}
          onMouseDown={onDateMouseDown}
          onMouseMove={onDateMouseMove}
          onMouseUp={onDateMouseUp}
          onMouseLeave={onDateMouseUp}
        >
          {dateRange.map((d) => (
            <div 
              key={d.full} 
              className={`date-item ${selectedDate === d.full ? 'active' : ''} ${d.isSunday ? 'sun' : ''} ${d.isSaturday ? 'sat' : ''} ${d.month ? 'has-month' : ''}`}
              onClick={() => !isDateDragging && setSelectedDate(d.full)}
            >
              {d.month && <span className="month-label">{d.month}</span>}
              <span className="weekday">{d.weekDay}</span>
              <span className="day">{d.day}</span>
            </div>
          ))}
        </div>

        {reservationsForDate.length > 0 ? (
          reservationsForDate.map(res => (
            <ReservedCard key={res.reservationId} reservation={res} onCancel={handleCancel} />
          ))
        ) : (
          <div className="empty-reserved-card">
            <AlertCircle size={40} className="empty-icon" />
            <p>선택하신 날짜에 예약된 수업이 없습니다.</p>
            <button className="go-reserve-btn" onClick={() => window.location.href='/reserve'}>
              수업 예약하러 가기
            </button>
          </div>
        )}
      </div>

      <SlideDialog
        isOpen={isAllReservationsOpen}
        onClose={() => setIsAllReservationsOpen(false)}
        title="전체 예약 내역"
      >
        <div className="all-reservations-view">
          <div className="current-center-info">
            <MapPin size={16} />
            <span>{selectedCenter}</span>
          </div>

          {myReservations.length > 0 ? (
            <div className="res-list">
              {myReservations.map((res) => (
                <ReservedCard key={res.reservationId} reservation={res} onCancel={handleCancel} />
              ))}
            </div>
          ) : (
            <div className="empty-reservations">
              <AlertCircle size={48} />
              <p>예약된 수업이 없습니다.</p>
              <button className="go-reserve" onClick={() => window.location.href='/reserve'}>수업 예약하러 가기</button>
            </div>
          )}
        </div>
      </SlideDialog>
    </div>
  );
}
