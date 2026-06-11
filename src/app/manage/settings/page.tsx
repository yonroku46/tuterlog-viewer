'use client';

import React, { useState, useEffect } from 'react';
import AppImage from '@/components/contents/AppImage';
import { Save, Upload, MapPin, Phone, FileText, Clock, Building } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useManage } from '../ManageContext';
import ManageService from '@/api/service/ManageService';
import '../ManageLayout.scss';

export default function ManageSettings() {
  const { selectedCenter, setSelectedCenter } = useManage();
  const { enqueueSnackbar } = useSnackbar();

  // Form states
  const [centerName, setCenterName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [businessNum, setBusinessNum] = useState('');
  const [cancelNoLimit, setCancelNoLimit] = useState(false);
  const [cancelValue, setCancelValue] = useState(24);
  const [cancelUnit, setCancelUnit] = useState<LimitUnitType>('HOUR');
  const [bookingNoLimit, setBookingNoLimit] = useState(false);
  const [bookingLimitValue, setBookingLimitValue] = useState(1);
  const [bookingLimitUnit, setBookingLimitUnit] = useState<LimitUnitType>('HOUR');
  const [operatingHours, setOperatingHours] = useState('');
  
  // Loading & Image states
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  // Sync state with selected center
  useEffect(() => {
    const loadCenterInfo = async () => {
      setIsLoading(true);
      try {
        const data = await ManageService.getCenterInfo();
        if (data) {
          setCenterName(data.name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setBusinessNum(data.businessNum || '');
          setCancelNoLimit(data.cancelNoLimit ?? false);
          setCancelValue(data.cancelValue ?? 24);
          setCancelUnit(data.cancelUnit ?? 'HOUR');
          setBookingNoLimit(data.bookingNoLimit ?? false);
          setBookingLimitValue(data.bookingLimitValue ?? 1);
          setBookingLimitUnit(data.bookingLimitUnit ?? 'HOUR');
          setOperatingHours(data.operatingHours || '');
          setLogoPreviewUrl(data.logoImg || null);
          // Context 동기화
          setSelectedCenter(data as UserCenter);
        } else {
          if (selectedCenter) {
            setCenterName(selectedCenter.name || '');
            setPhone(selectedCenter.phone || '');
            setAddress(selectedCenter.address || '');
          }
          setBusinessNum('');
          setCancelNoLimit(false);
          setCancelValue(24);
          setCancelUnit('HOUR');
          setBookingNoLimit(false);
          setBookingLimitValue(1);
          setBookingLimitUnit('HOUR');
          setOperatingHours('');
          setLogoPreviewUrl(null);
        }
      } catch (e) {
        console.error('[ManageSettings] loadCenterInfo error', e);
        if (selectedCenter) {
          setCenterName(selectedCenter.name || '');
          setPhone(selectedCenter.phone || '');
          setAddress(selectedCenter.address || '');
        }
        setLogoPreviewUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadCenterInfo();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreviewUrl(reader.result as string);
        enqueueSnackbar('로고 이미지가 선택되었습니다. 설정 저장하기를 누르면 최종 반영됩니다.', { variant: 'success' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerName) {
      enqueueSnackbar('센터 이름은 반드시 입력해야 합니다.', { variant: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await ManageService.updateCenterInfo({
        name: centerName,
        phone,
        address,
        businessNum,
        operatingHours,
        cancelNoLimit,
        cancelValue,
        cancelUnit,
        bookingNoLimit,
        bookingLimitValue,
        bookingLimitUnit,
        logoImg: logoPreviewUrl,
      });

      if (res && res.success) {
        if (selectedCenter) {
          const updated = { 
            ...selectedCenter, 
            name: centerName,
            phone: phone,
            address: address
          };
          setSelectedCenter(updated);
        }
        enqueueSnackbar('센터 설정 정보가 정상적으로 저장되었습니다.', { variant: 'success' });
      } else {
        enqueueSnackbar('센터 설정 저장에 실패했습니다.', { variant: 'error' });
      }
    } catch (error) {
      console.error('[ManageSettings] handleSave error', error);
      enqueueSnackbar('센터 설정 저장 중 오류가 발생했습니다.', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="manage-settings-page">
      <div className="page-header-row">
        <div>
          <h2>센터 정보 및 설정</h2>
          <p>수강생들에게 노출될 센터/학원 정보 및 예약 취소 정책을 설정합니다.</p>
        </div>
        <button type="submit" form="settings-form" className="add-btn" disabled={isLoading}>
          <Save size={18} />
          <span>{isLoading ? '저장 중...' : '설정 저장하기'}</span>
        </button>
      </div>

      <form 
        id="settings-form" 
        className="settings-container-form" 
        onSubmit={handleSave}
        style={isLoading ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
      >
        <div className="settings-layout-grid">
          
          {/* ── LEFT COLUMN: CORE INFO ── */}
          <div className="settings-card core-info-card">
            <h3><Building size={18} /><span>기본 센터 정보</span></h3>
            
            {/* Logo Picker */}
            <div className="image-picker-box logo-box">
              <span className="label">센터 로고</span>
              <div className="preview-container logo-preview">
                {logoPreviewUrl ? (
                  <AppImage src={logoPreviewUrl} alt="Logo" width={78} height={78} />
                ) : (
                  <div className="placeholder"><Building size={32} /></div>
                )}
                <label className="upload-overlay">
                  <Upload size={16} />
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>센터/학원 명칭 *</label>
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

          {/* ── RIGHT COLUMN: POLICIES ── */}
          <div className="settings-right-column">
            
            {/* Policy Settings Card */}
            <div className="settings-card policy-settings-card">
              <h3><FileText size={18} /><span>운영 및 예약 정책</span></h3>

              <div className="form-group">
                <label>예약 취소 가능 기한</label>
                <div className="checkbox-group" style={{ marginBottom: '0.25rem' }}>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={cancelNoLimit} 
                      onChange={(e) => setCancelNoLimit(e.target.checked)} 
                    />
                    <span>취소 기한 제한 없음 (언제든 취소 가능)</span>
                  </label>
                </div>
                {!cancelNoLimit && (
                  <div className="policy-input-row">
                    <input 
                      type="number" 
                      value={cancelValue} 
                      onChange={(e) => setCancelValue(Math.max(0, parseInt(e.target.value) || 0))} 
                      min="0"
                    />
                    <select 
                      value={cancelUnit} 
                      onChange={(e) => setCancelUnit(e.target.value as LimitUnitType)}
                    >
                      <option value="HOUR">시간 전까지</option>
                      <option value="MINUTE">분 전까지</option>
                    </select>
                    <span>취소 가능</span>
                  </div>
                )}
                <p className="help-text">이 기한이 지난 예약은 수강생이 앱에서 스스로 취소할 수 없으며, 관리자가 수동으로 처리해야 합니다.</p>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>예약 가능 기한</label>
                <div className="checkbox-group" style={{ marginBottom: '0.25rem' }}>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={bookingNoLimit} 
                      onChange={(e) => setBookingNoLimit(e.target.checked)} 
                    />
                    <span>예약 기한 제한 없음 (수업 시작 전까지 언제든 예약 가능)</span>
                  </label>
                </div>
                {!bookingNoLimit && (
                  <div className="policy-input-row">
                    <input 
                      type="number" 
                      value={bookingLimitValue} 
                      onChange={(e) => setBookingLimitValue(Math.max(0, parseInt(e.target.value) || 0))} 
                      min="0"
                    />
                    <select 
                      value={bookingLimitUnit} 
                      onChange={(e) => setBookingLimitUnit(e.target.value as LimitUnitType)}
                    >
                      <option value="HOUR">시간 전까지</option>
                      <option value="MINUTE">분 전까지</option>
                    </select>
                    <span>예약 가능</span>
                  </div>
                )}
                <p className="help-text">이 기한이 지난 수업은 수강생이 앱에서 스스로 예약할 수 없습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
