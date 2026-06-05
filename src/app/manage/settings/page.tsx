'use client';

import React, { useState, useEffect } from 'react';
import { useManage } from '../ManageContext';
import { Save, Upload, MapPin, Phone, FileText, Clock, Image as ImageIcon, Building } from 'lucide-react';
import { useSnackbar } from 'notistack';
import '@/app/portal/Portal.scss';
import '../ManageLayout.scss';

export default function ManageSettings() {
  const { selectedCenter, setSelectedCenter, centers } = useManage();
  const { enqueueSnackbar } = useSnackbar();

  // Form states
  const [centerName, setCenterName] = useState('');
  const [phone, setPhone] = useState('02-1234-5678');
  const [address, setAddress] = useState('서울시 마포구 독막로 120, 3층');
  const [businessNum, setBusinessNum] = useState('120-81-23456');
  const [cancelPolicy, setCancelPolicy] = useState('24'); // hours before class
  const [operatingHours, setOperatingHours] = useState('평일 09:00 - 22:00 / 토요일 10:00 - 18:00 (일요일 휴무)');
  
  // Mock image states
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<string | null>(null);

  // Sync state with selected center
  useEffect(() => {
    if (selectedCenter) {
      setCenterName(selectedCenter.name);
    }
  }, [selectedCenter]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(URL.createObjectURL(file));
      enqueueSnackbar('로고 이미지가 업로드되었습니다.', { variant: 'success' });
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(URL.createObjectURL(file));
      enqueueSnackbar('커버 이미지가 업로드되었습니다.', { variant: 'success' });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerName) {
      enqueueSnackbar('센터 이름은 반드시 입력해야 합니다.', { variant: 'error' });
      return;
    }

    // Mock update: change name in context if possible
    if (selectedCenter) {
      const updated = { ...selectedCenter, name: centerName };
      // Note: in a real app, this would trigger an API call.
      // For this mock, we can temporarily update the local selectedCenter reference name
      selectedCenter.name = centerName;
      setSelectedCenter(selectedCenter);
    }

    enqueueSnackbar('센터 설정 정보가 정상적으로 저장되었습니다.', { variant: 'success' });
  };

  return (
    <div className="manage-settings-page">
      <div className="page-header-row">
        <div>
          <h2>센터 정보 및 설정</h2>
          <p>수강생들에게 노출될 학원/센터 정보 및 예약 취소 정책을 설정합니다.</p>
        </div>
        <button type="submit" form="settings-form" className="add-btn">
          <Save size={18} />
          <span>설정 저장하기</span>
        </button>
      </div>

      <form id="settings-form" className="settings-container-form" onSubmit={handleSave}>
        <div className="settings-layout-grid">
          
          {/* ── LEFT COLUMN: CORE INFO ── */}
          <div className="settings-card core-info-card">
            <h3><Building size={18} /><span>기본 센터 정보</span></h3>
            
            <div className="form-group">
              <label>센터(학원) 명칭 *</label>
              <input 
                type="text" 
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                placeholder="센터 이름 입력" 
                required
              />
            </div>

            <div className="form-group">
              <label>대표 전화번호</label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="예: 02-1234-5678" 
                />
              </div>
            </div>

            <div className="form-group">
              <label>센터 주소</label>
              <div className="input-with-icon">
                <MapPin size={16} className="input-icon" />
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="도로명 또는 지번 주소 입력" 
                />
              </div>
            </div>

            <div className="form-group">
              <label>사업자 등록 번호</label>
              <div className="input-with-icon">
                <FileText size={16} className="input-icon" />
                <input 
                  type="text" 
                  value={businessNum}
                  onChange={(e) => setBusinessNum(e.target.value)}
                  placeholder="예: 120-00-00000" 
                />
              </div>
            </div>

            <div className="form-group">
              <label>운영 시간 정보</label>
              <div className="input-with-icon">
                <Clock size={16} className="input-icon" />
                <input 
                  type="text" 
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="예: 평일 09:00 - 22:00" 
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: IMAGES & POLICIES ── */}
          <div className="settings-right-column">
            
            {/* Image Upload Cards */}
            <div className="settings-card image-settings-card">
              <h3><ImageIcon size={18} /><span>이미지 설정</span></h3>
              
              <div className="image-pickers-row">
                {/* Logo Picker */}
                <div className="image-picker-box logo-box">
                  <span className="label">센터 로고</span>
                  <div className="preview-container logo-preview">
                    {logoFile ? (
                      <img src={logoFile} alt="Logo" />
                    ) : (
                      <div className="placeholder"><Building size={32} /></div>
                    )}
                    <label className="upload-overlay">
                      <Upload size={16} />
                      <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                {/* Cover Picker */}
                <div className="image-picker-box cover-box">
                  <span className="label">대표 커버 이미지</span>
                  <div className="preview-container cover-preview">
                    {coverFile ? (
                      <img src={coverFile} alt="Cover" />
                    ) : (
                      <div className="placeholder"><ImageIcon size={32} /></div>
                    )}
                    <label className="upload-overlay">
                      <Upload size={16} />
                      <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Settings Card */}
            <div className="settings-card policy-settings-card">
              <h3><FileText size={18} /><span>운영 및 예약 정책</span></h3>

              <div className="form-group">
                <label>예약 취소 가능 기한</label>
                <select 
                  value={cancelPolicy}
                  onChange={(e) => setCancelPolicy(e.target.value)}
                >
                  <option value="12">수업 시작 12시간 전까지</option>
                  <option value="24">수업 시작 24시간 전까지 (1일 전)</option>
                  <option value="48">수업 시작 48시간 전까지 (2일 전)</option>
                  <option value="0">취소 기한 제한 없음 (언제든 취소 가능)</option>
                </select>
                <p className="help-text">이 기한이 지난 예약은 수강생이 앱에서 스스로 취소할 수 없으며, 관리자가 수동으로 처리해야 합니다.</p>
              </div>

              <div className="form-group">
                <label>대기 예약 자동 확정 정책</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>정원 이탈 발생 시 대기자 순차적 자동 승인</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
