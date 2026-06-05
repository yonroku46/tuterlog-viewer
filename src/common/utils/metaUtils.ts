import { Metadata } from 'next';

type MetadataType = 'home' | 'contact' | 'pricing' | 'portal' | 'notice' | 'reserve' | 'profile' | 'lounge' |
                    'manage' | 'manage/dashboard' | 
                    'login' | 'register' | 'forgot-password';

const APP_NAME = "TuterLog";
const APP_DESCRIPTION = "선생님과 학생의 더 효율적인 클래스 관리를 돕는 스마트 매니저";
const APP_URL = process.env.NEXT_PUBLIC_APP_ADDRESS || "http://localhost:3000";

const PAGE_INFO: Record<MetadataType, { title: string; description?: string }> = {
  home: {
    title: '언어 교육 스마트 매니저',
    description: APP_DESCRIPTION
  },
  contact: {
    title: '문의하기',
    description: '서비스에 대한 문의사항이나 제안을 남겨주시면 신속하게 답변해드리겠습니다.'
  },
  pricing: {
    title: '요금제',
    description: `${APP_NAME}의 합리적인 요금제를 확인하세요. 무료플랜으로 부담없이 시작할 수도 있습니다.`
  },
  portal: {
    title: '홈',
    description: `${APP_NAME}에서 센터와 수업을 한번에 관리하세요.`
  },
  notice: {
    title: '공지사항',
    description: '센터의 새로운 소식과 안내사항을 확인하세요.'
  },
  reserve: {
    title: '수업예약',
    description: '원하는 강사님과 수업 일정을 선택하여 예약하세요.'
  },
  profile: {
    title: '마이페이지',
    description: '개인 정보 및 활동 내역을 관리하세요.'
  },
  lounge: {
    title: '라운지',
    description: '센터 회원들과 소통하고 정보를 공유하는 커뮤니티 공간입니다.'
  },
  login: {
    title: '로그인',
    description: `${APP_NAME} 계정으로 로그인하여 서비스를 이용하세요.`
  },
  register: {
    title: '회원가입',
    description: `${APP_NAME}의 새로운 회원이 되어 스마트한 클래스 관리를 시작하세요.`
  },
  'forgot-password': {
    title: '비밀번호 찾기',
    description: '잊으신 비밀번호를 안전하게 찾고 재설정하세요.'
  },
  manage: {
    title: '관리',
    description: `${APP_NAME}에서 수업과 고객을 효율적으로 관리하세요.`
  },
  'manage/dashboard': {
    title: '대시보드',
    description: `센터의 수업 스케줄과 매출 현황을 한눈에 확인할 수 있습니다.`
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
