'use client';

import React, { useState, useMemo } from 'react';
import { useManage } from '../ManageContext';
import AppCalendar, { Value } from '@/components/contents/AppCalendar';
import { Clock, User, Plus, ChevronRight, AlertCircle, Users, CheckCircle, Edit, Trash2 } from 'lucide-react';
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

const getProfileImgByName = (name: string) => {
  if (!name) return '/assets/img/avatar1.webp';
  const mapping: { [key: string]: string } = {
    '홍길동': '/assets/img/avatar1.webp',
    '이영희': '/assets/img/avatar2.webp',
    '김철수': '/assets/img/avatar3.webp',
    '아오이': '/assets/img/avatar4.webp',
    '최현우': '/assets/img/avatar1.webp',
    '이지수': '/assets/img/avatar2.webp',
    'Sarah Kim': '/assets/img/avatar3.webp',
    'David Cho': '/assets/img/avatar4.webp',
    '김민아': '/assets/img/avatar1.webp',
    '박진우': '/assets/img/avatar2.webp',
    '김지은': '/assets/img/avatar3.webp',
    '박준혁': '/assets/img/avatar4.webp',
    '이유진': '/assets/img/avatar1.webp',
    '최지민': '/assets/img/avatar2.webp',
    '강동우': '/assets/img/avatar3.webp',
    '임지선': '/assets/img/avatar4.webp',
    '유성민': '/assets/img/avatar1.webp',
    '윤서준': '/assets/img/avatar2.webp',
    '한예슬': '/assets/img/avatar3.webp',
    '신태호': '/assets/img/avatar4.webp',
    '정다빈': '/assets/img/avatar1.webp',
    '박영호': '/assets/img/avatar2.webp',
    '임은정': '/assets/img/avatar3.webp'
  };
  if (mapping[name]) {
    return mapping[name];
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % 4) + 1;
  return `/assets/img/avatar${index}.webp`;
};

export default function ManageClasses() {
  const { selectedCenter } = useManage();
  const { enqueueSnackbar } = useSnackbar();

  // Selected date state
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [instructorFilter, setInstructorFilter] = useState('All');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBookersOpen, setIsBookersOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<ClassSession | null>(null);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);

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

  const [editForm, setEditForm] = useState({
    name: '영어 비즈니스 회화',
    customName: '',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '10:00',
    instructorName: '이지수',
    room: 'A강의실',
    capacity: 8
  });

  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly'>('none');
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0: Sun, 1: Mon, ... 6: Sat
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().add(1, 'month').format('YYYY-MM-DD'));

  const instructors = ['이지수', 'Sarah Kim', 'David Cho'];
  const rooms = ['A강의실', 'B강의실', 'PT룸'];

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    const className = newSession.name === '직접 입력' ? newSession.customName : newSession.name;
    if (!className) {
      enqueueSnackbar('수업 명칭을 입력해 주세요.', { variant: 'error' });
      return;
    }

    if (repeatType === 'none') {
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
      enqueueSnackbar(`${className} 수업 스케줄이 생성되었습니다.`, { variant: 'success' });
    } else {
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      if (end.isBefore(start)) {
        enqueueSnackbar('반복 종료일은 시작일보다 빠를 수 없습니다.', { variant: 'error' });
        return;
      }

      if (repeatType === 'weekly' && selectedDays.length === 0) {
        enqueueSnackbar('반복할 요일을 최소 하나 이상 선택해 주세요.', { variant: 'error' });
        return;
      }

      const generated: ClassSession[] = [];
      let current = start;
      let count = 0;

      while (current.isBefore(end) || current.isSame(end, 'day')) {
        let isMatch = false;
        if (repeatType === 'daily') {
          isMatch = true;
        } else if (repeatType === 'weekly') {
          const dayOfWeek = current.day(); // 0-6
          if (selectedDays.includes(dayOfWeek)) {
            isMatch = true;
          }
        }

        if (isMatch) {
          generated.push({
            id: `${Date.now()}-${count}`,
            name: className,
            date: current.format('YYYY-MM-DD'),
            startTime: newSession.startTime,
            endTime: newSession.endTime,
            instructorName: newSession.instructorName,
            room: newSession.room,
            capacity: newSession.capacity,
            reservedCount: 0,
            students: []
          });
          count++;
        }
        current = current.add(1, 'day');
      }

      if (generated.length === 0) {
        enqueueSnackbar('해당하는 반복 일정 내에 매칭되는 날짜가 없습니다.', { variant: 'error' });
        return;
      }

      setSessions(prev => [...prev, ...generated]);
      enqueueSnackbar(`${className} 반복 수업 스케줄 ${generated.length}건이 생성되었습니다.`, { variant: 'success' });
    }

    setIsAddOpen(false);
    // Reset repeating states
    setRepeatType('none');
    setSelectedDays([]);
  };

  const handleOpenEdit = (session: ClassSession) => {
    const isCustom = !['영어 비즈니스 회화', '기초 회화 패턴', 'TOEFL 실전 독해', '1:1 비즈니스 PT'].includes(session.name);
    setEditingSession(session);
    setEditForm({
      name: isCustom ? '직접 입력' : session.name,
      customName: isCustom ? session.name : '',
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      instructorName: session.instructorName,
      room: session.room,
      capacity: session.capacity
    });
    setIsEditOpen(true);
  };

  const handleUpdateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    const className = editForm.name === '직접 입력' ? editForm.customName : editForm.name;
    if (!className) {
      enqueueSnackbar('수업 명칭을 입력해 주세요.', { variant: 'error' });
      return;
    }

    setSessions(prev => prev.map(s => {
      if (s.id === editingSession.id) {
        return {
          ...s,
          name: className,
          date: editForm.date,
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          instructorName: editForm.instructorName,
          room: editForm.room,
          capacity: editForm.capacity
        };
      }
      return s;
    }));

    setIsEditOpen(false);
    setEditingSession(null);
    enqueueSnackbar('수업 일정이 수정되었습니다.', { variant: 'success' });
  };

  const handleDeleteSession = (id: string, name: string) => {
    if (window.confirm(`정말 '${name}' 수업 일정을 삭제하시겠습니까?`)) {
      setSessions(prev => prev.filter(s => s.id !== id));
      enqueueSnackbar('수업 일정이 삭제되었습니다.', { variant: 'info' });
    }
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
                <div 
                  key={session.id} 
                  className="class-session-card clickable"
                  onClick={() => {
                    setActiveSession(session);
                    setIsBookersOpen(true);
                  }}
                >
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
            <label>설정 유형 및 반복 여부</label>
            <div className="repeat-type-selector">
              <button 
                type="button" 
                className={repeatType === 'none' ? 'active' : ''} 
                onClick={() => setRepeatType('none')}
              >
                단발성
              </button>
              <button 
                type="button" 
                className={repeatType === 'daily' ? 'active' : ''} 
                onClick={() => setRepeatType('daily')}
              >
                매일 반복
              </button>
              <button 
                type="button" 
                className={repeatType === 'weekly' ? 'active' : ''} 
                onClick={() => setRepeatType('weekly')}
              >
                매주 반복
              </button>
            </div>
          </div>

          {repeatType === 'none' ? (
            <div className="form-group">
              <label>수업 진행 날짜</label>
              <input
                type="date"
                required
                value={newSession.date}
                onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group col">
                  <label>반복 시작 날짜</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group col">
                  <label>반복 종료 날짜 *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {repeatType === 'weekly' && (
                <div className="form-group">
                  <label>반복 요일 선택 *</label>
                  <div className="weekday-selector">
                    {[
                      { label: '일', value: 0 },
                      { label: '월', value: 1 },
                      { label: '화', value: 2 },
                      { label: '수', value: 3 },
                      { label: '목', value: 4 },
                      { label: '금', value: 5 },
                      { label: '토', value: 6 }
                    ].map(day => {
                      const isSelected = selectedDays.includes(day.value);
                      return (
                        <button
                          type="button"
                          key={day.value}
                          className={`day-btn ${isSelected ? 'active' : ''} ${day.value === 0 ? 'sun' : day.value === 6 ? 'sat' : ''}`}
                          onClick={() => {
                            setSelectedDays(prev => 
                              prev.includes(day.value) 
                                ? prev.filter(v => v !== day.value) 
                                : [...prev, day.value]
                            );
                          }}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

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

      {/* ── SLIDE DIALOG: EDIT CLASS SCHEDULE ── */}
      <SlideDialog
        isOpen={isEditOpen && editingSession !== null}
        onClose={() => {
          setIsEditOpen(false);
          setEditingSession(null);
        }}
        title="수업 일정 수정"
        className="manage-page"
      >
        {editingSession && (
          <form className="create-class-form" onSubmit={handleUpdateSession}>
            <div className="form-group">
              <label>수업 명칭 선택</label>
              <select
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              >
                <option value="영어 비즈니스 회화">영어 비즈니스 회화</option>
                <option value="기초 회화 패턴">기초 회화 패턴</option>
                <option value="TOEFL 실전 독해">TOEFL 실전 독해</option>
                <option value="1:1 비즈니스 PT">1:1 비즈니스 PT</option>
                <option value="직접 입력">직접 입력</option>
              </select>
            </div>

            {editForm.name === '직접 입력' && (
              <div className="form-group">
                <label>수업명 직접 입력 *</label>
                <input
                  type="text"
                  placeholder="과목명 입력 (예: 회화 중급반)"
                  required
                  value={editForm.customName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customName: e.target.value }))}
                />
              </div>
            )}

            <div className="form-group">
              <label>수업 진행 날짜</label>
              <input
                type="date"
                required
                value={editForm.date}
                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="form-row">
              <div className="form-group col">
                <label>시작 시간</label>
                <input
                  type="time"
                  required
                  value={editForm.startTime}
                  onChange={(e) => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="form-group col">
                <label>종료 시간</label>
                <input
                  type="time"
                  required
                  value={editForm.endTime}
                  onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>배정 강사</label>
              <select
                value={editForm.instructorName}
                onChange={(e) => setEditForm(prev => ({ ...prev, instructorName: e.target.value }))}
              >
                {instructors.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>진행 강의실</label>
              <select
                value={editForm.room}
                onChange={(e) => setEditForm(prev => ({ ...prev, room: e.target.value }))}
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
                value={editForm.capacity}
                onChange={(e) => setEditForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="dialog-actions-row">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingSession(null);
                }}
              >
                취소
              </button>
              <button type="submit" className="btn-submit">수정 완료</button>
            </div>
          </form>
        )}
      </SlideDialog>

      {/* ── SLIDE DIALOG: VIEW BOOKERS ── */}
      <SlideDialog
        isOpen={isBookersOpen && activeSession !== null}
        onClose={() => setIsBookersOpen(false)}
        title="수업 상세 정보"
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
                      <div className="name-avatar" style={{ overflow: 'hidden', background: 'transparent' }}>
                        <img 
                          src={getProfileImgByName(student)} 
                          alt={student} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                        />
                      </div>
                      <div className="name">{student} 수강생</div>
                      <div className="status"><CheckCircle size={16} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-actions-row">
              <button 
                type="button" 
                className="btn-danger"
                onClick={() => {
                  setIsBookersOpen(false);
                  handleDeleteSession(activeSession.id, activeSession.name);
                }}
              >
                <Trash2 size={16} />
                <span>수업 일정 삭제</span>
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => {
                  setIsBookersOpen(false);
                  handleOpenEdit(activeSession);
                }}
              >
                <Edit size={16} />
                <span>수업 일정 수정</span>
              </button>
            </div>
          </div>
        )}
      </SlideDialog>
    </div>
  );
}
