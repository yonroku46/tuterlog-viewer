import { extend } from "lodash";

declare global {
  // Base
  interface Window {
    fbq: any;
    gtag: any;
    dataLayer: any[];
  }
  interface ApiResponse {
    resultCode: number;
    hasErrors: boolean;
    informations: Array<any>;
    errors: Array<any>;
    responseData: any;
  }
  interface ActionRes {
    success: boolean;
    id?: string;
  }
  interface ListRes<T> {
    list: Array<T>
  }
  interface CountRes {
    count: number
  }
  // Business
  type TicketType = 'GROUP' | 'PT';
  type NotificationIconType = 'LOGO' | 'AVATAR';
  type ReservationStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW';
  type ProfileMenuType = 'CENTER' | 'TICKET' | 'PRODUCT' | 'HISTORY' | 'NOTICE_SETTING' | 'SYSTEM_SETTING' | null;
  interface Ticket {
    ticketId: string;
    type: TicketType;
    name: string;
    centerName: string;
    stats: {
      available: number;
      cancelable: number;
      remaining: number | string;
    };
    dateRange: string;
    expiryDate?: string;
    remainingDays?: number;
    totalSessions?: number;
    usedSessions?: number;
    isPT?: boolean;
  }
  interface Instructor {
    instructorId: string;
    name: string;
    profileImg?: string;
    role?: string;
  }
  interface Reservation {
    reservationId: string;
    centerId: number;
    date: string;
    time: string;
    className: string;
    instructor: string;
    room: string;
    status: ReservationStatus;
    reservedCount: number;
    capacity: number;
  }
  interface Center {
    centerId: string;
    name: string;
    address: string;
    phone?: string;
  }
  interface CenterPost {
    postId: string;
    centerId: string;
    author: string;
    center: string;
    date: string;
    content: string;
    images: string[];
    likes: number;
    liked?: boolean;
    comments: CenterPostComment[];
  }
  interface CenterPostComment {
    commentId: string;
    postId: string;
    author: string;
    date: string;
    content: string;
  }
  interface ClassInfo {
    classId: string;
    startTime: string;
    endTime: string;
    name: string;
    instructor: string;
    room: string;
    reserved: number;
    capacity: number;
    waitlist?: number;
    image?: string;
  }
  interface CenterClasses {
    centerName: string;
    types: string[];
  }
  interface Notice {
    noticeId: string;
    tag: string;
    title: string;
    date: string;
    author: string;
    content: string;
    important?: boolean;
    facility?: boolean;
  }
  interface AppNotification {
    appNotificationId: string;
    title: string;
    message: string;
    time: string;
    fullDate: string;
    centerName?: string;
    isRead: boolean;
    iconType: NotificationIconType;
  }
  // UI Components
  interface TimeFilterOption {
    option: string;
    label: string;
    range: [number, number];
  }
  // API Response
  interface PaymentRes {
    orderId: string;
    success: boolean;
    redirectUri?: string;
  }
  // DB
  interface User {
    userId: string;
    userName: string;
    profileImg: string;
    mail: string;
    userIntro?: string;
    phoneNum?: string;
    birthday?: string;
    gender?: string;
    postalCode?: string;
    detailAddress?: string;
    profileImgFile?: File;
    roleId?: number;
    lineUserId?: string;
    socialProfile?: string;
  }
  interface UserProfile {
    userId: string;
    name: string;
    phone: string;
    email: string;
    profileImg?: string;
  }
  interface UserCenter extends Center {
    enrolledDate: string;
    expiredDate?: string;
  }
  interface UsageHistoryItem {
    historyId: string;
    date: string;
    type: string;
    detail: string;
  }
  interface NotificationSettings {
    classReminder: boolean;
    marketing: boolean;
  }
}

export {};