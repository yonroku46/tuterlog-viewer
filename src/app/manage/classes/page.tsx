'use client';

import React, { useState, useMemo } from 'react';
import { useManage } from '../ManageContext';
import AppCalendar, { Value } from '@/components/contents/AppCalendar';
import { Clock, User, Plus, ChevronRight, AlertCircle, Users, CheckCircle } from 'lucide-react';
import { useSnackbar } from 'notistack';
import SlideDialog from '@/components/dialog/SlideDialog';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import '../ManageLayout.scss';

dayjs.locale('ko');

interface ClassSession {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  instructorName: string;
  room: string;
  capacity: number;
  reservedCount: number;
  students: string[];
}

export default function ManageClasses() {
  const { selectedCenter } = useManage();
  const { enqueueSnackbar } = useSnackbar();

  // Selected date state
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [instructorFilter, setInstructorFilter] = useState('All');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBookersOpen, setIsBookersOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<ClassSession | null>(null);

  // Initial Mock Class Sessions
  const [sessions, setSessions] = useState<ClassSession[]>([
    { id: '1', name: '영어 비즈니스 회화', date: dayjs().format('YYYY-MM-DD'), startTime: '09:00', endTime: '10:00', instructorName: '이지수', room: 'A강의실', capacity: 8, reservedCount: 6, students: ['김지은', '홍길동', '박준혁', '이유진', '최지민', '강동우'] },
    { id: '2', name: '기초 회화 패턴', date: dayjs().format('YYYY-MM-DD'), startTime: '10:30', endTime: '11:30', instructorName: 'David Cho', room: 'B강의실', capacity: 8, reservedCount: 8, students: ['김철수', '아오이', '임지선', '유성민', '윤서준', '한예슬', '신태호', '정다빈'] },
    { id: '3', name: 'TOEFL 실전 독해', date: dayjs().format('YYYY-MM-DD'), startTime: '13:00', endTime: '14:30', instructorName: 'Sarah Kim', room: 'A강의실', capacity: 8, reservedCount: 3, students: ['최현우', '박영호', '임은정'] },
    { id: '4', name: '1:1 비즈니스 PT', date: dayjs().format('YYYY-MM-DD'), startTime: '16:00', endTime: '17:00', instructorName: '이지수', room: 'PT룸', capacity: 1, reservedCount: 1, students: ['홍길동'] },
    { id: '5', name: '영어 비즈니스 회화', date: dayjs().add(1, 'day').format('YYYY-MM-DD'), startTime: '09:00', endTime: '10:00', instructorName: '이지수', room: 'A강의실', capacity: 8, reservedCount: 2, students: ['김지은', '홍길동'] }
  ]);

  // Form states for creating a new class session
  const [newSession, setNewSession] = useState({
    name: '영어 비즈니스 회화',
    customName: '',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '10:00',
    instructorName: '이지수',
    room: 'A강의실',
    capacity: 8
  });

  const instructors = ['이지수', 'Sarah Kim', 'David Cho'];
  const rooms = ['A강의실', 'B강의실', 'PT룸'];

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    const className = newSession.name === '직접 입력' ? newSession.customName : newSession.name;
    if (!className) {
      enqueueSnackbar('수업 명칭을 입력해 주세요.', { variant: 'error' });
      return;
    }

    const created: ClassSession = {
      id: Date.now().toString(),
      name: className,
      date: newSession.date,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      instructorName: newSession.instructorName,
      room: newSession.room,
      capacity: newSession.capacity,
      reservedCount: 0,
      students: []
    };

    setSessions(prev => [...prev, created]);
    setIsAddOpen(false);
    enqueueSnackbar(`${className} 수업 스케줄이 생성되었습니다.`, { variant: 'success' });
  };

  // Filtered sessions for the selected date and instructor
  const filteredSessions = useMemo(() => {
    const dateStr = selectedDate instanceof Date ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
    return sessions
      .filter(s => s.date === dateStr)
      .filter(s => instructorFilter === 'All' || s.instructorName === instructorFilter)
      .sort((a, b) => dayjs(a.startTime, 'HH:mm').unix() - dayjs(b.startTime, 'HH:mm').unix());
  }, [sessions, selectedDate, instructorFilter]);

  return (
    <div className="manage-classes-page">
      <div className="page-header-row">
        <div>
          <h2>수업 관리 및 일정</h2>
          <p>센터의 수업 스케줄을 설정하고 날짜별 예약자를 모니터링합니다.</p>
        </div>
        <button className="add-btn" onClick={() => setIsAddOpen(true)}>
          <Plus size={18} />
          <span>수업 일정 생성</span>
        </button>
      </div>

      {/* ── CALENDAR ── */}
      <div style={{ marginBottom: '1.5rem', background: 'var(--card-bg)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.25rem' }}>
        <AppCalendar
          onChange={setSelectedDate}
          value={selectedDate}
        />
      </div>

      {/* ── INSTRUCTOR FILTER BAR ── */}
      <div className="instructor-filter-bar">
        <span className="filter-label">강사 필터:</span>
        <button 
          className={`filter-badge ${instructorFilter === 'All' ? 'active' : ''}`}
          onClick={() => setInstructorFilter('All')}
        >
          전체 강사
        </button>
        {instructors.map(name => (
          <button
            key={name}
            className={`filter-badge ${instructorFilter === name ? 'active' : ''}`}
            onClick={() => setInstructorFilter(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* ── SESSIONS LIST ── */}
      <div className="classes-list-container">
        {filteredSessions.length === 0 ? (
          <div className="empty-classes-card">
            <AlertCircle size={40} className="empty-icon" />
            <p>선택하신 날짜 및 조건에 해당하는 등록된 수업이 없습니다.</p>
          </div>
        ) : (
          <div className="class-session-grid">
            {filteredSessions.map(session => {
              const isFull = session.reservedCount === session.capacity;
              return (
                <div key={session.id} className="class-session-card">
                  <div className="card-header">
                    <div className="time-info">
                      <Clock size={16} />
                      <strong>{session.startTime} - {session.endTime}</strong>
                    </div>
                    <span className="room-badge">{session.room}</span>
                  </div>
                  
                  <h3 className="class-title">{session.name}</h3>

                  <div className="instructor-row">
                    <User size={14} />
                    <span>담당 강사: <strong>{session.instructorName}</strong></span>
                  </div>

                  <div className="attendance-preview-row">
                    <div className="progress-info">
                      <Users size={14} />
                      <span>예약 정원: <strong>{session.reservedCount} / {session.capacity}명</strong></span>
                      {isFull && <span className="closed-badge">마감</span>}
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${(session.reservedCount / session.capacity) * 100}%`,
                          backgroundColor: isFull ? '#ef4444' : '#6366f1'
                        }}
                      />
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="view-bookers-btn"
                      onClick={() => {
                        setActiveSession(session);
                        setIsBookersOpen(true);
                      }}
                    >
                      <span>수강생 명단 ({session.reservedCount})</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SLIDE DIALOG: CREATE CLASS SCHEDULE ── */}
      <SlideDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="신규 수업 일정 개설"
        className="manage-page"
      >
        <form className="create-class-form" onSubmit={handleCreateSession}>
          <div className="form-group">
            <label>수업 명칭 선택</label>
            <select
              value={newSession.name}
              onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
            >
              <option value="영어 비즈니스 회화">영어 비즈니스 회화</option>
              <option value="기초 회화 패턴">기초 회화 패턴</option>
              <option value="TOEFL 실전 독해">TOEFL 실전 독해</option>
              <option value="1:1 비즈니스 PT">1:1 비즈니스 PT</option>
              <option value="직접 입력">직접 입력</option>
            </select>
          </div>

          {newSession.name === '직접 입력' && (
            <div className="form-group">
              <label>수업명 직접 입력 *</label>
              <input
                type="text"
                placeholder="과목명 입력 (예: 회화 중급반)"
                required
                value={newSession.customName}
                onChange={(e) => setNewSession(prev => ({ ...prev, customName: e.target.value }))}
              />
            </div>
          )}

          <div className="form-group">
            <label>수업 진행 날짜</label>
            <input
              type="date"
              required
              value={newSession.date}
              onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <div className="form-group col">
              <label>시작 시간</label>
              <input
                type="time"
                required
                value={newSession.startTime}
                onChange={(e) => setNewSession(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="form-group col">
              <label>종료 시간</label>
              <input
                type="time"
                required
                value={newSession.endTime}
                onChange={(e) => setNewSession(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>배정 강사</label>
            <select
              value={newSession.instructorName}
              onChange={(e) => setNewSession(prev => ({ ...prev, instructorName: e.target.value }))}
            >
              {instructors.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>진행 강의실</label>
            <select
              value={newSession.room}
              onChange={(e) => setNewSession(prev => ({ ...prev, room: e.target.value }))}
            >
              {rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>정원 제한 (명)</label>
            <input
              type="number"
              min={1}
              max={100}
              required
              value={newSession.capacity}
              onChange={(e) => setNewSession(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="btn-cancel" onClick={() => setIsAddOpen(false)}>취소</button>
            <button type="submit" className="btn-submit">수업 등록</button>
          </div>
        </form>
      </SlideDialog>

      {/* ── SLIDE DIALOG: VIEW BOOKERS ── */}
      <SlideDialog
        isOpen={isBookersOpen && activeSession !== null}
        onClose={() => setIsBookersOpen(false)}
        title="수업 예약 수강생 목록"
        className="manage-page"
      >
        {activeSession && (
          <div className="session-bookers-view">
            <div className="session-summary-box">
              <h4>{activeSession.name}</h4>
              <p className="time">{dayjs(activeSession.date).format('YYYY. M. D (ddd)')} {activeSession.startTime} - {activeSession.endTime}</p>
              <div className="meta">
                <span>{activeSession.room}</span>
                <span>·</span>
                <span>{activeSession.instructorName} 강사</span>
              </div>
            </div>

            <div className="bookers-section">
              <div className="section-title">예약 완료 수강생 ({activeSession.reservedCount}명)</div>
              {activeSession.students.length === 0 ? (
                <div className="empty-bookers-state">
                  <AlertCircle size={28} />
                  <p>이 수업은 아직 예약 완료된 수강생이 없습니다.</p>
                </div>
              ) : (
                <div className="bookers-list">
                  {activeSession.students.map((student, idx) => (
                    <div key={idx} className="booker-item">
                      <div className="idx">{idx + 1}</div>
                      <div className="name-avatar">{student.charAt(0)}</div>
                      <div className="name">{student} 수강생</div>
                      <div className="status"><CheckCircle size={16} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dialog-footer-actions">
              <button className="btn-primary" onClick={() => setIsBookersOpen(false)}>확인</button>
            </div>
          </div>
        )}
      </SlideDialog>
    </div>
  );
}
