'use client';

import React, { useState, useMemo } from 'react';
import { useManage } from '../ManageContext';
import { Search, UserPlus, Trash2, Edit, User, Mail, Phone, Calendar, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';
import { useSnackbar } from 'notistack';
import SlideDialog from '@/components/dialog/SlideDialog';
import '@/app/portal/Portal.scss';
import '../ManageLayout.scss';

interface Instructor {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinedDate: string;
  specialty: string;
  bio: string;
  status: '활동중' | '계약대기' | '활동정지';
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

export default function ManageInstructors() {
  const { selectedCenter } = useManage();
  const { enqueueSnackbar } = useSnackbar();

  // Initial Mock Instructors List
  const [instructors, setInstructors] = useState<Instructor[]>([
    { id: '1', name: '이지수', phone: '010-1234-5678', email: 'jeesoo.lee@example.com', joinedDate: '2025-03-10', specialty: '영어 비즈니스 회화, 1:1 비즈니스 PT', bio: '실무 비즈니스 영어 전문 강사입니다.', status: '활동중' },
    { id: '2', name: 'Sarah Kim', phone: '010-9876-5432', email: 'sarah.kim@example.com', joinedDate: '2025-08-15', specialty: 'TOEFL 실전 독해, 영작문', bio: '토플 고득점 및 아카데믹 라이팅 강사입니다.', status: '활동중' },
    { id: '3', name: 'David Cho', phone: '010-5555-4444', email: 'david.cho@example.com', joinedDate: '2026-01-20', specialty: '기초 회화 패턴, 생활 영어', bio: '친절하고 쉬운 기초 영어 회화 지도 전문입니다.', status: '활동중' },
    { id: '4', name: '김민아', phone: '010-1111-2222', email: 'mina.kim@example.com', joinedDate: '2026-05-28', specialty: 'OPIc 대비반, 영어 면접', bio: '외국계 기업 면접 및 OPIc 스피킹 집중 지도 강사입니다.', status: '계약대기' },
    { id: '5', name: '박진우', phone: '010-7777-8888', email: 'jinwoo.park@example.com', joinedDate: '2024-05-01', specialty: '영어 청취, 시사 영어', bio: 'CNN 뉴스 청취 및 영미 시사 영어 토론 리더입니다.', status: '활동정지' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'전체' | '활동중' | '계약대기' | '활동정지'>('전체');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editStatus, setEditStatus] = useState<'활동중' | '계약대기' | '활동정지'>('활동중');

  // Form states for new instructor
  const [newInstructor, setNewInstructor] = useState({
    name: '',
    phone: '',
    email: '',
    specialty: '영어 비즈니스 회화',
    bio: '',
    status: '활동중' as '활동중' | '계약대기' | '활동정지'
  });

  const handleStartEdit = () => {
    if (selectedInstructor) {
      setEditName(selectedInstructor.name);
      setEditPhone(selectedInstructor.phone);
      setEditEmail(selectedInstructor.email);
      setEditSpecialty(selectedInstructor.specialty);
      setEditBio(selectedInstructor.bio);
      setEditStatus(selectedInstructor.status);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editPhone) {
      enqueueSnackbar('이름과 연락처는 필수 입력값입니다.', { variant: 'error' });
      return;
    }
    if (selectedInstructor) {
      const updated: Instructor = {
        ...selectedInstructor,
        name: editName,
        phone: editPhone,
        email: editEmail || '미지정',
        specialty: editSpecialty,
        bio: editBio || '등록된 소개글이 없습니다.',
        status: editStatus
      };

      setInstructors(prev => prev.map(s => s.id === selectedInstructor.id ? updated : s));
      setSelectedInstructor(updated);
      setIsEditing(false);
      enqueueSnackbar(`${editName} 강사 정보가 수정되었습니다.`, { variant: 'success' });
    }
  };

  const handleAddInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstructor.name || !newInstructor.phone) {
      enqueueSnackbar('이름과 연락처는 필수 입력값입니다.', { variant: 'error' });
      return;
    }

    const created: Instructor = {
      id: Date.now().toString(),
      name: newInstructor.name,
      phone: newInstructor.phone,
      email: newInstructor.email || '미지정',
      joinedDate: new Date().toISOString().split('T')[0],
      specialty: newInstructor.specialty,
      bio: newInstructor.bio || '등록된 소개글이 없습니다.',
      status: newInstructor.status
    };

    setInstructors(prev => [created, ...prev]);
    setIsAddOpen(false);
    enqueueSnackbar(`${created.name} 강사가 등록되었습니다.`, { variant: 'success' });
    
    // reset form
    setNewInstructor({
      name: '',
      phone: '',
      email: '',
      specialty: '영어 비즈니스 회화',
      bio: '',
      status: '활동중'
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`${name} 강사 계약 및 관련 정보를 완전히 삭제하시겠습니까?`)) {
      setInstructors(prev => prev.filter(item => item.id !== id));
      setIsDetailOpen(false);
      enqueueSnackbar(`${name} 강사 정보가 삭제되었습니다.`, { variant: 'warning' });
    }
  };

  // Filtered Instructors list
  const filteredInstructors = useMemo(() => {
    return instructors.filter(instructor => {
      const matchesSearch = 
        instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        instructor.phone.includes(searchQuery) ||
        instructor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instructor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === '전체' || instructor.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [instructors, searchQuery, statusFilter]);

  return (
    <div className="manage-customers-page">
      <div className="page-header-row">
        <div>
          <h2>강사 관리</h2>
          <p>센터에 소속된 강사 프로필, 연락처 및 활동 상태를 효율적으로 관리합니다.</p>
        </div>
        <button className="add-btn" onClick={() => setIsAddOpen(true)}>
          <UserPlus size={18} />
          <span>강사 등록</span>
        </button>
      </div>

      {/* ── SEARCH & FILTER ── */}
      <div className="filter-card">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="강사 이름, 전화번호, 담당 과목으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="status-filter-tabs">
          {(['전체', '활동중', '계약대기', '활동정지'] as const).map(tab => (
            <button
              key={tab}
              className={`filter-tab ${statusFilter === tab ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab} ({tab === '전체' ? instructors.length : instructors.filter(s => s.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* ── INSTRUCTORS CARD LIST ── */}
      <div className="customer-list-container">
        {filteredInstructors.length === 0 ? (
          <div className="empty-results-card">
            <AlertCircle size={40} className="empty-icon" />
            <p>검색 조건에 맞는 강사가 없습니다.</p>
          </div>
        ) : (
          <div className="customer-grid">
            {filteredInstructors.map(instructor => (
              <div 
                key={instructor.id} 
                className={`customer-card ${instructor.status === '활동중' ? '수강중' : instructor.status === '계약대기' ? '대기' : '만료됨'}`}
                onClick={() => {
                  setSelectedInstructor(instructor);
                  setIsEditing(false);
                  setIsDetailOpen(true);
                }}
              >
                <div className="card-top">
                  <div className="user-icon-avatar" style={{ overflow: 'hidden' }}>
                    <img 
                      src={getProfileImgByName(instructor.name)} 
                      alt={instructor.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                    />
                  </div>
                  <div className="user-meta-info">
                    <h4>{instructor.name}</h4>
                    <span className="joined-date">등록일: {instructor.joinedDate}</span>
                  </div>
                  <span className={`status-badge ${instructor.status === '활동중' ? '수강중' : instructor.status === '계약대기' ? '대기' : '만료됨'}`}>
                    {instructor.status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <Phone size={14} />
                    <span>{instructor.phone}</span>
                  </div>
                  <div className="info-row">
                    <BookOpen size={14} />
                    <span className="ticket-title">{instructor.specialty}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="ticket-usage">
                    <span>소개</span>
                    <strong style={{ fontWeight: 500, fontSize: '0.8125rem', color: 'var(--slate-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                      {instructor.bio}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SLIDE DIALOG: ADD INSTRUCTOR ── */}
      <SlideDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="신규 강사 등록"
        className="manage-page"
      >
        <form className="add-student-form" onSubmit={handleAddInstructor}>
          <div className="form-group">
            <label>이름 *</label>
            <input 
              type="text" 
              placeholder="강사 이름 입력" 
              required
              value={newInstructor.name}
              onChange={(e) => setNewInstructor(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>연락처 *</label>
            <input 
              type="tel" 
              placeholder="예: 010-1234-5678" 
              required
              value={newInstructor.phone}
              onChange={(e) => setNewInstructor(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>이메일 주소</label>
            <input 
              type="email" 
              placeholder="example@email.com" 
              value={newInstructor.email}
              onChange={(e) => setNewInstructor(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>전문 강의 분야</label>
            <input 
              type="text" 
              placeholder="예: 비즈니스 회화, 토플 독해" 
              value={newInstructor.specialty}
              onChange={(e) => setNewInstructor(prev => ({ ...prev, specialty: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>한줄 소개</label>
            <textarea 
              placeholder="강사 소개글을 입력해 주세요." 
              rows={3}
              value={newInstructor.bio}
              onChange={(e) => setNewInstructor(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>활동 상태 설정</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="status" 
                  checked={newInstructor.status === '활동중'}
                  onChange={() => setNewInstructor(prev => ({ ...prev, status: '활동중' }))}
                />
                <span>활동중 (즉시 수업 배정 가능)</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="status" 
                  checked={newInstructor.status === '계약대기'}
                  onChange={() => setNewInstructor(prev => ({ ...prev, status: '계약대기' }))}
                />
                <span>계약 대기 (수업 개설 대기)</span>
              </label>
            </div>
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="btn-cancel" onClick={() => setIsAddOpen(false)}>취소</button>
            <button type="submit" className="btn-submit">등록 완료</button>
          </div>
        </form>
      </SlideDialog>

      {/* ── SLIDE DIALOG: INSTRUCTOR DETAILS ── */}
      <SlideDialog
        isOpen={isDetailOpen && selectedInstructor !== null}
        onClose={() => setIsDetailOpen(false)}
        title="강사 상세 프로필"
        className="manage-page"
      >
        {selectedInstructor && (
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
                  <label>전문 강의 분야</label>
                  <input 
                    type="text" 
                    value={editSpecialty}
                    onChange={(e) => setEditSpecialty(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>한줄 소개</label>
                  <textarea 
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>활동 상태</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="edit-status" 
                        checked={editStatus === '활동중'}
                        onChange={() => setEditStatus('활동중')}
                      />
                      <span>활동중</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="edit-status" 
                        checked={editStatus === '계약대기'}
                        onChange={() => setEditStatus('계약대기')}
                      />
                      <span>계약대기</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="edit-status" 
                        checked={editStatus === '활동정지'}
                        onChange={() => setEditStatus('활동정지')}
                      />
                      <span>활동정지</span>
                    </label>
                  </div>
                </div>

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
                      src={getProfileImgByName(selectedInstructor.name)} 
                      alt={selectedInstructor.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                    />
                  </div>
                  <h3>{selectedInstructor.name}</h3>
                  <span className={`status-badge ${selectedInstructor.status === '활동중' ? '수강중' : selectedInstructor.status === '계약대기' ? '대기' : '만료됨'}`}>
                    {selectedInstructor.status}
                  </span>
                </div>

                <div className="details-info-section">
                  <h4>기본 연락 정보</h4>
                  <div className="info-detail-item">
                    <Phone size={16} />
                    <div>
                      <span className="label">전화번호</span>
                      <span className="value">{selectedInstructor.phone}</span>
                    </div>
                  </div>
                  <div className="info-detail-item">
                    <Mail size={16} />
                    <div>
                      <span className="label">이메일</span>
                      <span className="value">{selectedInstructor.email}</span>
                    </div>
                  </div>
                  <div className="info-detail-item">
                    <Calendar size={16} />
                    <div>
                      <span className="label">계약 등록일</span>
                      <span className="value">{selectedInstructor.joinedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="details-info-section">
                  <h4>강사 소개 및 전문 분야</h4>
                  <div className="ticket-card-view" style={{ background: 'linear-gradient(135deg, var(--slate-700) 0%, var(--slate-900) 100%)' }}>
                    <span className="ticket-title">{selectedInstructor.specialty}</span>
                    <p className="no-ticket-msg" style={{ color: 'var(--slate-200)', fontStyle: 'normal', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                      {selectedInstructor.bio}
                    </p>
                  </div>
                </div>

                <div className="detail-actions-row">
                  <button 
                    type="button" 
                    className="btn-danger"
                    onClick={() => handleDelete(selectedInstructor.id, selectedInstructor.name)}
                  >
                    <Trash2 size={16} />
                    <span>계약 해지 (삭제)</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={handleStartEdit}
                  >
                    <Edit size={16} />
                    <span>프로필 수정</span>
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
