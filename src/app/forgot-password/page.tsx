'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthService from '@/api/service/AuthService';
import { useSnackbar } from 'notistack';
import './ForgotPassword.scss';

export default function ForgotPasswordPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [step, setStep] = useState(1); // 1: Email, 2: Verification, 3: New Password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(180);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await AuthService.forgotPassword(email);
      setStep(2);
      setTimer(180);
      enqueueSnackbar('인증번호가 전송되었습니다.', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.message || '인증번호 전송에 실패했습니다.', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timer <= 0) {
      enqueueSnackbar('인증 시간이 만료되었습니다. 인증번호를 다시 받아주세요.', { variant: 'warning' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await AuthService.verifyCode(email, verificationCode);
      if (res?.success) {
        setStep(3);
        enqueueSnackbar('인증되었습니다.', { variant: 'success' });
      } else {
        enqueueSnackbar('인증번호가 일치하지 않습니다.', { variant: 'error' });
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || '인증 확인 중 오류가 발생했습니다.', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      enqueueSnackbar('비밀번호가 일치하지 않습니다.', { variant: 'warning' });
      return;
    }
    setIsLoading(true);
    try {
      await AuthService.resetPassword({ email, verificationCode, newPassword });
      enqueueSnackbar('비밀번호가 성공적으로 변경되었습니다.', { variant: 'success' });
      router.replace('/login');
    } catch (err: any) {
      enqueueSnackbar(err.message || '비밀번호 재설정에 실패했습니다.', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>비밀번호 찾기</h1>
          <p>
            {step === 1 && '가입하신 이메일 주소를 입력해주세요'}
            {step === 2 && '이메일로 전송된 인증번호를 입력해주세요'}
            {step === 3 && '새로운 비밀번호를 설정해주세요'}
          </p>
        </div>

        {step === 1 && (
          <form className="forgot-password-form" onSubmit={handleSendCode}>
            <div className="input-group">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="forgot-password-button" disabled={isLoading}>
              {isLoading ? '전송 중...' : '인증번호 받기'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="forgot-password-form" onSubmit={handleVerifyCode}>
            <div className="input-group">
              <label htmlFor="code">인증번호</label>
              <div className="input-with-timer">
                <input
                  id="code"
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
                  required
                />
                <span className={`timer ${timer === 0 ? 'expired' : ''}`}>
                  {timer === 0 ? '만료' : `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
                </span>
              </div>
            </div>
            <button type="submit" className="forgot-password-button" disabled={isLoading || timer <= 0}>
              {isLoading ? '확인 중...' : '인증번호 확인'}
            </button>
            <button type="button" className="resend-btn" onClick={handleSendCode}>
              인증번호 재전송
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="forgot-password-form" onSubmit={handleResetPassword}>
            <div className="input-group">
              <label htmlFor="newPassword">새 비밀번호</label>
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirmPassword">새 비밀번호 확인</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="forgot-password-button" disabled={isLoading}>
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}

        <div className="forgot-password-footer">
          <Link href="/login">로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}
