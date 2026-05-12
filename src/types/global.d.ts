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
  type ReservationStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW' | 'WAITING';
  type ProfileMenuType = 'CENTER' | 'EDIT_PROFILE' | 'TICKET' | 'PRODUCT' | 'HISTORY' | 'NOTICE_SETTING' | 'SYSTEM_SETTING' | null;
  interface Ticket {
    ticketId: string;
    userId?: string;
    centerId?: string;
    ticketType: TicketType;
    title: string;
    subTitle: string;
    centerName: string;
    stats: {
      available: number;
      cancelable: number;
      remaining: number | string;
    };
    startDate: string;
    endDate: string;
    remainingDays?: number;
    totalSessions?: number;
    usedSessions?: number;
    isPT?: boolean;
    createTime: string;
  }
  interface Instructor {
    instructorId: string;
    centerId: string;
    name: string;
    profileImg?: string;
    role?: string;
    createTime: string;
  }
  interface Reservation {
    reservationId: string;
    userId?: string;
    classId: string;
    centerId: string;
    reservationDate: string;
    startTime: string;
    endTime: string;
    className: string;
    instructor: Instructor;
    room: string;
    status: ReservationStatus;
    reservedCount: number;
    capacity: number;
    createTime: string;
  }
  interface Center {
    centerId: string;
    name: string;
    address: string;
    phone?: string;
    createTime: string;
  }
  interface CenterPost {
    postId: string;
    centerId: string;
    authorId?: string;
    center: string;
    content: string;
    images: string[];
    likes: number;
    liked?: boolean;
    comments: CenterPostComment[];
    createTime: string;
  }
  interface CenterPostRes extends CenterPost{
    author: UserProfile;
  }
  interface CenterPostComment {
    commentId: string;
    postId: string;
    authorId?: string;
    content: string;
    createTime: string;
  }
  interface CenterPostCommentRes extends CenterPostComment {
    author: UserProfile;
  }
  interface ClassInfo {
    classId: string;
    centerId?: string;
    startTime: string;
    endTime: string;
    name: string;
    instructor: Instructor;
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
    centerId?: string;
    tag: string;
    title: string;
    authorId?: string;
    content: string;
    important?: boolean;
    facility?: boolean;
    createTime: string;
  }
  interface NoticeRes extends Notice {
    author: UserProfile;
  }
  interface AppNotification {
    appNotificationId: string;
    userId: string;
    centerId?: string;
    title: string;
    message: string;
    centerName?: string;
    isRead: boolean;
    iconType: NotificationIconType;
    createTime: string;
  }
  // UI Components
  interface TimeFilterOption {
    option: string;
    label: string;
    range: [number, number];
  }
  // API Response
  export interface LoginUserRes {
    userId: string;
    name: string;
    profileImg: string;
    email: string;
    gender: string;
    token: string;
    refreshToken: string;
  }
  // DB
  interface UserProfile {
    userId: string;
    name: string;
    phone: string;
    email: string;
    gender?: string;
    profileImg?: string;
    classReminder: boolean;
    marketing: boolean;
    lastUpdated: string;
    createTime: string;
  }
  interface UserCenter extends Center {
    enrolledDate: string;
    expiredDate?: string;
  }
  interface UsageHistoryItem {
    historyId: string;
    contentType: string;
    contentDetail: string;
    createTime: string;
  }
}

export {};