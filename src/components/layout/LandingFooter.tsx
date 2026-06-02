"use client";

import Link from 'next/link';
import "./LandingFooter.scss";

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div>
          <Link href="/" className="landing-footer-logo">
            TuterLog
          </Link>
          <p className="landing-footer-copy">© 2026 TuterLog. All rights reserved.</p>
        </div>
        <div className="landing-footer-links">
          <Link href="/docs/terms">이용약관</Link>
          <Link href="/docs/privacy">개인정보처리방침</Link>
          <Link href="/contact">문의하기</Link>
        </div>
      </div>
    </footer>
  );
}
