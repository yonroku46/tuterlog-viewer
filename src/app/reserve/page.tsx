'use client';

import { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { User, Users, ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle2, Check } from 'lucide-react';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import SlideDialog from '@/components/dialog/SlideDialog';
import AppImage from '@/components/contents/AppImage';
import './Reserve.scss';

dayjs.locale('ko');

const CENTER_CLASSES: CenterClasses[] = [
  {
    centerName: '센터명 필라테스 서초점',
    types: ['10:1 그룹 수업', '1:1 개인 레슨', '2:1 듀엣 레슨']
  },
  {
    centerName: '센터명 필라테스 강남점',
    types: ['10:1 그룹 수업', '1:1 개인 레슨']
  },
  {
    centerName: '센터명 필라테스 역삼점',
    types: ['10:1 그룹 수업', '6:1 기구 필라테스']
  }
];

const CLASSES: ClassInfo[] = [
  { classId: '1', startTime: '09:00', endTime: '09:50', name: '리포머 필라테스 A', instructor: { instructorId: '1', name: '이은주 강사', centerId: '0', profileImg: '', role: '', createTime: '' }, room: 'Room 1', reserved: 7, capacity: 10, image: 'https://images.unsplash.com/photo-1518611012118-296072bb56ec?w=100&h=100&fit=crop' },
  { classId: '2', startTime: '10:00', endTime: '10:50', name: '캐딜락 & 체어', instructor: { instructorId: '2', name: '김미나 강사', centerId: '0', profileImg: '', role: '', createTime: '' }, room: 'Room 2', reserved: 10, capacity: 10, waitlist: 4, image: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=100&h=100&fit=crop' },
  { classId: '3', startTime: '11:00', endTime: '11:50', name: '리포머 필라테스 B', instructor: { instructorId: '1', name: '이은주 강사', centerId: '0', profileImg: '', role: '', createTime: '' }, room: 'Room 1', reserved: 4, capacity: 10, image: 'https://images.unsplash.com/photo-1518611012118-296072bb56ec?w=100&h=100&fit=crop' },
  { classId: '4', startTime: '14:00', endTime: '14:50', name: '체어 & 바렐', instructor: { instructorId: '3', name: '박서영 강사', centerId: '0', profileImg: '', role: '', createTime: '' }, room: 'Room 3', reserved: 8, capacity: 10, image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=100&h=100&fit=crop' },
  { classId: '5', startTime: '16:00', endTime: '16:50', name: '리포머 필라테스 C', instructor: { instructorId: '2', name: '김미나 강사', centerId: '0', profileImg: '', role: '', createTime: '' }, room: 'Room 1', reserved: 6, capacity: 10, image: 'https://images.unsplash.com/photo-1518611012118-296072bb56ec?w=100&h=100&fit=crop' },
  { classId: '6', startTime: '19:00', endTime: '19:50', name: '리포머 야간 A', instructor: { instructorId: '1', name: '이은주 강사', centerId: '0', profileImg: '', role: '', createTime: '' }, room: 'Room 1', reserved: 9, capacity: 10, image: 'https://images.unsplash.com/photo-1518611012118-296072bb56ec?w=100&h=100&fit=crop' },
  { classId: '7', startTime: '20:00', endTime: '20:50', name: '캐딜락 야간 B', instructor: { instructorId: '3', name: '박서영 강사', centerId: '0', profileImg: '', role: '', createTime: '' }, room: 'Room 2', reserved: 10, capacity: 10, waitlist: 2, image: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=100&h=100&fit=crop' },
  { classId: '8', startTime: '21:00', endTime: '21:50', name: '파워 필라테스', instructor: { instructorId: '2', name: '김미나 강사', centerId: '0', profileImg: '', role: '', createTime: '' }, room: 'Room 3', reserved: 5, capacity: 10, image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=100&h=100&fit=crop' },
];

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
  const [selectedFilter, setSelectedFilter] = useState({
    center: CENTER_CLASSES[0].centerName,
    type: CENTER_CLASSES[0].types[0]
  });
  const [timeFilter, setTimeFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const filteredClasses = useMemo(() => {
    const filter = TIME_FILTERS.find(f => f.option === timeFilter);
    if (!filter || timeFilter === 'all') return CLASSES;
    
    return CLASSES.filter(cls => {
      const hour = parseInt(cls.startTime.split(':')[0]);
      return hour >= filter.range[0] && hour < filter.range[1];
    });
  }, [timeFilter]);

  const handleDateChange = (value: Value) => {
    setSelectedDate(value);
  };

  const handleClassClick = (cls: typeof CLASSES[0]) => {
    setSelectedClass(cls);
    setIsDetailOpen(true);
  };

  return (
    <div className="reserve-page">
      <div className="filter-bar">
        <div className="filter-info">
          <span className="type">{selectedFilter.type}</span>
          <span className="center-name">{selectedFilter.center}</span>
        </div>
        <button className="change-btn" onClick={() => setIsFilterOpen(true)}>변경</button>
      </div>

      <SlideDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="수업 변경"
      >
        <div className="class-filter-list">
          {CENTER_CLASSES.map((center, idx) => (
            <div key={idx} className="center-group">
              <h3 className="group-title">{center.centerName}</h3>
              <div className="type-grid">
                {center.types.map((type) => (
                  <button 
                    key={type}
                    className={`type-item ${selectedFilter.center === center.centerName && selectedFilter.type === type ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFilter({ center: center.centerName, type });
                      setIsFilterOpen(false);
                    }}
                  >
                    <span className="name">{type}</span>
                    {selectedFilter.center === center.centerName && selectedFilter.type === type && (
                      <Check className="check-icon" size={16} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SlideDialog>

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

      <section className="timeline-container">
        {filteredClasses.length > 0 ? (
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
                    <span className="instructor">{cls.instructor.name}</span>
                    <div className={`stats ${cls.reserved < cls.capacity ? 'is-available' : 'is-full'}`}>
                      {cls.waitlist && <span className="waitlist">대기 {cls.waitlist}</span>}
                      <User size={14} />
                      <span className="count">{cls.reserved} / {cls.capacity}</span>
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

      <SlideDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="수업 상세 정보"
        footer={selectedClass && (
          <button 
            className={`reserve-action-btn ${selectedClass.reserved >= selectedClass.capacity ? 'is-full' : ''}`} 
            onClick={() => {
              const msg = selectedClass.reserved < selectedClass.capacity ? '예약이 완료되었습니다.' : '대기 신청이 완료되었습니다.';
              enqueueSnackbar(msg, { variant: 'success' });
              setIsDetailOpen(false);
            }}
          >
            {selectedClass.reserved < selectedClass.capacity ? '수업 예약하기' : '대기 신청하기'}
          </button>
        )}
      >
        {selectedClass && (
          <div className="class-detail-view">
            <div className="detail-header">
              <div className="img-box">
                <AppImage 
                  src={selectedClass.image} 
                  alt={selectedClass.instructor.name} 
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
                <p className="instructor">{selectedClass.instructor.name}</p>
              </div>
            </div>

            <div className="detail-grid">
              <div className="item">
                <Clock size={18} />
                <div className="text">
                  <span className="label">시간</span>
                  <span className="val">{selectedClass.startTime} - {selectedClass.endTime} (50분)</span>
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
                  <span className="val">현재 {selectedClass.reserved}명 / 정원 {selectedClass.capacity}명</span>
                </div>
              </div>
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
