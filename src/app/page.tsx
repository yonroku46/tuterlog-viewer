'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { User, ChevronDown, Check, MapPin, AlertCircle, Trash2, MoreVertical, CalendarDays } from 'lucide-react';
import { useSnackbar } from 'notistack';
import HomeService from '@/api/service/HomeService';
import SlideDialog from '@/components/dialog/SlideDialog';
import AppImage from '@/components/contents/AppImage';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import './Home.scss';

dayjs.locale('ko');

const ReservedCard = ({
  reservation,
  showCancel = true,
  onCancel,
}: {
  reservation: ReservationRes;
  showCancel?: boolean;
  onCancel?: (res: ReservationRes) => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const isCancelled = reservation.status === 'CANCELLED';

  return (
    <div className={`reserved-card ${isCancelled ? 'cancelled' : ''}`}>
      <div className="class-date">
        <div className="date-left">
          <span className="date-text">
            {dayjs(reservation.reservationDate).format('YYYY. M. D (ddd)')} {reservation.startTime} - {reservation.endTime}
          </span>
          <span className={`status-badge ${reservation.status.toLocaleLowerCase()}`}>
            {reservation.status === 'CONFIRMED' ? '예약확정' : reservation.status === 'CANCELLED' ? '취소' : '대기중'}
          </span>
        </div>

        {showCancel && !isCancelled && (
          <div className="more-menu-container" ref={menuRef}>
            <button className="more-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <MoreVertical size={18} />
            </button>
            {isMenuOpen && (
              <div className="menu-dropdown">
                <button
                  onClick={() => {
                    onCancel?.(reservation);
                    setIsMenuOpen(false);
                  }}
                >
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
          <AppImage
            src={reservation.instructorProfileImg}
            alt={reservation.instructorName}
            width={40}
            height={40}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
            fallback={
              <div className="fallback-icon">
                <User size={20} color="#aeaeb2" />
              </div>
            }
          />
        </div>
        <div className="details">
          <p className="title">{reservation.className}</p>
          <p className="desc">{reservation.instructorName} | {reservation.room}</p>
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
  const [centers, setCenters] = useState<UserCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<UserCenter | null>(null);
  const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false);
  const [isAllReservationsOpen, setIsAllReservationsOpen] = useState(false);
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [reservations, setReservations] = useState<ReservationRes[]>([]);
  const [isLoadingCenters, setIsLoadingCenters] = useState(true);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const carouselRef = useRef<HTMLDivElement>(null);
  const dateScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDateDragging, setIsDateDragging] = useState(false);
  const [dateStartX, setDateStartX] = useState(0);
  const [dateScrollLeft, setDateScrollLeft] = useState(0);

  // 가입 센터 목록 불러오기
  useEffect(() => {
    const fetchCenters = async () => {
      setIsLoadingCenters(true);
      try {
        const res = await HomeService.getMyCenters();
        const list = res?.list ?? [];
        setCenters(list);

        // localStorage에 저장된 마지막 선택 센터 복원
        const savedCenterId = localStorage.getItem('selectedCenterId');
        const saved = list.find(c => c.centerId === savedCenterId);
        setSelectedCenter(saved ?? list[0] ?? null);
      } catch (e) {
        console.error('[HomePage] fetchCenters', e);
      } finally {
        setIsLoadingCenters(false);
      }
    };
    fetchCenters();
  }, []);

  // 센터 변경 시 티켓/예약 불러오기
  useEffect(() => {
    if (!selectedCenter) return;

    const fetchData = async () => {
      setIsLoadingTickets(true);
      setIsLoadingReservations(true);
      setActiveTicketIndex(0);

      try {
        const [userTicket, reservationRes] = await Promise.all([
          HomeService.getTicketsByCenter(selectedCenter.centerId),
          HomeService.getReservationsByCenter(selectedCenter.centerId),
        ]);

        const rawTickets = userTicket?.list ?? [];
        setTickets(rawTickets);

        const rawReservations = reservationRes?.list ?? [];
        setReservations(rawReservations);
      } catch (e) {
        console.error('[HomePage] fetchData', e);
        setTickets([]);
        setReservations([]);
      } finally {
        setIsLoadingTickets(false);
        setIsLoadingReservations(false);
      }
    };

    fetchData();
  }, [selectedCenter]);

  // 선택된 날짜의 예약 목록 (취소된 예약은 제외하여 홈 화면 정돈)
  const reservationsForDate = useMemo(() => {
    return reservations
      .filter(res => dayjs(res.reservationDate).isSame(selectedDate, 'day'))
      .filter(res => res.status !== 'CANCELLED')
      .sort((a, b) => dayjs(a.startTime, 'HH:mm').unix() - dayjs(b.startTime, 'HH:mm').unix());
  }, [reservations, selectedDate]);

  // 전체 예약 목록 (날짜순)
  const allReservations = useMemo(() => {
    return [...reservations].sort((a, b) =>
      dayjs(a.reservationDate).unix() - dayjs(b.reservationDate).unix()
    );
  }, [reservations]);

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

  const handleCenterSelect = (center: UserCenter) => {
    setSelectedCenter(center);
    localStorage.setItem('selectedCenterId', center.centerId);
    setIsCenterDialogOpen(false);
  };

  const handleCancel = useCallback(async (res: ReservationRes) => {
    const isToday = dayjs(res.reservationDate).isSame(dayjs(), 'day');
    if (isToday) {
      enqueueSnackbar('당일 수업은 취소가 불가능합니다.', { variant: 'warning' });
      return;
    }

    if (!confirm('이 예약을 취소하시겠습니까?')) return;

    try {
      await HomeService.cancelReservation(res.reservationId);
      enqueueSnackbar('취소되었습니다.', { variant: 'success' });
      // 상태 업데이트
      setReservations(prev =>
        prev.map(r => r.reservationId === res.reservationId ? { ...r, status: 'CANCELLED' } : r)
      );
    } catch (e) {
      enqueueSnackbar('취소 처리 중 오류가 발생했습니다.', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

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

  const currentTicket = tickets[activeTicketIndex];

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="center-selector" onClick={() => setIsCenterDialogOpen(true)}>
          <h1>{isLoadingCenters ? '불러오는 중...' : (selectedCenter?.name ?? '소속센터 없음')}</h1>
          <ChevronDown size={20} strokeWidth={2.5} />
        </div>
      </header>

      <SlideDialog
        isOpen={isCenterDialogOpen}
        onClose={() => setIsCenterDialogOpen(false)}
        title="센터 선택"
        className="home-page"
      >
        <div className="center-select-list">
          {centers.length === 0 ? (
            <div className="empty-reservations">
              <AlertCircle size={48} />
              <p>가입된 센터가 없습니다</p>
            </div>
          ) : (
            centers.map((center) => (
              <button
                key={center.centerId}
                className={`center-select-item ${selectedCenter?.centerId === center.centerId ? 'active' : ''}`}
                onClick={() => handleCenterSelect(center)}
              >
                <span className="name">{center.name}</span>
                {selectedCenter?.centerId === center.centerId && <Check size={20} className="check-icon" />}
              </button>
            ))
          )}
        </div>
      </SlideDialog>

      <div className="ticket-carousel-container">
        {isLoadingTickets ? (
          <div className="ticket-carousel">
            <div className="premium-ticket skeleton-ticket">
              <p>수강권 불러오는 중...</p>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="ticket-carousel">
            <div className="premium-ticket skeleton-ticket">
              <div className="ticket-empty">
                <CalendarDays size={32} />
                <p>등록된 수강권이 없습니다</p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`ticket-carousel ${tickets.length === 1 ? 'is-single' : ''} ${isDragging ? 'dragging' : ''}`}
            ref={carouselRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {tickets.map((ticket, i) => {
              const today = dayjs().startOf('day');
              const endDate = dayjs(ticket.endDate).startOf('day');
              const diffDays = endDate.diff(today, 'day');
              const isExpired = diffDays < 0;

              return (
                <div
                  key={ticket.ticketId}
                  className={`premium-ticket ${ticket.ticketType === 'PT' ? 'pt-ticket' : ''} ${activeTicketIndex === i ? 'active' : ''} ${isExpired ? 'expired' : ''}`}
                >
                  <div className="ticket-header">
                    <span className="center-name">{selectedCenter?.name}</span>
                    <span className={`status-badge ${isExpired ? 'expired' : ''}`}>{isExpired ? '기간만료' : '사용중'}</span>
                  </div>
                  <h2 className="ticket-name">{ticket.title}</h2>
                  <div className="usage-progress">
                    <div className="label-row">
                      <span>수강 현황</span>
                      <span className="remaining">{ticket.totalSessions - ticket.usedSessions} / {ticket.totalSessions}회</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${((ticket.totalSessions - ticket.usedSessions) / ticket.totalSessions) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="expiry-info">
                    <CalendarDays size={14} />
                    <span>
                      {dayjs(ticket.startDate).format('YYYY. M. D')} ~ {ticket.endDate && dayjs(ticket.endDate).format('YYYY. M. D')}
                      {ticket.endDate && !isExpired && (diffDays === 0 ? ' (오늘 만료)' : ` (${diffDays}일 남음)`)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tickets.length > 1 && (
          <div className="carousel-indicators">
            {tickets.map((_, i) => (
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

        {isLoadingReservations ? (
          <div className="empty-reserved-card">
            <p>예약 정보를 불러오는 중...</p>
          </div>
        ) : reservationsForDate.length > 0 ? (
          reservationsForDate.map(res => (
            <ReservedCard key={res.reservationId} reservation={res} onCancel={handleCancel} />
          ))
        ) : (
          <div className="empty-reserved-card">
            <AlertCircle size={40} className="empty-icon" />
            <p>선택하신 날짜에 예약된 수업이 없습니다</p>
            <button className="go-reserve-btn" onClick={() => window.location.href = '/reserve'}>
              수업 예약하러 가기
            </button>
          </div>
        )}
      </div>

      <SlideDialog
        isOpen={isAllReservationsOpen}
        onClose={() => setIsAllReservationsOpen(false)}
        title="전체 예약 내역"
        className="home-page"
      >
        <div className="all-reservations-view">
          <div className="current-center-info">
            <MapPin size={16} />
            <span>{selectedCenter?.name || '소속센터 없음'}</span>
          </div>

          {allReservations.length > 0 ? (
            <div className="res-list">
              {allReservations.map((res) => (
                <ReservedCard key={res.reservationId} reservation={res} onCancel={handleCancel} />
              ))}
            </div>
          ) : (
            <div className="empty-reservations">
              <AlertCircle size={48} />
              <p>예약된 수업이 없습니다</p>
            </div>
          )}
        </div>
      </SlideDialog>
    </div>
  );
}