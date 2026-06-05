'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { ManageProvider, useManage } from './ManageContext';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Bell, Menu, X, Building, GraduationCap, Ticket } from 'lucide-react';
import './ManageLayout.scss';

function ManageLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { selectedCenter, isLoadingCenters } = useManage();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: '대시보드', href: '/manage/dashboard', icon: LayoutDashboard },
    { label: '고객 관리', href: '/manage/customers', icon: Users },
    { label: '수강권 관리', href: '/manage/tickets', icon: Ticket },
    { label: '강사 관리', href: '/manage/instructors', icon: GraduationCap },
    { label: '수업 관리', href: '/manage/classes', icon: Calendar },
    { label: '센터 설정', href: '/manage/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    const item = menuItems.find(item => pathname.startsWith(item.href));
    return item ? item.label : '센터 관리';
  };

  return (
    <div className="manage-layout">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="manage-sidebar">
        <div className="sidebar-brand">
          <Link href="/" className="brand-logo">
            <Image src="/assets/icons/logo-wide.svg" alt="TuterLog" width={54} height={26} />
          </Link>
        </div>

        {/* Sidebar Nav Menu */}
        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        {user && (
          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="avatar">
                {user.profileImg ? (
                  <img src={user.profileImg} alt={user.name} />
                ) : (
                  <span className="avatar-initial">{user.name.charAt(0)}</span>
                )}
              </div>
              <div className="user-meta">
                <span className="name">{user.name}</span>
                <span className="email">{user.email}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={logout} title="로그아웃">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="manage-main-wrapper">
        {/* Responsive Top Header */}
        <header className="manage-top-header">
          <div className="header-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          <div className="header-right">
            <div className="current-center-badge">
              <Building size={14} />
              <span>{selectedCenter?.name ?? '소속 없음'}</span>
            </div>
            <button className="notification-btn">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="manage-viewport">
          {children}
        </main>
      </div>

      {/* ── MOBILE MENU OVERLAY (Drawer) ── */}
      <div className={`manage-mobile-menu-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="drawer-inner">
          <div className="drawer-header">
            <span className="drawer-title">메뉴</span>
            <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="drawer-nav">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`drawer-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="drawer-footer">
              <div className="user-info">
                <div className="avatar">
                  {user.profileImg ? (
                    <img src={user.profileImg} alt={user.name} />
                  ) : (
                    <span>{user.name.charAt(0)}</span>
                  )}
                </div>
                <div className="meta">
                  <div className="name">{user.name}님</div>
                  <div className="email">{user.email}</div>
                </div>
              </div>
              <button 
                className="drawer-logout-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div 
        className={`manage-mobile-drawer-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}

export default function ManageLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ManageProvider>
      <ManageLayoutInner>{children}</ManageLayoutInner>
    </ManageProvider>
  );
}
