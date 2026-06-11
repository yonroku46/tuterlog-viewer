'use client';

import React, { useState, useMemo } from 'react';
import { useManage } from '../ManageContext';
import { Search, UserPlus, Trash2, Edit, User, Mail, Phone, Calendar, AlertCircle, FileText } from 'lucide-react';
import { useSnackbar } from 'notistack';
import SlideDialog from '@/components/dialog/SlideDialog';
import '@/app/portal/Portal.scss';
import '../ManageLayout.scss';

interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinedDate: string;
  ticketName: string;
  remainingSessions: number;
  totalSessions: number;
  status: '수강중' | '만료됨' | '대기';
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

export default function ManageCustomers() {
  const { selectedCenter } = useManage();
  const { enqueueSnackbar } = useSnackbar();

  const getStatusClass = (status: string) => {
    switch (status) {
      case '수강중': return 'enrolled';
      case '만료됨': return 'expired';
      case '대기': return 'pending';
      default: return '';
    }
  };

  // Initial Mock Students List
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: '홍길동', phone: '010-1234-5678', email: 'gildong@example.com', joinedDate: '2026-04-12', ticketName: '영어 비즈니스 회화 24회권', remainingSessions: 12, totalSessions: 24, status: '수강중' },
    { id: '2', name: '이영희', phone: '010-9876-5432', email: 'younghee@example.com', joinedDate: '2025-11-01', ticketName: 'TOEFL 실전 독해 10회권', remainingSessions: 0, totalSessions: 10, status: '만료됨' },
    { id: '3', name: '김철수', phone: '010-5555-4444', email: 'chulsoo@example.com', joinedDate: '2026-06-01', ticketName: '기초 회화 패턴 8회권', remainingSessions: 8, totalSessions: 8, status: '수강중' },
    { id: '4', name: '아오이', phone: '010-2222-3333', email: 'aoi@example.com', joinedDate: '2026-05-15', ticketName: '1:1 비즈니스 PT 20회권', remainingSessions: 15, totalSessions: 20, status: '수강중' },
    { id: '5', name: '최현우', phone: '010-8888-9999', email: 'hyunwoo@example.com', joinedDate: '2026-06-03', ticketName: '등록 대기중', remainingSessions: 0, totalSessions: 0, status: '대기' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'전체' | '수강중' | '만료됨' | '대기'>('전체');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<'수강중' | '만료됨' | '대기'>('수강중');
  const [editTicketName, setEditTicketName] = useState('');
  const [editRemainingSessions, setEditRemainingSessions] = useState(0);
  const [editTotalSessions, setEditTotalSessions] = useState(0);

  // Form states for new student
  const [newStudent, setNewStudent] = useState({
    name: '',
    phone: '',
    email: '',
    ticketName: '영어 비즈니스 회화 24회권',
    totalSessions: 24,
    status: '수강중' as '수강중' | '만료됨' | '대기'
  });

  const handleStartEdit = () => {
    if (selectedStudent) {
      setEditName(selectedStudent.name);
      setEditPhone(selectedStudent.phone);
      setEditEmail(selectedStudent.email);
      setEditStatus(selectedStudent.status);
      setEditTicketName(selectedStudent.ticketName);
      setEditRemainingSessions(selectedStudent.remainingSessions);
      setEditTotalSessions(selectedStudent.totalSessions);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editPhone) {
      enqueueSnackbar('이름과 연락처는 필수 입력값입니다.', { variant: 'error' });
      return;
    }
    if (selectedStudent) {
      const updated: Student = {
        ...selectedStudent,
        name: editName,
        phone: editPhone,
        email: editEmail || '미지정',
        status: editStatus,
        ticketName: editStatus === '대기' ? '등록 대기중' : editTicketName,
        remainingSessions: editStatus === '대기' ? 0 : editRemainingSessions,
        totalSessions: editStatus === '대기' ? 0 : editTotalSessions,
      };

      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updated : s));
      setSelectedStudent(updated);
      setIsEditing(false);
      enqueueSnackbar(`${editName} 수강생 정보가 수정되었습니다.`, { variant: 'success' });
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.phone) {
      enqueueSnackbar('이름과 연락처는 필수 입력값입니다.', { variant: 'error' });
      return;
    }

    const created: Student = {
      id: Date.now().toString(),
      name: newStudent.name,
      phone: newStudent.phone,
      email: newStudent.email || '미지정',
      joinedDate: new Date().toISOString().split('T')[0],
      ticketName: newStudent.status === '대기' ? '등록 대기중' : newStudent.ticketName,
      remainingSessions: newStudent.status === '대기' ? 0 : newStudent.totalSessions,
      totalSessions: newStudent.status === '대기' ? 0 : newStudent.totalSessions,
      status: newStudent.status
    };

    setStudents(prev => [created, ...prev]);
    setIsAddOpen(false);
    enqueueSnackbar(`${created.name} 수강생이 등록되었습니다.`, { variant: 'success' });
    
    // reset form
    setNewStudent({
      name: '',
      phone: '',
      email: '',
      ticketName: '영어 비즈니스 회화 24회권',
      totalSessions: 24,
      status: '수강중'
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`${name} 수강생 정보를 완전히 삭제하시겠습니까?`)) {
      setStudents(prev => prev.filter(item => item.id !== id));
      setIsDetailOpen(false);
      enqueueSnackbar(`${name} 수강생 정보가 삭제되었습니다.`, { variant: 'warning' });
    }
  };

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.name.includes(searchQuery) || 
        student.phone.includes(searchQuery) ||
        student.email.includes(searchQuery);
      const matchesStatus = statusFilter === '전체' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  return (
    <div className="manage-customers-page">
      <div className="page-header-row">
        <div>
          <h2>수강생 관리</h2>
          <p>센터에 등록된 모든 수강생의 수강 상태와 연락처를 관리합니다.</p>
        </div>
        <button className="add-btn" onClick={() => setIsAddOpen(true)}>
          <UserPlus size={18} />
          <span>수강생 등록</span>
        </button>
      </div>

      {/* ── SEARCH & FILTER ── */}
      <div className="filter-card">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="수강생 이름, 전화번호, 이메일로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="status-filter-tabs">
          {(['전체', '수강중', '만료됨', '대기'] as const).map(tab => (
            <button
              key={tab}
              className={`filter-tab ${statusFilter === tab ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab} ({tab === '전체' ? students.length : students.filter(s => s.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* ── CUSTOMERS TABLE / CARD LIST ── */}
      <div className="customer-list-container">
        {filteredStudents.length === 0 ? (
          <div className="empty-results-card">
            <AlertCircle size={40} className="empty-icon" />
            <p>검색 조건에 맞는 수강생이 없습니다.</p>
          </div>
        ) : (
          <div className="customer-grid">
            {filteredStudents.map(student => (
              <div 
                key={student.id} 
                className={`customer-card ${getStatusClass(student.status)}`}
                onClick={() => {
                  setSelectedStudent(student);
                  setIsEditing(false);
                  setIsDetailOpen(true);
                }}
              >
                <div className="card-top">
                  <div className="user-icon-avatar" style={{ overflow: 'hidden' }}>
                    <img 
                      src={getProfileImgByName(student.name)} 
                      alt={student.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                    />
                  </div>
                  <div className="user-meta-info">
                    <h4>{student.name}</h4>
                    <span className="joined-date">가입일: {student.joinedDate}</span>
                  </div>
                  <span className={`status-badge ${getStatusClass(student.status)}`}>
                    {student.status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <Phone size={14} />
                    <span>{student.phone}</span>
                  </div>
                  <div className="info-row">
                    <FileText size={14} />
                    <span className="ticket-title">{student.ticketName}</span>
                  </div>
                </div>

                <div className="card-footer">
                  {student.status === '대기' ? (
                    <span className="ticket-usage warning">수강권 배정 필요</span>
                  ) : (
                    <div className="ticket-usage">
                      <span>잔여 횟수</span>
                      <strong>{student.remainingSessions} / {student.totalSessions}회</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SLIDE DIALOG: ADD CUSTOMER ── */}
      <SlideDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="신규 수강생 등록"
        className="manage-page"
      >
        <form className="add-student-form" onSubmit={handleAddStudent}>
          <div className="form-group">
            <label>이름 *</label>
            <input 
              type="text" 
              placeholder="수강생 이름 입력" 
              required
              value={newStudent.name}
              onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>연락처 *</label>
            <input 
              type="tel" 
              placeholder="예: 010-1234-5678" 
              required
              value={newStudent.phone}
              onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>이메일 주소</label>
            <input 
              type="email" 
              placeholder="example@email.com" 
              value={newStudent.email}
              onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>초기 상태 설정</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="status" 
                  checked={newStudent.status === '수강중'}
                  onChange={() => setNewStudent(prev => ({ ...prev, status: '수강중' }))}
                />
                <span>수강중 (즉시 수강권 배정)</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="status" 
                  checked={newStudent.status === '대기'}
                  onChange={() => setNewStudent(prev => ({ ...prev, status: '대기' }))}
                />
                <span>등록 대기 (수강권 배정 보류)</span>
              </label>
            </div>
          </div>

          {newStudent.status === '수강중' && (
            <>
              <div className="form-group">
                <label>배정할 수강권 명칭</label>
                <select 
                  value={newStudent.ticketName}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, ticketName: e.target.value }))}
                >
                  <option value="영어 비즈니스 회화 24회권">영어 비즈니스 회화 24회권</option>
                  <option value="TOEFL 실전 독해 10회권">TOEFL 실전 독해 10회권</option>
                  <option value="기초 회화 패턴 8회권">기초 회화 패턴 8회권</option>
                  <option value="1:1 비즈니스 PT 20회권">1:1 비즈니스 PT 20회권</option>
                </select>
              </div>

              <div className="form-group">
                <label>총 수강 횟수</label>
                <input 
                  type="number" 
                  min={1} 
                  max={200}
                  value={newStudent.totalSessions}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, totalSessions: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </>
          )}

          <div className="dialog-actions-row">
            <button type="button" className="btn-cancel" onClick={() => setIsAddOpen(false)}>취소</button>
            <button type="submit" className="btn-submit">등록 완료</button>
          </div>
        </form>
      </SlideDialog>

      {/* ── SLIDE DIALOG: STUDENT DETAILS ── */}
      <SlideDialog
        isOpen={isDetailOpen && selectedStudent !== null}
        onClose={() => setIsDetailOpen(false)}
        title="수강생 상세 정보"
        className="manage-page"
      >
        {selectedStudent && (
          <div className="student-details-view">
            {isEditing ? (
              <form className="add-student-form" onSubmit={handleSaveEdit}>
                <div className="form-group">
                  <label>이름 *</label>
                  <input 
                    type="text" 
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>연락처 *</label>
                  <input 
                    type="tel" 
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>이메일 주소</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>수강 상태</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="edit-status" 
                        checked={editStatus === '수강중'}
                        onChange={() => setEditStatus('수강중')}
                      />
                      <span>수강중</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="edit-status" 
                        checked={editStatus === '대기'}
                        onChange={() => setEditStatus('대기')}
                      />
                      <span>대기</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="edit-status" 
                        checked={editStatus === '만료됨'}
                        onChange={() => setEditStatus('만료됨')}
                      />
                      <span>만료됨</span>
                    </label>
                  </div>
                </div>

                {editStatus !== '대기' && (
                  <>
                    <div className="form-group">
                      <label>배정할 수강권 명칭</label>
                      <select 
                        value={editTicketName}
                        onChange={(e) => setEditTicketName(e.target.value)}
                      >
                        <option value="영어 비즈니스 회화 24회권">영어 비즈니스 회화 24회권</option>
                        <option value="TOEFL 실전 독해 10회권">TOEFL 실전 독해 10회권</option>
                        <option value="기초 회화 패턴 8회권">기초 회화 패턴 8회권</option>
                        <option value="1:1 비즈니스 PT 20회권">1:1 비즈니스 PT 20회권</option>
                        {!['영어 비즈니스 회화 24회권', 'TOEFL 실전 독해 10회권', '기초 회화 패턴 8회권', '1:1 비즈니스 PT 20회권'].includes(editTicketName) && (
                          <option value={editTicketName}>{editTicketName}</option>
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>총 수강 횟수</label>
                      <input 
                        type="number" 
                        min={0}
                        value={editTotalSessions}
                        onChange={(e) => setEditTotalSessions(parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="form-group">
                      <label>잔여 횟수</label>
                      <input 
                        type="number" 
                        min={0}
                        max={editTotalSessions}
                        value={editRemainingSessions}
                        onChange={(e) => setEditRemainingSessions(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </>
                )}

                <div className="dialog-actions-row" style={{ marginTop: '1.5rem' }}>
                  <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>취소</button>
                  <button type="submit" className="btn-submit">수정 완료</button>
                </div>
              </form>
            ) : (
              <>
                <div className="details-header">
                  <div className="avatar-circle" style={{ overflow: 'hidden' }}>
                    <img 
                      src={getProfileImgByName(selectedStudent.name)} 
                      alt={selectedStudent.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                    />
                  </div>
                  <h3>{selectedStudent.name}</h3>
                  <span className={`status-badge ${getStatusClass(selectedStudent.status)}`}>{selectedStudent.status}</span>
                </div>

                <div className="details-info-section">
                  <h4>기본 연락 정보</h4>
                  <div className="info-detail-item">
                    <Phone size={16} />
                    <div>
                      <span className="label">전화번호</span>
                      <span className="value">{selectedStudent.phone}</span>
                    </div>
                  </div>
                  <div className="info-detail-item">
                    <Mail size={16} />
                    <div>
                      <span className="label">이메일</span>
                      <span className="value">{selectedStudent.email}</span>
                    </div>
                  </div>
                  <div className="info-detail-item">
                    <Calendar size={16} />
                    <div>
                      <span className="label">가입일자</span>
                      <span className="value">{selectedStudent.joinedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="details-info-section">
                  <h4>수강 현황</h4>
                  <div className="ticket-card-view">
                    <span className="ticket-title">{selectedStudent.ticketName}</span>
                    {selectedStudent.status === '대기' ? (
                      <p className="no-ticket-msg">등록된 활성 수강권이 없습니다.</p>
                    ) : (
                      <div className="progress-section">
                        <div className="progress-label">
                          <span>잔여 횟수</span>
                          <span>{selectedStudent.remainingSessions} / {selectedStudent.totalSessions}회</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div 
                            className="progress-bar-fill"
                            style={{ width: `${selectedStudent.totalSessions > 0 ? (selectedStudent.remainingSessions / selectedStudent.totalSessions) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-actions-row">
                  <button 
                    type="button" 
                    className="btn-danger"
                    onClick={() => handleDelete(selectedStudent.id, selectedStudent.name)}
                  >
                    <Trash2 size={16} />
                    <span>정보 삭제</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={handleStartEdit}
                  >
                    <Edit size={16} />
                    <span>정보 수정</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </SlideDialog>
    </div>
  );
}
