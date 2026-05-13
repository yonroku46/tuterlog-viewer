'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import AuthService from '@/api/service/AuthService';
import { useSnackbar } from 'notistack';
import './Register.scss';

export default function RegisterPage() {
  const { register } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(180); // 3 minutes

  const router = useRouter();

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showVerificationInput && timer > 0 && !isEmailVerified) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showVerificationInput, timer, isEmailVerified]);

  const handleSendVerification = async () => {
    if (!formData.email) return;
    setIsVerifying(true);
    try {
      await AuthService.sendVerificationCode(formData.email);
      setShowVerificationInput(true);
      setTimer(180);
      enqueueSnackbar('인증번호가 전송되었습니다.', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.message || '인증번호 전송에 실패했습니다.', { variant: 'error' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmVerification = async () => {
    if (verificationCode.length !== 6) return;
    if (timer <= 0) {
      enqueueSnackbar('인증 시간이 만료되었습니다. 인증번호를 다시 받아주세요.', { variant: 'warning' });
      return;
    }
    try {
      const res = await AuthService.verifyCode(formData.email, verificationCode);
      if (res?.success) {
        setIsEmailVerified(true);
        enqueueSnackbar('이메일 인증이 완료되었습니다.', { variant: 'success' });
      } else {
        enqueueSnackbar('인증번호가 일치하지 않습니다.', { variant: 'error' });
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || '인증 확인 중 오류가 발생했습니다.', { variant: 'error' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) {
      enqueueSnackbar('모든 필드를 입력해주세요.', { variant: 'warning' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar('비밀번호가 일치하지 않습니다.', { variant: 'warning' });
      return;
    }

    if (!isEmailVerified) {
      enqueueSnackbar('이메일 인증을 완료해주세요.', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (res && res.success) {
        enqueueSnackbar('회원가입이 완료되었습니다. 로그인해주세요.', { variant: 'success' });
        router.push('/login');
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || '회원가입에 실패했습니다. 다시 시도해주세요.', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>회원등록</h1>
          <p>새로운 계정을 만들고 시작하세요</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">이름</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <div className="input-with-button">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isEmailVerified}
              />
              <button 
                type="button" 
                className="verify-send-btn" 
                onClick={handleSendVerification}
                disabled={!formData.email || isVerifying || isEmailVerified}
              >
                {isVerifying ? '전송 중' : isEmailVerified ? '인증됨' : '인증번호'}
              </button>
            </div>
          </div>

          {showVerificationInput && !isEmailVerified && (
            <div className="input-group verification-group">
              <label htmlFor="verificationCode">인증번호</label>
              <div className="input-with-button">
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="6자리 번호 입력"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setVerificationCode(value);
                  }}
                  maxLength={6}
                />
                <button 
                  type="button" 
                  className="verify-confirm-btn"
                  onClick={handleConfirmVerification}
                  disabled={verificationCode.length !== 6 || timer <= 0}
                >
                  확인
                </button>
              </div>
              <p className={`timer ${timer === 0 ? 'expired' : ''}`}>
                {timer === 0 ? '인증 시간이 만료되었습니다' : `남은 시간: ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
              </p>
            </div>
          )}

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="register-footer">
          이미 계정이 있으신가요? 
          <Link href="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
}
