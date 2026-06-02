"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/providers/AuthProvider';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import './LandingNav.scss';

export default function LandingNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="landing-nav-bar">
        <div className="landing-nav-inner">
          <div className="landing-nav-left">
            <Link href="/" className="landing-nav-logo">
              <Image src="/assets/icons/logo-wide.svg" alt="TuterLog" width={52} height={24} />
            </Link>
            
            <div className="landing-nav-pc-links">
              <Link 
                href="/pricing" 
                className="landing-nav-link"
                style={isActive('/pricing') ? { color: '#6366f1', fontWeight: 600 } : {}}
              >
                요금제
              </Link>
              <Link 
                href="/contact" 
                className="landing-nav-link"
                style={isActive('/contact') ? { color: '#6366f1', fontWeight: 600 } : {}}
              >
                문의하기
              </Link>
            </div>
          </div>

          <div className="landing-nav-right">
            <div className="landing-nav-auth-links">
              {user ? (
                <>
                  <span className="landing-nav-welcome">안녕하세요, {user.name}님</span>
                  <Link href="/portal" className="landing-nav-cta">
                    <LayoutDashboard size={15} />
                    서비스열기
                  </Link>
                </>
              ) : (
                <Link href="/login" className="landing-nav-cta">시작하기</Link>
              )}
            </div>

            <button 
              className="landing-nav-mobile-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`landing-nav-mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="landing-nav-mobile-inner">
          <div className="landing-nav-mobile-links">
            <Link 
              href="/pricing" 
              className={`landing-nav-mobile-link ${isActive('/pricing') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              요금제
            </Link>
            <Link 
              href="/contact" 
              className={`landing-nav-mobile-link ${isActive('/contact') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              문의하기
            </Link>
          </div>
          
          <div className="landing-nav-mobile-auth">
            {user ? (
              <>
                <div className="landing-nav-mobile-user">
                  <strong>{user.name}</strong>님 환영합니다
                </div>
                <Link 
                  href="/portal" 
                  className="landing-nav-mobile-cta"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  서비스 바로가기
                </Link>
              </>
            ) : (
              <Link 
                href="/login" 
                className="landing-nav-mobile-cta"
                onClick={() => setIsMenuOpen(false)}
              >
                로그인 / 시작하기
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
