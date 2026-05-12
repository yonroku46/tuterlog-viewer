'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import './Login.scss';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      const msg = '로그인에 실패했습니다. 정보를 확인해주세요.';
      setError(msg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Tuterlog</h1>
          <p>배움의 기록, 오늘의 나를 완성합니다</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={stayLoggedIn} 
                onChange={(e) => setStayLoggedIn(e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              <span>로그인 상태 유지</span>
            </label>
            <Link href="/forgot-password" title="비밀번호를 잊으셨나요?" className="forgot-link">
              비밀번호 찾기
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>

        <div className="login-footer">
          계정이 없으신가요? 
          <Link href="/register">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
