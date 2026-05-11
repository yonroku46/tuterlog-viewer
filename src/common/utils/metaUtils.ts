import { Metadata } from 'next';

type MetadataType = 'home' | 'notice' | 'reserve' | 'tickets' | 'profile' | 'lounge';

const APP_NAME = "TuterLog";
const APP_DESCRIPTION = "선생님과 학생의 더 효율적인 클래스 관리를 돕는 스마트 매니저";
const APP_URL = process.env.NEXT_PUBLIC_APP_ADDRESS || "http://localhost:3000";

const PAGE_INFO: Record<MetadataType, { title: string; description?: string }> = {
  home: {
    title: '언어 교육 스마트 매니저',
    description: APP_DESCRIPTION
  },
  notice: {
    title: '공지사항',
    description: '센터의 새로운 소식과 안내사항을 확인하세요.'
  },
  reserve: {
    title: '수업 예약',
    description: '원하는 강사님과 수업 일정을 선택하여 예약하세요.'
  },
  tickets: {
    title: '수강권 관리',
    description: '나의 수강권 현황과 이용 내역을 확인하세요.'
  },
  profile: {
    title: '마이페이지',
    description: '개인 정보 및 활동 내역을 관리하세요.'
  },
  lounge: {
    title: '라운지',
    description: '센터 회원들과 소통하고 정보를 공유하는 커뮤니티 공간입니다.'
  }
};

export function generatePageMetadata(type: MetadataType): Metadata {
  const info = PAGE_INFO[type];
  const title = info.title;
  const description = info.description || APP_DESCRIPTION;

  return {
    metadataBase: new URL(APP_URL),
    title: type === 'home' ? {
      default: APP_NAME,
      template: `%s | ${APP_NAME}`,
    } : title,
    description,
    keywords: ['고객관리', '강사관리', '클래스관리', '스케줄러', 'TuterLog', '튜터로그'],
    authors: [{ name: 'TuterLog' }],
    creator: 'TuterLog',
    publisher: 'TuterLog',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      siteName: APP_NAME,
      title: `${title} | ${APP_NAME}`,
      description,
      url: APP_URL,
      images: [
        {
          url: '/assets/icons/favicon.svg',
          width: 1200,
          height: 630,
          alt: APP_NAME,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${APP_NAME}`,
      description,
      images: ['/assets/icons/favicon.svg'],
    },
    icons: {
      icon: [
        { url: '/assets/icons/favicon.ico', sizes: 'any' },
        { url: '/assets/icons/favicon.svg', type: 'image/svg+xml' }
      ],
      apple: [
        { url: '/assets/icons/favicon.svg' }
      ],
    },
    manifest: '/manifest.json',
  };
}
