'use client';

import React, { useState } from 'react';
import { useManage } from '../ManageContext';
import SlideDialog from '@/components/dialog/SlideDialog';
import { useSnackbar } from 'notistack';
import { Plus, Search, Tag, Calendar, Coins, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import '../ManageLayout.scss';

interface Ticket {
  id: string;
  name: string;
  type: '횟수제' | '기간제';
  count: number; // 횟수제일 경우 횟수
  duration: number; // 유효기간 (개월)
  price: number;
  description: string;
  status: '판매중' | '판매중지';
}

export default function TicketManagementPage() {
  const { selectedCenter } = useManage();
  const { enqueueSnackbar } = useSnackbar();

  // Mock initial tickets
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      name: '영어 비즈니스 회화 24회권',
      type: '횟수제',
      count: 24,
      duration: 6,
      price: 720000,
      description: '비즈니스 실무에 특화된 1:1 집중 회화 과정입니다.',
      status: '판매중',
    },
    {
      id: '2',
      name: 'TOEFL 실전 독해 10회권',
      type: '횟수제',
      count: 10,
      duration: 3,
      price: 350000,
      description: '토플 독해 영역 단기 고득점을 위한 실전 대비반입니다.',
      status: '판매중',
    },
    {
      id: '3',
      name: '기초 회화 패턴 8회권',
      type: '횟수제',
      count: 8,
      duration: 2,
      price: 240000,
      description: '기본적인 문법을 바탕으로 핵심 패턴 회화를 학습합니다.',
      status: '판매중',
    },
    {
      id: '4',
      name: '1:1 비즈니스 PT 20회권',
      type: '횟수제',
      count: 20,
      duration: 6,
      price: 1200000,
      description: '개인 맞춤형 비즈니스 발표 및 회화 코칭 20회권입니다.',
      status: '판매중',
    },
    {
      id: '5',
      name: '여름방학 집중 토익 패스',
      type: '기간제',
      count: 0,
      duration: 1,
      price: 450000,
      description: '여름방학 시즌 한정 1개월 동안 전 타임 자유 수강권입니다.',
      status: '판매중지',
    },
  ]);

  // Tab & Search States
  const [activeTab, setActiveTab] = useState<'전체' | '판매중' | '판매중지'>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog Control
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Form Field States
  const [formData, setFormData] = useState<Omit<Ticket, 'id'>>({
    name: '',
    type: '횟수제',
    count: 10,
    duration: 3,
    price: 300000,
    description: '',
    status: '판매중',
  });

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingTicket(null);
    setFormData({
      name: '',
      type: '횟수제',
      count: 10,
      duration: 3,
      price: 300000,
      description: '',
      status: '판매중',
    });
    setIsFormOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      type: ticket.type,
      count: ticket.count,
      duration: ticket.duration,
      price: ticket.price,
      description: ticket.description,
      status: ticket.status,
    });
    setIsFormOpen(true);
  };

  // Open Detail Dialog
  const handleOpenDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  // Form Submit Handler (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      enqueueSnackbar('수강권 이름을 입력해 주세요.', { variant: 'error' });
      return;
    }

    if (editingTicket) {
      // Update
      setTickets(prev =>
        prev.map(t =>
          t.id === editingTicket.id ? { ...t, ...formData } : t
        )
      );
      // Synchronize currently opened detail view if editing the active ticket
      if (selectedTicket && selectedTicket.id === editingTicket.id) {
        setSelectedTicket({ id: editingTicket.id, ...formData } as Ticket);
      }
      enqueueSnackbar('수강권 정보가 수정되었습니다.', { variant: 'success' });
    } else {
      // Create
      const newTicket: Ticket = {
        id: Date.now().toString(),
        ...formData,
      };
      setTickets(prev => [newTicket, ...prev]);
      enqueueSnackbar('새로운 수강권이 등록되었습니다.', { variant: 'success' });
    }
    setIsFormOpen(false);
  };

  // Toggle Ticket Sales Status
  const toggleStatus = (id: string, currentStatus: '판매중' | '판매중지') => {
    const nextStatus = currentStatus === '판매중' ? '판매중지' : '판매중';
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: nextStatus } : t))
    );
    enqueueSnackbar(
      `수강권 판매 상태가 [${nextStatus}] 상태로 변경되었습니다.`,
      { variant: 'info' }
    );
  };

  // Delete Ticket
  const handleDelete = (id: string, name: string) => {
    if (confirm(`[${name}] 수강권을 정말로 삭제하시겠습니까? \n이미 회원에게 할당된 기존 수강권에는 영향을 주지 않습니다.`)) {
      setTickets(prev => prev.filter(t => t.id !== id));
      enqueueSnackbar('수강권이 성공적으로 삭제되었습니다.', { variant: 'success' });
    }
  };

  // Filtered List
  const filteredTickets = tickets.filter(ticket => {
    const matchesTab = activeTab === '전체' || ticket.status === activeTab;
    const matchesSearch =
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="manage-tickets-page">
      {/* ── PAGE HEADER ── */}
      <div className="page-header-row">
        <div>
          <h2>수강권 설정 및 관리</h2>
          <p>{selectedCenter?.name ?? '소속 센터'}의 수강 상품 정보와 단가를 지정합니다.</p>
        </div>
        <button className="add-btn" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>신규 수강권 추가</span>
        </button>
      </div>

      {/* ── FILTERS & SEARCH ── */}
      <div className="filter-card">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="수강권 이름 또는 설명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="status-filter-tabs">
          {(['전체', '판매중', '판매중지'] as const).map(tab => (
            <button
              key={tab}
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── TICKET CARD GRID ── */}
      {filteredTickets.length > 0 ? (
        <div className="ticket-grid">
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              className={`ticket-management-card ${ticket.status === '판매중지' ? 'suspended' : ''}`}
              onClick={() => handleOpenDetail(ticket)}
            >
              <div className="card-top">
                <span className={`status-badge ${ticket.status}`}>
                  {ticket.status}
                </span>
                <span className="type-badge">{ticket.type}</span>
              </div>

              <h4 className="ticket-title">{ticket.name}</h4>
              <p className="ticket-desc">{ticket.description || '수강권에 대한 세부 설명이 등록되어 있지 않습니다.'}</p>

              <div className="ticket-details-box">
                <div className="detail-item">
                  <Tag size={14} />
                  <span>
                    {ticket.type === '횟수제' ? `${ticket.count}회 제공` : '무제한 수강'}
                  </span>
                </div>
                <div className="detail-item">
                  <Calendar size={14} />
                  <span>유효기간 {ticket.duration}개월</span>
                </div>
                <div className="detail-item price-row">
                  <Coins size={14} />
                  <strong>₩{ticket.price.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-results-card">
          <Tag size={40} className="empty-icon" />
          <p>해당하는 수강권 상품이 존재하지 않습니다.</p>
        </div>
      )}

      {/* ── SLIDE DIALOG: ADD/EDIT TICKET ── */}
      <SlideDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTicket ? '수강권 상품 수정' : '신규 수강권 등록'}
        className="manage-page"
      >
        <form className="add-student-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>수강권 상품명 *</label>
            <input
              type="text"
              placeholder="예: 영어 실전 회화 24회권"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>수강권 유형 *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="ticket-type"
                  checked={formData.type === '횟수제'}
                  onChange={() => setFormData(prev => ({ ...prev, type: '횟수제' }))}
                />
                <span>횟수제 (정해진 횟수만큼 예약)</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="ticket-type"
                  checked={formData.type === '기간제'}
                  onChange={() => setFormData(prev => ({ ...prev, type: '기간제', count: 0 }))}
                />
                <span>기간제 (기간 내 횟수 제한 없이 이용)</span>
              </label>
            </div>
          </div>

          {formData.type === '횟수제' && (
            <div className="form-group">
              <label>제공 횟수 (회) *</label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={formData.count}
                onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) || 0 }))}
              />
            </div>
          )}

          <div className="form-group">
            <label>유효 기간 (개월 단위) *</label>
            <input
              type="number"
              min={1}
              max={60}
              required
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="form-group">
            <label>수강 상품 가격 (원) *</label>
            <input
              type="number"
              min={0}
              required
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="form-group">
            <label>설명 및 유의사항</label>
            <textarea
              placeholder="수강생들에게 안내될 수강권 소개 문구를 입력하세요."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="btn-cancel" onClick={() => setIsFormOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn-submit">
              {editingTicket ? '정보 수정' : '수강권 생성'}
            </button>
          </div>
        </form>
      </SlideDialog>

      {/* ── SLIDE DIALOG: TICKET DETAILS ── */}
      <SlideDialog
        isOpen={isDetailOpen && selectedTicket !== null}
        onClose={() => setIsDetailOpen(false)}
        title="수강권 상세 정보"
        className="manage-page"
      >
        {selectedTicket && (
          <div className="student-details-view">
            <div className="details-header">
              <div className="avatar-circle">
                <Tag size={28} />
              </div>
              <h3>{selectedTicket.name}</h3>
              <span className={`status-badge ${selectedTicket.status}`}>
                {selectedTicket.status}
              </span>
            </div>

            <div className="details-info-section">
              <h4>상세 설정 정보</h4>
              
              <div className="info-detail-item">
                <Tag size={18} />
                <div>
                  <span className="label">수강권 유형</span>
                  <span className="value">{selectedTicket.type}</span>
                </div>
              </div>

              {selectedTicket.type === '횟수제' && (
                <div className="info-detail-item">
                  <Coins size={18} />
                  <div>
                    <span className="label">제공 횟수</span>
                    <span className="value">{selectedTicket.count}회 예약 가능</span>
                  </div>
                </div>
              )}

              <div className="info-detail-item">
                <Calendar size={18} />
                <div>
                  <span className="label">유효 기간</span>
                  <span className="value">등록일 기준 {selectedTicket.duration}개월</span>
                </div>
              </div>

              <div className="info-detail-item">
                <Coins size={18} />
                <div>
                  <span className="label">요금 단가</span>
                  <span className="value">₩{selectedTicket.price.toLocaleString()} 원</span>
                </div>
              </div>
            </div>

            {selectedTicket.description && (
              <div className="details-info-section">
                <h4>설명 및 특이사항</h4>
                <div className="info-detail-item" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <span className="value" style={{ fontWeight: 500, lineHeight: 1.5, fontSize: '0.875rem' }}>
                      {selectedTicket.description}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="detail-actions-row">
              <button
                className="btn-danger"
                onClick={() => {
                  setIsDetailOpen(false);
                  handleDelete(selectedTicket.id, selectedTicket.name);
                }}
              >
                <Trash2 size={16} />
                <span>수강권 삭제</span>
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  toggleStatus(selectedTicket.id, selectedTicket.status);
                  setSelectedTicket(prev => prev ? { ...prev, status: prev.status === '판매중' ? '판매중지' : '판매중' } : null);
                }}
                style={{
                  background: 'var(--slate-100)',
                  color: 'var(--slate-700)',
                  border: '1px solid var(--border)',
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {selectedTicket.status === '판매중' ? <PowerOff size={16} /> : <Power size={16} />}
                <span>{selectedTicket.status === '판매중' ? '판매 중지' : '판매 개시'}</span>
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsDetailOpen(false);
                  handleOpenEdit(selectedTicket);
                }}
              >
                <Edit2 size={16} />
                <span>정보 수정</span>
              </button>
            </div>
          </div>
        )}
      </SlideDialog>
    </div>
  );
}
