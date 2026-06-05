'use client';

import React, { useState } from 'react';
import { useManage } from '../ManageContext';
import { Users, Calendar, Percent, Clock, Check, X, UserCheck } from 'lucide-react';
import { useSnackbar } from 'notistack';
import '@/app/portal/Portal.scss';
import '../ManageLayout.scss';

export default function ManageDashboard() {
  const { selectedCenter } = useManage();
  const { enqueueSnackbar } = useSnackbar();

  // Mock pending reservation requests
  const [pendingReservations, setPendingReservations] = useState([
    { id: '1', studentName: '김지은', className: '영어 비즈니스 회화', date: '2026-06-05', time: '10:00 - 11:00', instructorName: '이지수' },
    { id: '2', studentName: '박준혁', className: 'TOEFL 실전 문제풀이', date: '2026-06-05', time: '13:30 - 15:00', instructorName: 'Sarah Kim' },
    { id: '3', studentName: '최유리', className: '기초 영어 패턴 회화', date: '2026-06-06', time: '11:00 - 12:00', instructorName: 'David Cho' },
  ]);

  const handleApprove = (id: string, name: string) => {
    setPendingReservations(prev => prev.filter(item => item.id !== id));
    enqueueSnackbar(`${name}님의 예약이 최종 승인되었습니다.`, { variant: 'success' });
  };

  const handleReject = (id: string, name: string) => {
    if (confirm(`${name}님의 예약 신청을 반려하시겠습니까?`)) {
      setPendingReservations(prev => prev.filter(item => item.id !== id));
      enqueueSnackbar(`${name}님의 예약이 반려 처리되었습니다.`, { variant: 'warning' });
    }
  };

  const todayClasses = [
    { id: '101', name: '영어 비즈니스 회화', time: '09:00 - 10:00', instructor: '이지수', room: 'A강의실', booked: 6, capacity: 8, status: '진행완료' },
    { id: '102', name: '기초 회화 패턴', time: '10:30 - 11:30', instructor: 'David Cho', room: 'B강의실', booked: 8, capacity: 8, status: '진행중' },
    { id: '103', name: 'TOEFL 실전 독해', time: '13:00 - 14:30', instructor: 'Sarah Kim', room: 'A강의실', booked: 5, capacity: 8, status: '대기중' },
    { id: '104', name: '1:1 비즈니스 교정(PT)', time: '16:00 - 17:00', instructor: '이지수', room: 'PT룸', booked: 1, capacity: 1, status: '대기중' },
  ];

  return (
    <div className="manage-dashboard-page">
      <div className="dashboard-header-intro">
        <h2>{selectedCenter?.name || '소속 센터'} 관리 대시보드</h2>
        <p>센터의 운영 지표와 금일 예약 일정을 요약해 보여줍니다.</p>
      </div>

      {/* ── KEY METRICS GRID ── */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon students">
            <Users size={20} />
          </div>
          <div className="metric-info">
            <span className="label">등록 수강생 수</span>
            <h3 className="value">148명</h3>
            <span className="change positive">+8명 (이번 달 신규)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon classes">
            <Calendar size={20} />
          </div>
          <div className="metric-info">
            <span className="label">오늘 예정된 수업</span>
            <h3 className="value">14건</h3>
            <span className="change neutral">진행율 50% (7/14 완료)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon attendance">
            <Percent size={20} />
          </div>
          <div className="metric-info">
            <span className="label">금주 평균 출석률</span>
            <h3 className="value">94.2%</h3>
            <span className="change positive">+1.5% (지난주 대비)</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content-split">
        {/* ── TODAY'S CLASSES TIMELINE ── */}
        <div className="dashboard-section timeline-section">
          <div className="section-header-row">
            <h4>오늘 수업 타임라인 ({todayClasses.length}개)</h4>
            <span className="date-tag">오늘</span>
          </div>
          
          <div className="class-timeline-list">
            {todayClasses.map(cls => (
              <div key={cls.id} className={`timeline-class-card ${cls.status === '진행중' ? 'active' : ''}`}>
                <div className="time-col">
                  <Clock size={14} />
                  <span>{cls.time}</span>
                </div>
                <div className="class-body">
                  <div className="class-meta">
                    <span className="room">{cls.room}</span>
                    <span className="instructor">강사: {cls.instructor}</span>
                  </div>
                  <h5 className="class-title">{cls.name}</h5>
                  <div className="booking-status">
                    <div className="progress-text">
                      예약인원 {cls.booked}/{cls.capacity}명 
                      {cls.booked === cls.capacity && <span className="full-badge">마감</span>}
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(cls.booked / cls.capacity) * 100}%`, backgroundColor: cls.booked === cls.capacity ? '#ef4444' : '#6366f1' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="status-col">
                  <span className={`status-badge ${cls.status}`}>
                    {cls.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PENDING RESERVATIONS REVIEW ── */}
        <div className="dashboard-section reservations-review-section">
          <div className="section-header-row">
            <h4>예약 대기 신청 목록 ({pendingReservations.length}건)</h4>
          </div>

          <div className="pending-list">
            {pendingReservations.length === 0 ? (
              <div className="empty-pending-state">
                <UserCheck size={36} />
                <p>승인 대기 중인 예약 신청이 없습니다.</p>
              </div>
            ) : (
              pendingReservations.map(req => (
                <div key={req.id} className="pending-card">
                  <div className="pending-user">
                    <strong>{req.studentName}</strong> 수강생
                  </div>
                  <div className="pending-class-info">
                    <p className="title">{req.className}</p>
                    <p className="detail">{req.date} · {req.time} ({req.instructorName} 강사)</p>
                  </div>
                  <div className="pending-actions">
                    <button 
                      className="action-btn reject"
                      onClick={() => handleReject(req.id, req.studentName)}
                      title="반려"
                    >
                      <X size={16} />
                      <span>거절</span>
                    </button>
                    <button 
                      className="action-btn approve"
                      onClick={() => handleApprove(req.id, req.studentName)}
                      title="승인"
                    >
                      <Check size={16} />
                      <span>승인</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
