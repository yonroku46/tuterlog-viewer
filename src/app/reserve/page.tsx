'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import { User, Users, ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle2, Check, AlertCircle } from 'lucide-react';
import { useSnackbar } from 'notistack';
import SlideDialog from '@/components/dialog/SlideDialog';
import AppImage from '@/components/contents/AppImage';
import ReserveService, { ClassScheduleItem } from '@/api/service/ReserveService';
import HomeService from '@/api/service/HomeService';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import './Reserve.scss';

dayjs.locale('ko');

const TIME_FILTERS: TimeFilterOption[] = [
  { option: 'all', label: '전체', range: [0, 24] },
  { option: 'morning', label: '오전', range: [0, 12] },
  { option: 'afternoon', label: '오후', range: [12, 18] },
  { option: 'evening', label: '저녁', range: [18, 24] },
];

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function ReservePage() {
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [timeFilter, setTimeFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassScheduleItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // 센터 목록 & 선택 센터
  const [centers, setCenters] = useState<UserCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<UserCenter | null>(null);

  // 수업 목록
  const [classes, setClasses] = useState<ClassScheduleItem[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  // 센터 목록 불러오기 (홈에서 선택한 centerId 복원)
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await HomeService.getMyCenters();
        const list = res?.list ?? [];
        setCenters(list);

        const savedCenterId = localStorage.getItem('selectedCenterId');
        const saved = list.find(c => c.centerId === savedCenterId);
        setSelectedCenter(saved ?? list[0] ?? null);
      } catch (e) {
        console.error('[ReservePage] fetchCenters', e);
      }
    };
    fetchCenters();
  }, []);

  // 선택된 센터 변경 시 수업 목록 새로 불러오기
  useEffect(() => {
    if (!selectedCenter) return;
    const date = selectedDate instanceof Date ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const res = await ReserveService.getClassesByCenter(selectedCenter.centerId, date);
        setClasses(res?.list ?? []);
      } catch (e) {
        console.error('[ReservePage] fetchClasses', e);
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [selectedCenter, selectedDate]);

  const handleCenterSelect = (center: UserCenter) => {
    setSelectedCenter(center);
    localStorage.setItem('selectedCenterId', center.centerId);
    setIsFilterOpen(false);
  };

  const handleDateChange = (value: Value) => {
    setSelectedDate(value);
  };

  const handleClassClick = (cls: ClassScheduleItem) => {
    setSelectedClass(cls);
    setIsDetailOpen(true);
  };

  // 시간 필터 적용
  const filteredClasses = useMemo(() => {
    const filter = TIME_FILTERS.find(f => f.option === timeFilter);
    if (!filter || timeFilter === 'all') return classes;
    return classes.filter(cls => {
      const hour = parseInt(cls.startTime.split(':')[0]);
      return hour >= filter.range[0] && hour < filter.range[1];
    });
  }, [classes, timeFilter]);

  // 예약 처리
  const handleBook = useCallback(async () => {
    if (!selectedClass) return;
    if (isBooking) return;

    const date = selectedDate instanceof Date ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');

    setIsBooking(true);
    try {
      await ReserveService.bookClass({
        classId: selectedClass.classId,
        reservationDate: date,
      });

      const isFull = selectedClass.reservedCount >= selectedClass.capacity;
      const msg = isFull ? '대기 신청이 완료되었습니다.' : '예약이 완료되었습니다.';
      enqueueSnackbar(msg, { variant: 'success' });
      setIsDetailOpen(false);

      // 수업 목록 갱신 (예약 인원 수 업데이트)
      if (selectedCenter) {
        const res = await ReserveService.getClassesByCenter(selectedCenter.centerId, date);
        setClasses(res?.list ?? []);
      }
    } catch (e: any) {
      enqueueSnackbar(e?.message || '예약 처리 중 오류가 발생했습니다.', { variant: 'error' });
    } finally {
      setIsBooking(false);
    }
  }, [selectedClass, selectedDate, selectedCenter, isBooking, enqueueSnackbar]);

  return (
    <div className="reserve-page">
      {/* 센터/수업 유형 필터 바 */}
      <div className="filter-bar">
        <div className="filter-info">
          <span className="center-name">
            {isLoadingClasses && '불러오는 중...'}
            {!isLoadingClasses && centers.length > 0 && `${selectedCenter?.name} 수업 일정`}
            {!isLoadingClasses && centers.length === 0 && '소속센터 없음'}
          </span>
        </div>
        <button className="change-btn" disabled={centers.length === 0} onClick={() => setIsFilterOpen(true)}>
          변경
        </button>
      </div>

      {/* 센터 선택 다이얼로그 */}
      <SlideDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="센터 선택"
        className="reserve-page"
      >
        <div className="class-filter-list">
          {centers.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', opacity: 0.6 }}>
              <AlertCircle size={32} style={{ marginBottom: 8 }} />
              <p>가입된 센터가 없습니다.</p>
            </div>
          ) : (
            <div className="center-group">
              <div className="type-grid">
                {centers.map((center) => (
                  <button
                    key={center.centerId}
                    className={`type-item ${selectedCenter?.centerId === center.centerId ? 'active' : ''}`}
                    onClick={() => handleCenterSelect(center)}
                  >
                    <span className="name">{center.name}</span>
                    {selectedCenter?.centerId === center.centerId && (
                      <Check className="check-icon" size={16} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SlideDialog>

      {/* 달력 */}
      <section className="calendar-container">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          locale="ko-KR"
          next2Label={null}
          prev2Label={null}
          prevLabel={<ChevronLeft size={20} />}
          nextLabel={<ChevronRight size={20} />}
          formatDay={(locale, date) => dayjs(date).format('D')}
          calendarType="gregory"
        />
      </section>

      {/* 시간 필터 */}
      <section className="time-filter-container">
        {TIME_FILTERS.map(f => (
          <button
            key={f.option}
            className={`time-chip ${timeFilter === f.option ? 'active' : ''}`}
            onClick={() => setTimeFilter(f.option)}
          >
            {f.label}
          </button>
        ))}
      </section>

      {/* 수업 타임라인 */}
      <section className="timeline-container">
        {isLoadingClasses ? (
          <div className="empty-state">수업 정보를 불러오는 중...</div>
        ) : filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => (
            <div key={cls.classId} className="timeline-item" onClick={() => handleClassClick(cls)}>
              <div className="time-column">
                <div className="time-wrap">
                  <span className="start">{cls.startTime}</span>
                  <div className="time-line"></div>
                  <span className="end">{cls.endTime}</span>
                </div>
              </div>
              <div className="class-card">
                <div className="class-info">
                  <div className="class-header">
                    <h4 className="name">{cls.name}</h4>
                    <span className="room">{cls.room}</span>
                  </div>
                  <div className="class-footer">
                    <span className="instructor">{cls.instructorName}</span>
                    <div className={`stats ${cls.reservedCount < cls.capacity ? 'is-available' : 'is-full'}`}>
                      {cls.waitlistCount > 0 && <span className="waitlist">대기 {cls.waitlistCount}</span>}
                      <User size={14} />
                      <span className="count">{cls.reservedCount} / {cls.capacity}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="arrow-icon" />
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">해당 시간대에 예정된 수업이 없습니다.</div>
        )}
      </section>

      {/* 수업 상세 / 예약 다이얼로그 */}
      <SlideDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="수업 상세 정보"
        className="reserve-page"
        footer={selectedClass && (
          <button
            className={`reserve-action-btn ${selectedClass.reservedCount >= selectedClass.capacity ? 'is-full' : ''}`}
            onClick={handleBook}
            disabled={isBooking}
          >
            {isBooking
              ? '처리 중...'
              : selectedClass.reservedCount < selectedClass.capacity
                ? '수업 예약하기'
                : '대기 신청하기'}
          </button>
        )}
      >
        {selectedClass && (
          <div className="class-detail-view">
            <div className="detail-header">
              <div className="img-box">
                <AppImage
                  src={selectedClass.image}
                  alt={selectedClass.instructorName}
                  fill
                  style={{ objectFit: 'cover' }}
                  fallback={
                    <div className="fallback-icon">
                      <User size={24} color="#aeaeb2" />
                    </div>
                  }
                />
              </div>
              <div className="info-box">
                <h2>{selectedClass.name}</h2>
                <p className="instructor">{selectedClass.instructorName}</p>
              </div>
            </div>

            <div className="detail-grid">
              <div className="item">
                <Clock size={18} />
                <div className="text">
                  <span className="label">시간</span>
                  <span className="val">
                    {dayjs(selectedDate as Date).format('YYYY. M. D (ddd)')} {selectedClass.startTime} - {selectedClass.endTime}
                  </span>
                </div>
              </div>
              <div className="item">
                <MapPin size={18} />
                <div className="text">
                  <span className="label">장소</span>
                  <span className="val">{selectedClass.room}</span>
                </div>
              </div>
              <div className="item">
                <Users size={18} />
                <div className="text">
                  <span className="label">정원</span>
                  <span className="val">현재 {selectedClass.reservedCount}명 / 정원 {selectedClass.capacity}명</span>
                </div>
              </div>
              {selectedClass.waitlistCount > 0 && (
                <div className="item">
                  <AlertCircle size={18} />
                  <div className="text">
                    <span className="label">대기</span>
                    <span className="val">현재 {selectedClass.waitlistCount}명 대기 중</span>
                  </div>
                </div>
              )}
            </div>

            <div className="notice-box">
              <h3><CheckCircle2 size={16} /> 예약 안내</h3>
              <ul>
                <li>수업 시작 10분 전까지 입장해주세요.</li>
                <li>취소는 하루 전까지 시스템을 이용해 가능합니다.</li>
                <li>노쇼 및 당일 취소 시 이용권이 차감됩니다.</li>
              </ul>
            </div>
          </div>
        )}
      </SlideDialog>
    </div>
  );
}
